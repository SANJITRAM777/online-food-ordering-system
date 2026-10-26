const { pool } = require('../config/db');

/**
 * Food Service
 * Encapsulates all SQL database interactions for the 'food_items' table.
 * All queries use parameterized statements (?) to eliminate SQL injection risks.
 */

/**
 * Retrieve all food items from the database.
 * @returns {Promise<Array>} List of food items
 */
const getAllFoodItems = async () => {
  const query = `
    SELECT id, restaurant_id, category_id, name, description, price, image_url, availability, created_at, updated_at
    FROM food_items
    ORDER BY id ASC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

/**
 * Retrieve a single food item by ID.
 * @param {number} id - Food Item ID
 * @returns {Promise<Object|null>} Food item object or null if not found
 */
const getFoodItemById = async (id) => {
  const query = `
    SELECT id, restaurant_id, category_id, name, description, price, image_url, availability, created_at, updated_at
    FROM food_items
    WHERE id = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Insert a new food item into the database.
 * @param {Object} data - Food item details
 * @returns {Promise<Object>} The newly created food item record
 */
const createFoodItem = async (data) => {
  const { restaurant_id, category_id, name, description, price, image_url, availability } = data;

  const query = `
    INSERT INTO food_items
    (restaurant_id, category_id, name, description, price, image_url, availability)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    restaurant_id,
    category_id,
    name,
    description || null,
    price,
    image_url || null,
    availability !== undefined ? availability : true
  ];

  const [result] = await pool.execute(query, values);

  // Return the newly created food item record using insertId
  return await getFoodItemById(result.insertId);
};

/**
 * Update an existing food item record by ID.
 * @param {number} id - Food Item ID
 * @param {Object} data - Updated food item fields
 * @returns {Promise<Object>} Updated food item record
 */
const updateFoodItem = async (id, data) => {
  const { restaurant_id, category_id, name, description, price, image_url, availability } = data;

  const query = `
    UPDATE food_items
    SET restaurant_id = ?,
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        image_url = ?,
        availability = ?
    WHERE id = ?
  `;

  const values = [
    restaurant_id,
    category_id,
    name,
    description || null,
    price,
    image_url || null,
    availability !== undefined ? availability : true,
    id
  ];

  await pool.execute(query, values);

  // Return the updated record
  return await getFoodItemById(id);
};

/**
 * Delete a food item record by ID.
 * @param {number} id - Food Item ID
 * @returns {Promise<boolean>} True if record was deleted
 */
const deleteFoodItem = async (id) => {
  const query = `
    DELETE FROM food_items
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem
};
