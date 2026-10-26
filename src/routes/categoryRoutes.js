const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

/**
 * Category Routes
 * Base path: /api/categories
 */

// GET /api/categories - Retrieve all categories
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:id - Retrieve category by ID
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Create a new category
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - Update an existing category by ID
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Delete a category by ID
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
