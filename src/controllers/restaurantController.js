const restaurantService = require('../services/restaurantService');

/**
 * Restaurant Controller
 * Handles incoming HTTP requests, validates client input,
 * delegates data operations to restaurantService, and returns formatted JSON responses.
 */

/**
 * GET /api/restaurants
 * Retrieve all restaurants.
 */
const getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await restaurantService.getAllRestaurants();
    return res.status(200).json({
      success: true,
      message: 'Restaurants retrieved successfully',
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/restaurants/:id
 * Retrieve a single restaurant by ID.
 */
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID. Must be a positive integer.'
      });
    }

    const restaurant = await restaurantService.getRestaurantById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Restaurant retrieved successfully',
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/restaurants
 * Create a new restaurant.
 */
const createRestaurant = async (req, res, next) => {
  try {
    const { name, description, address, phone, status } = req.body;

    // Validate required fields according to database schema
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Restaurant name is required and cannot be empty'
      });
    }

    if (!address || typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Restaurant address is required and cannot be empty'
      });
    }

    // Validate status if provided (ENUM: 'active', 'inactive')
    let normalizedStatus = 'active';
    if (status !== undefined) {
      const lowerStatus = String(status).toLowerCase();
      if (!['active', 'inactive'].includes(lowerStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either 'active' or 'inactive'"
        });
      }
      normalizedStatus = lowerStatus;
    }

    const newRestaurant = await restaurantService.createRestaurant({
      name: name.trim(),
      description: description ? String(description).trim() : null,
      address: address.trim(),
      phone: phone ? String(phone).trim() : null,
      status: normalizedStatus
    });

    return res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: newRestaurant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/restaurants/:id
 * Update an existing restaurant by ID.
 */
const updateRestaurant = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID. Must be a positive integer.'
      });
    }

    // Check if the restaurant exists
    const existingRestaurant = await restaurantService.getRestaurantById(restaurantId);
    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const { name, description, address, phone, status } = req.body;

    // Validate provided fields
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant name cannot be empty'
      });
    }

    if (address !== undefined && (typeof address !== 'string' || address.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant address cannot be empty'
      });
    }

    let normalizedStatus = existingRestaurant.status;
    if (status !== undefined) {
      const lowerStatus = String(status).toLowerCase();
      if (!['active', 'inactive'].includes(lowerStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either 'active' or 'inactive'"
        });
      }
      normalizedStatus = lowerStatus;
    }

    const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId, {
      name: name !== undefined ? name.trim() : existingRestaurant.name,
      description: description !== undefined ? (description ? String(description).trim() : null) : existingRestaurant.description,
      address: address !== undefined ? address.trim() : existingRestaurant.address,
      phone: phone !== undefined ? (phone ? String(phone).trim() : null) : existingRestaurant.phone,
      status: normalizedStatus
    });

    return res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: updatedRestaurant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/restaurants/:id
 * Delete a restaurant by ID.
 */
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.id, 10);

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID. Must be a positive integer.'
      });
    }

    // Check if the restaurant exists
    const existingRestaurant = await restaurantService.getRestaurantById(restaurantId);
    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    await restaurantService.deleteRestaurant(restaurantId);

    return res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
