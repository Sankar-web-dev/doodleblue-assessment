const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5.99;
const LOW_STOCK_THRESHOLD = 10;

const round2 = (value) => Math.round(value * 100) / 100;

function computeTotals(items, coupon) {
    const subtotal = round2(
        items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
    const couponDiscount = coupon && coupon.discountPercent
        ? round2((subtotal * coupon.discountPercent) / 100)
        : 0;
    const payable = subtotal - couponDiscount;
    const shipping = payable <= 0 || payable >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = round2(payable + shipping);

    return { subtotal, couponDiscount, shipping, total };
}

module.exports = {
    computeTotals,
    round2,
    FREE_SHIPPING_THRESHOLD,
    SHIPPING_FEE,
    LOW_STOCK_THRESHOLD,
};
