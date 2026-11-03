const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/apiError");
const couponService = require("./coupon.service");
const { computeTotals, round2 } = require("../utils/pricing");

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

class OrderService {
    async createOrder(userId, data) {
        const { items, couponCode, shippingAddress } = data || {};
        if (!Array.isArray(items) || !items.length) {
            throw new ApiError(400, "Order items are required");
        }

        const quantities = new Map();
        for (const item of items) {
            const quantity = Number(item.quantity);
            if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
                throw new ApiError(400, "Each item must have a productId and a quantity of at least 1");
            }
            quantities.set(item.productId, (quantities.get(item.productId) || 0) + quantity);
        }

        const orderItems = [];
        for (const [productId, quantity] of quantities) {
            if (!mongoose.isValidObjectId(productId)) {
                throw new ApiError(400, `Invalid product id: ${productId}`);
            }
            const product = await Product.findOne({ _id: productId, isActive: true });
            if (!product) {
                throw new ApiError(404, `Product not found: ${productId}`);
            }
            if (product.stock < quantity) {
                throw new ApiError(400, `"${product.name}" only has ${product.stock} left in stock`);
            }
            orderItems.push({ product, quantity });
        }

        const subtotal = round2(orderItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0));
        const coupon = couponCode ? await couponService.validateCoupon(couponCode, subtotal) : null;
        const totals = computeTotals(
            orderItems.map((i) => ({ price: i.product.price, quantity: i.quantity })),
            coupon
        );

        const order = await Order.create({
            user: userId,
            items: orderItems.map((i) => ({
                product: i.product._id,
                name: i.product.name,
                image: i.product.images && i.product.images.length ? i.product.images[0] : "",
                price: i.product.price,
                quantity: i.quantity,
            })),
            subtotal: totals.subtotal,
            couponCode: coupon ? coupon.code : null,
            couponDiscount: totals.couponDiscount,
            shipping: totals.shipping,
            total: totals.total,
            shippingAddress: shippingAddress || {},
        });

        await Promise.all(
            orderItems.map((i) =>
                Product.findByIdAndUpdate(i.product._id, { $inc: { stock: -i.quantity } })
            )
        );

        return order;
    }

    async getMyOrders(userId, query) {
        const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));

        const [orders, total] = await Promise.all([
            Order.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Order.countDocuments({ user: userId }),
        ]);

        return {
            orders,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }

    async getOrderById(userId, orderId) {
        if (!mongoose.isValidObjectId(orderId)) {
            throw new ApiError(400, "Invalid order id");
        }
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            throw new ApiError(404, "Order not found");
        }
        return order;
    }

    async cancelOrder(userId, orderId) {
        const order = await this.getOrderById(userId, orderId);
        if (["shipped", "delivered"].includes(order.status)) {
            throw new ApiError(400, `Order already ${order.status} and cannot be cancelled`);
        }
        if (order.status === "cancelled") {
            throw new ApiError(400, "Order is already cancelled");
        }
        order.status = "cancelled";
        await order.save();
        await this._restock(order);
        return order;
    }

    async updateOrderStatus(orderId, status) {
        if (!mongoose.isValidObjectId(orderId)) {
            throw new ApiError(400, "Invalid order id");
        }
        if (!ORDER_STATUSES.includes(status)) {
            throw new ApiError(400, `Status must be one of: ${ORDER_STATUSES.join(", ")}`);
        }
        const order = await Order.findById(orderId);
        if (!order) {
            throw new ApiError(404, "Order not found");
        }
        const wasCancelled = order.status === "cancelled";
        order.status = status;
        await order.save();
        if (status === "cancelled" && !wasCancelled) {
            await this._restock(order);
        }
        return order;
    }

    async _restock(order) {
        await Promise.all(
            order.items.map((i) =>
                Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } })
            )
        );
    }
}

module.exports = new OrderService();
