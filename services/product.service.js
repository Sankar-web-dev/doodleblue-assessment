const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const ApiError = require("../utils/apiError");

const SORT_OPTIONS = {
    featured: { isFeatured: -1, rating: -1, createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    rating: { rating: -1, reviewCount: -1 },
    newest: { createdAt: -1 },
};

const PRODUCT_FIELDS = [
    "name", "description", "category", "brand", "price", "comparePrice",
    "images", "stock", "tags", "specifications", "returnPolicy",
    "warrantyInformation", "isFeatured", "isActive", "rating", "reviewCount",
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

class ProductService {
    async getProducts(query) {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            minRating,
            featured,
            sort = "featured",
            page = 1,
            limit = 12,
        } = query;

        const filter = { isActive: true };

        if (search && search.trim()) {
            const regex = new RegExp(escapeRegex(search.trim()), "i");
            filter.$or = [
                { name: regex },
                { brand: regex },
                { description: regex },
                { tags: regex },
            ];
        }

        if (category && category.trim()) {
            const values = category.split(",").map((v) => v.trim()).filter(Boolean);
            const ids = values.filter((v) => mongoose.isValidObjectId(v));
            const byName = values.filter((v) => !mongoose.isValidObjectId(v));
            if (byName.length) {
                const matched = await Category.find({
                    $or: [
                        { name: { $in: byName.map((v) => new RegExp(`^${escapeRegex(v)}$`, "i")) } },
                        { slug: { $in: byName.map(slugify) } },
                    ],
                }).select("_id");
                ids.push(...matched.map((c) => c._id));
            }
            filter.category = ids.length ? { $in: ids } : null;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined && minPrice !== "") filter.price.$gte = Number(minPrice);
            if (maxPrice !== undefined && maxPrice !== "") filter.price.$lte = Number(maxPrice);
        }

        if (minRating) {
            filter.rating = { $gte: Number(minRating) };
        }

        if (featured === "true") {
            filter.isFeatured = true;
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
        const sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.featured;

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("category", "name slug")
                .sort(sortOption)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Product.countDocuments(filter),
        ]);

        return {
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                hasNextPage: pageNum * limitNum < total,
                hasPrevPage: pageNum > 1,
            },
        };
    }

    async getProductById(id) {
        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid product id");
        }
        const product = await Product.findOne({ _id: id, isActive: true })
            .populate("category", "name slug");
        if (!product) {
            throw new ApiError(404, "Product not found");
        }
        return product;
    }

    async getRelatedProducts(id) {
        const product = await this.getProductById(id);
        return Product.find({
            _id: { $ne: product._id },
            category: product.category._id,
            isActive: true,
        })
            .populate("category", "name slug")
            .sort({ rating: -1 })
            .limit(4);
    }

    async createProduct(data) {
        const payload = this._pickFields(data);
        if (!payload.name || !payload.description || payload.price === undefined || !payload.category) {
            throw new ApiError(400, "Name, description, price and category are required");
        }
        await this._validateCategory(payload.category);
        return Product.create(payload);
    }

    async updateProduct(id, data) {
        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid product id");
        }
        const payload = this._pickFields(data);
        if (payload.category) {
            await this._validateCategory(payload.category);
        }
        const product = await Product.findByIdAndUpdate(
            id,
            { $set: payload },
            { new: true, runValidators: true }
        ).populate("category", "name slug");
        if (!product) {
            throw new ApiError(404, "Product not found");
        }
        return product;
    }

    async deleteProduct(id) {
        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, "Invalid product id");
        }
        const product = await Product.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );
        if (!product) {
            throw new ApiError(404, "Product not found");
        }
        return { message: "Product deleted successfully" };
    }

    _pickFields(data) {
        const payload = {};
        for (const field of PRODUCT_FIELDS) {
            if (data[field] !== undefined) {
                payload[field] = data[field];
            }
        }
        return payload;
    }

    async _validateCategory(categoryId) {
        if (!mongoose.isValidObjectId(categoryId)) {
            throw new ApiError(400, "Invalid category id");
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }
        return category;
    }
}

module.exports = new ProductService();
