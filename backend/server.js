const dotenv = require('dotenv');

// Load environment variables FIRST - before anything else uses them
// This reads your .env file and puts values into process.env
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
// We use an async IIFE (Immediately Invoked Function Expression)
// because top-level await requires ES modules
const startServer = async () => {
  try {
    // Step 1: Connect to database
    await connectDB();

    // Step 2: Seed default admin account if not exists
    await seedAdmin();

    // Step 3: Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚗 RideVista Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1); // Exit with failure code
  }
};

startServer();
