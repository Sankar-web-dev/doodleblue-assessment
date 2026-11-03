const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get('/', couponController.getCoupons);
router.post('/', couponController.createCoupon);
router.post('/validate', couponController.previewCoupon);

module.exports = router;
