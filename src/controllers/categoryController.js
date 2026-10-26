const categoryService = require('../services/categoryService');
const restaurantService = require('../services/restaurantService');

/**
 * Category Controller
 * Handles HTTP requests, validates input, verifies foreign-key references,
 * delegates to categoryService, and returns formatted JSON responses.
 */

/**
 * GET /api/categories
 * Retrieve all categories.
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/categories/:id
 * Retrieve a single category by ID.
 */
const getCategoryById = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);

    if (isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID. Must be a positive integer.'
      });
    }

    const category = await categoryService.getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/categories
 * Create a new category for a restaurant.
 */
const createCategory = async (req, res, next) => {
  try {
    const { restaurant_id, name } = req.body;

    // 1. Validate restaurant_id format
    const restaurantId = parseInt(restaurant_id, 10);
    if (!restaurant_id || isNaN(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid restaurant_id is required and must be a positive integer.'
      });
    }

    // 2. Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required and cannot be empty.'
      });
    }

    // 3. Verify that the referenced restaurant actually exists
    const existingRestaurant = await restaurantService.getRestaurantById(restaurantId);
    if (!existingRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // 4. Create category
    const newCategory = await categoryService.createCategory({
      restaurant_id: restaurantId,
      name: name.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/categories/:id
 * Update an existing category by ID.
 */
const updateCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);

    if (isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID. Must be a positive integer.'
      });
    }

    // 1. Check whether category exists
    const existingCategory = await categoryService.getCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { restaurant_id, name } = req.body;

    // 2. Validate name if provided
    let targetName = existingCategory.name;
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category name cannot be empty.'
        });
      }
      targetName = name.trim();
    }

    // 3. Validate restaurant_id if provided
    let targetRestaurantId = existingCategory.restaurant_id;
    if (restaurant_id !== undefined) {
      const parsedRestId = parseInt(restaurant_id, 10);
      if (isNaN(parsedRestId) || parsedRestId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid restaurant_id must be a positive integer.'
        });
      }

      // Check whether the referenced restaurant exists
      const existingRestaurant = await restaurantService.getRestaurantById(parsedRestId);
      if (!existingRestaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }
      targetRestaurantId = parsedRestId;
    }

    // 4. Update category
    const updatedCategory = await categoryService.updateCategory(categoryId, {
      restaurant_id: targetRestaurantId,
      name: targetName
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/categories/:id
 * Delete a category by ID.
 */
const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);

    if (isNaN(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID. Must be a positive integer.'
      });
    }

    // 1. Check whether category exists
    const existingCategory = await categoryService.getCategoryById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // 2. Attempt deletion
    await categoryService.deleteCategory(categoryId);

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    // Gracefully handle foreign key reference errors (e.g. dependent food_items)
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category because dependent food items exist.'
      });
    }
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
