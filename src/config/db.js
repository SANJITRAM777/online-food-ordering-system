const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

/**
 * MySQL Connection Pool Configuration
 * Using mysql2/promise for modern async/await syntax.
 * Connection pooling reuses connections across concurrent requests,
 * preventing connection overhead and server exhaustion.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'online_food_order',
  port: Number(process.env.DB_PORT) || 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Verify database connectivity during server startup or diagnostics.
 * Executes a lightweight `SELECT 1` ping query.
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release(); // Return connection to the pool

    console.log(`===============================================`);
    console.log(`Database connected successfully!`);
    console.log(`Connected to: ${process.env.DB_NAME} (Port: ${process.env.DB_PORT || 3307})`);
    console.log(`===============================================`);
    return true;
  } catch (error) {
    console.error(`===============================================`);
    console.error(`Database connection FAILED: ${error.message}`);
    console.error(`Check your XAMPP MySQL server, port, and credentials in .env`);
    console.error(`===============================================`);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
