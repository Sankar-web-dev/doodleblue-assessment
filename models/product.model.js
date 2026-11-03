const mongoose = require("mongoose");
const { LOW_STOCK_THRESHOLD } = require("../utils/pricing");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"]
    },
    brand: {
        type: String,
        trim: true,
        default: "Kadai Basics"
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: 0
    },
    comparePrice: {
        type: Number,
        min: 0,
        default: 0
    },
    images: {
        type: [String],
        default: []
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    tags: {
        type: [String],
        default: []
    },
    specifications: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    returnPolicy: {
        type: String,
        default: "7-day returns"
    },
    warrantyInformation: {
        type: String,
        default: "1 year warranty"
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

productSchema.virtual("discountPercentage").get(function () {
    if (!this.comparePrice || this.comparePrice <= this.price) return 0;
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

productSchema.virtual("stockStatus").get(function () {
    if (this.stock <= 0) return "out_of_stock";
    if (this.stock <= LOW_STOCK_THRESHOLD) return "low_stock";
    return "in_stock";
});

productSchema.index({ category: 1, price: 1 });
productSchema.index({ isActive: 1, isFeatured: -1, rating: -1 });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
