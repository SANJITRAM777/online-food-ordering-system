const foodService = require('../services/foodService');
const restaurantService = require('../services/restaurantService');
const categoryService = require('../services/categoryService');

/**
 * Food Controller
 * Handles HTTP requests, basic validations, foreign-key existence checks,
 * delegates to foodService, and sends consistent JSON responses.
 */

/**
 * GET /api/food
 * Retrieve all food items.
 */
const getAllFoodItems = async (req, res, next) => {
  try {
    const foodItems = await foodService.getAllFoodItems();
    return res.status(200).json({
      success: true,
      message: 'Food items retrieved successfully',
      data: foodItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/food/:id
 * Retrieve a single food item by ID.
 */
const getFoodItemById = async (req, res, next) => {
  try {
    const foodId = parseInt(req.params.id, 10);

    if (isNaN(foodId) || foodId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid food item ID. Must be a positive integer.'
      });
    }

    const foodItem = await foodService.getFoodItemById(foodId);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Food item retrieved successfully',
      data: foodItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/food
 * Create a new food item.
 */
const createFoodItem = async (req, res, next) => {
  try {
    const { restaurant_id, category_id, name, description, price, image_url, availability } = req.body;

    // 1. Basic validation: restaurant_id
    const restaurantId = parseInt(restaurant_id, 10);
    if (!restaurant_id || isNaN(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant_id is required.'
      });
    }

    // 2. Basic validation: category_id
    const categoryId = parseInt(category_id, 10);
    if (!category_id || isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid category_id is required.'
      });
    }

    // 3. Basic validation: name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Food item name is required and cannot be empty.'
      });
    }

    // 4. Basic validation: price
    const numPrice = Number(price);
    if (price === undefined || isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price is required and must be a valid positive number.'
      });
    }

    // 5. Foreign Key check: Restaurant exists
    const existingRestaurant = await restaurantService.getRestaurantById(restaurantId);
    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // 6. Foreign Key check: Category exists
    const existingCategory = await categoryService.getCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // 7. Insert food item
    const newFoodItem = await foodService.createFoodItem({
      restaurant_id: restaurantId,
      category_id: categoryId,
      name: name.trim(),
      description: description ? String(description).trim() : null,
      price: numPrice,
      image_url: image_url ? String(image_url).trim() : null,
      availability: availability !== undefined ? Boolean(availability) : true
    });

    return res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: newFoodItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/food/:id
 * Update an existing food item by ID.
 */
const updateFoodItem = async (req, res, next) => {
  try {
    const foodId = parseInt(req.params.id, 10);

    if (isNaN(foodId) || foodId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid food item ID. Must be a positive integer.'
      });
    }

    // 1. Check if food item exists
    const existingFood = await foodService.getFoodItemById(foodId);
    if (!existingFood) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    const { restaurant_id, category_id, name, description, price, image_url, availability } = req.body;

    // 2. Validate and check restaurant_id if provided
    let targetRestaurantId = existingFood.restaurant_id;
    if (restaurant_id !== undefined) {
      const parsedRestId = parseInt(restaurant_id, 10);
      if (isNaN(parsedRestId) || parsedRestId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid restaurant_id must be a positive integer.'
        });
      }
      const existingRestaurant = await restaurantService.getRestaurantById(parsedRestId);
      if (!existingRestaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }
      targetRestaurantId = parsedRestId;
    }

    // 3. Validate and check category_id if provided
    let targetCategoryId = existingFood.category_id;
    if (category_id !== undefined) {
      const parsedCatId = parseInt(category_id, 10);
      if (isNaN(parsedCatId) || parsedCatId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid category_id must be a positive integer.'
        });
      }
      const existingCategory = await categoryService.getCategoryById(parsedCatId);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      targetCategoryId = parsedCatId;
    }

    // 4. Validate name if provided
    let targetName = existingFood.name;
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Food item name cannot be empty.'
        });
      }
      targetName = name.trim();
    }

    // 5. Validate price if provided
    let targetPrice = existingFood.price;
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number.'
        });
      }
      targetPrice = numPrice;
    }

    const updatedFoodItem = await foodService.updateFoodItem(foodId, {
      restaurant_id: targetRestaurantId,
      category_id: targetCategoryId,
      name: targetName,
      description: description !== undefined ? (description ? String(description).trim() : null) : existingFood.description,
      price: targetPrice,
      image_url: image_url !== undefined ? (image_url ? String(image_url).trim() : null) : existingFood.image_url,
      availability: availability !== undefined ? Boolean(availability) : existingFood.availability
    });

    return res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      data: updatedFoodItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/food/:id
 * Delete a food item by ID.
 */
const deleteFoodItem = async (req, res, next) => {
  try {
    const foodId = parseInt(req.params.id, 10);

    if (isNaN(foodId) || foodId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid food item ID. Must be a positive integer.'
      });
    }

    // 1. Check if food item exists
    const existingFood = await foodService.getFoodItemById(foodId);
    if (!existingFood) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    // 2. Delete food item
    await foodService.deleteFoodItem(foodId);

    return res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    // Graceful foreign key reference handling
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete food item because it is referenced in active orders or carts.'
      });
    }
    next(error);
  }
};

module.exports = {
  getAllFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem
};
