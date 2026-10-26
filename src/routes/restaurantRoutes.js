const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

/**
 * Restaurant Routes
 * Base path: /api/restaurants
 */

// GET /api/restaurants - Retrieve all restaurants
router.get('/', restaurantController.getAllRestaurants);

// GET /api/restaurants/:id - Retrieve restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// POST /api/restaurants - Create a new restaurant
router.post('/', restaurantController.createRestaurant);

// PUT /api/restaurants/:id - Update an existing restaurant by ID
router.put('/:id', restaurantController.updateRestaurant);

// DELETE /api/restaurants/:id - Delete a restaurant by ID
router.delete('/:id', restaurantController.deleteRestaurant);

module.exports = router;
