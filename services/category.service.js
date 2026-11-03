const Category = require("../models/category.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/apiError");

class CategoryService {
    async getCategories() {
        return Category.find({ isActive: true }).sort({ name: 1 });
    }

    async getCategoryById(id) {
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }
        return category;
    }

    async createCategory(data) {
        const { name, description } = data;
        if (!name) {
            throw new ApiError(400, "Category name is required");
        }
        const existing = await Category.findOne({ name: name.trim() });
        if (existing) {
            throw new ApiError(400, "Category already exists");
        }
        return Category.create({ name: name.trim(), description });
    }

    async updateCategory(id, data) {
        const category = await Category.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
        if (!category) {
            throw new ApiError(404, "Category not found");
        }
        return category;
    }

    async deleteCategory(id) {
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }
        const productCount = await Product.countDocuments({ category: id });
        if (productCount > 0) {
            throw new ApiError(400, `Category has ${productCount} product(s) and cannot be deleted`);
        }
        await category.deleteOne();
        return { message: "Category deleted successfully" };
    }
}

module.exports = new CategoryService();
