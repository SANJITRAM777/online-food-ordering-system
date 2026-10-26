const { pool } = require('../config/db');

/**
 * Category Service
 * Encapsulates all SQL database interactions for the 'categories' table.
 * All queries use parameterized statements (?) to eliminate SQL injection risks.
 */

/**
 * Retrieve all categories from the database.
 * @returns {Promise<Array>} List of categories ordered by ID ascending
 */
const getAllCategories = async () => {
  const query = `
    SELECT id, restaurant_id, name, created_at, updated_at
    FROM categories
    ORDER BY id ASC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

/**
 * Retrieve a single category by primary key ID.
 * @param {number} id - Category ID
 * @returns {Promise<Object|null>} Category object or null if not found
 */
const getCategoryById = async (id) => {
  const query = `
    SELECT id, restaurant_id, name, created_at, updated_at
    FROM categories
    WHERE id = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Create and insert a new category record into the database.
 * @param {Object} data - Category details { restaurant_id, name }
 * @returns {Promise<Object>} Newly created category record
 */
const createCategory = async (data) => {
  const { restaurant_id, name } = data;

  const query = `
    INSERT INTO categories (restaurant_id, name)
    VALUES (?, ?)
  `;

  const [result] = await pool.execute(query, [restaurant_id, name]);

  // Fetch and return the newly inserted category using insertId
  return await getCategoryById(result.insertId);
};

/**
 * Update an existing category record by ID.
 * @param {number} id - Category ID
 * @param {Object} data - Updated details { restaurant_id, name }
 * @returns {Promise<Object>} Updated category record
 */
const updateCategory = async (id, data) => {
  const { restaurant_id, name } = data;

  const query = `
    UPDATE categories
    SET restaurant_id = ?, name = ?
    WHERE id = ?
  `;

  await pool.execute(query, [restaurant_id, name, id]);

  // Return the refreshed category record
  return await getCategoryById(id);
};

/**
 * Delete a category record by ID.
 * @param {number} id - Category ID
 * @returns {Promise<boolean>} True if record was deleted
 */
const deleteCategory = async (id) => {
  const query = `
    DELETE FROM categories
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
