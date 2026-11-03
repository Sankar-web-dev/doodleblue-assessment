const couponService = require("../services/coupon.service");

class CouponController {
    async createCoupon(req, res) {
        try {
            const coupon = await couponService.createCoupon(req.body);
            res.status(201).json(coupon);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async previewCoupon(req, res) {
        try {
            const { code, subtotal } = req.body;
            if (!code) {
                return res.status(400).json({ message: "Coupon code is required" });
            }
            const result = await couponService.previewCoupon(code, Number(subtotal) || 0);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async getCoupons(req, res) {
        try {
            const coupons = await couponService.getCoupons();
            res.status(200).json(coupons);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}

module.exports = new CouponController();
