const orderService = require("../services/order.service");

class OrderController {
    async createOrder(req, res) {
        try {
            const order = await orderService.createOrder(req.user.id, req.body);
            res.status(201).json(order);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async getMyOrders(req, res) {
        try {
            const result = await orderService.getMyOrders(req.user.id, req.query);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async getOrderById(req, res) {
        try {
            const order = await orderService.getOrderById(req.user.id, req.params.id);
            res.status(200).json(order);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async cancelOrder(req, res) {
        try {
            const order = await orderService.cancelOrder(req.user.id, req.params.id);
            res.status(200).json(order);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { status } = req.body;
            const order = await orderService.updateOrderStatus(req.params.id, status);
            res.status(200).json(order);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}

module.exports = new OrderController();
