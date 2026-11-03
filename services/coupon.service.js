const Coupon = require("../models/coupon.model");
const ApiError = require("../utils/apiError");
const { round2 } = require("../utils/pricing");

class CouponService {
    async createCoupon(data) {
        const { code, discountPercent, minOrderAmount, expiresAt } = data;
        if (!code || !discountPercent) {
            throw new ApiError(400, "Coupon code and discount percent are required");
        }
        const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
        if (existing) {
            throw new ApiError(400, "Coupon code already exists");
        }
        return Coupon.create({
            code: code.trim().toUpperCase(),
            discountPercent,
            minOrderAmount,
            expiresAt,
        });
    }

    async getCoupons() {
        return Coupon.find().sort({ createdAt: -1 });
    }

    async validateCoupon(code, subtotal) {
        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
        if (!coupon || !coupon.isActive) {
            throw new ApiError(400, "Invalid coupon code");
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            throw new ApiError(400, "Coupon has expired");
        }
        if (subtotal < coupon.minOrderAmount) {
            throw new ApiError(400, `Coupon requires a minimum order of $${coupon.minOrderAmount}`);
        }
        return coupon;
    }

    async previewCoupon(code, subtotal) {
        const coupon = await this.validateCoupon(code, subtotal);
        return {
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            discount: round2((subtotal * coupon.discountPercent) / 100),
        };
    }
}

module.exports = new CouponService();
