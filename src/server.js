const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Import custom middlewares
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import database pool and connection tester
const { pool, testConnection } = require('./config/db');

// Import API routes
const restaurantRoutes = require('./routes/restaurantRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const foodRoutes = require('./routes/foodRoutes');

// Initialize Express app
const app = express();

// Set Port
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve Frontend UI on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Basic Health-check endpoint with Database connectivity status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    dbStatus = 'CONNECTED';
  } catch (error) {
    dbStatus = 'ERROR';
  }

  res.status(200).json({
    success: true,
    message: 'Online Food Ordering API is running healthy',
    data: {
      status: 'UP',
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// API Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/food', foodRoutes);

// Fallback for unhandled routes (404)
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start listening for incoming requests and test DB connection
app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);

  // Verify database connection on startup
  await testConnection();
});

module.exports = app;
