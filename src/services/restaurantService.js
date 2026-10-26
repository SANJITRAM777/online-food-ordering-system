const { pool } = require('../config/db');

/**
 * Restaurant Service
 * Encapsulates all SQL database interactions for the 'restaurants' table.
 * All queries use parameterized statements (?) to eliminate SQL injection risks.
 */

/**
 * Retrieve all restaurants from the database.
 * @returns {Promise<Array>} List of restaurants
 */
const getAllRestaurants = async () => {
  const query = `
    SELECT id, name, description, address, phone, status, created_at, updated_at
    FROM restaurants
    ORDER BY id ASC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

/**
 * Retrieve a single restaurant by primary key ID.
 * @param {number} id - Restaurant ID
 * @returns {Promise<Object|null>} Restaurant object or null if not found
 */
const getRestaurantById = async (id) => {
  const query = `
    SELECT id, name, description, address, phone, status, created_at, updated_at
    FROM restaurants
    WHERE id = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Create and insert a new restaurant record into the database.
 * @param {Object} data - Restaurant details
 * @returns {Promise<Object>} The newly created restaurant record
 */
const createRestaurant = async (data) => {
  const { name, description, address, phone, status } = data;

  const query = `
    INSERT INTO restaurants (name, description, address, phone, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    description || null,
    address,
    phone || null,
    status || 'active'
  ];

  const [result] = await pool.execute(query, values);
  
  // Fetch and return the newly inserted restaurant using the auto-generated insertId
  return await getRestaurantById(result.insertId);
};

/**
 * Update an existing restaurant record by ID.
 * @param {number} id - Restaurant ID
 * @param {Object} data - Updated restaurant details
 * @returns {Promise<Object>} The updated restaurant record
 */
const updateRestaurant = async (id, data) => {
  const { name, description, address, phone, status } = data;

  const query = `
    UPDATE restaurants
    SET name = ?, description = ?, address = ?, phone = ?, status = ?
    WHERE id = ?
  `;

  const values = [
    name,
    description || null,
    address,
    phone || null,
    status || 'active',
    id
  ];

  await pool.execute(query, values);

  // Return the refreshed restaurant record
  return await getRestaurantById(id);
};

/**
 * Delete a restaurant record by ID.
 * @param {number} id - Restaurant ID
 * @returns {Promise<boolean>} True if record was deleted
 */
const deleteRestaurant = async (id) => {
  const query = `
    DELETE FROM restaurants
    WHERE id = ?
  `;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
