const categoryService = require("../services/category.service");

class CategoryController {
    async getCategories(req, res) {
        try {
            const categories = await categoryService.getCategories();
            res.status(200).json(categories);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async getCategoryById(req, res) {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            res.status(200).json(category);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async createCategory(req, res) {
        try {
            const category = await categoryService.createCategory(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async updateCategory(req, res) {
        try {
            const category = await categoryService.updateCategory(req.params.id, req.body);
            res.status(200).json(category);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            const result = await categoryService.deleteCategory(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}

module.exports = new CategoryController();
