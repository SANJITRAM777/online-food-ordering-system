const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

/**
 * Food Item Routes
 * Base path: /api/food
 */

// GET /api/food - Retrieve all food items
router.get('/', foodController.getAllFoodItems);

// GET /api/food/:id - Retrieve food item by ID
router.get('/:id', foodController.getFoodItemById);

// POST /api/food - Create a new food item
router.post('/', foodController.createFoodItem);

// PUT /api/food/:id - Update an existing food item by ID
router.put('/:id', foodController.updateFoodItem);

// DELETE /api/food/:id - Delete a food item by ID
router.delete('/:id', foodController.deleteFoodItem);

module.exports = router;
