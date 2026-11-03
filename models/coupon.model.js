const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Coupon code is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercent: {
        type: Number,
        required: [true, "Discount percent is required"],
        min: 1,
        max: 100
    },
    minOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    expiresAt: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
},
{
    timestamps: true,
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
