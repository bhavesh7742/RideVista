const express = require('express');
const cors = require('cors');

// Import route files
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const requestRoutes = require('./routes/requestRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Import error handler
const errorHandler = require('./middleware/errorMiddleware');

// Initialize Express app
const app = express();

// ---------------------
// MIDDLEWARE
// ---------------------

// Parse incoming JSON request bodies
// Without this, req.body would be undefined when clients send JSON data
app.use(express.json());

// Parse URL-encoded form data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Enable CORS - allows our React frontend (port 5173) to call this API (port 5000)
// Without this, browsers block cross-origin requests for security
app.use(cors());

// ---------------------
// ROUTES
// ---------------------

// Health check route - useful to verify server is running
// In production, load balancers ping this to check if your server is alive
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RideVista API is running',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);

// ---------------------
// ERROR HANDLING
// ---------------------

// Handle 404 - Route not found (must be after all route definitions)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler (must be the LAST middleware)
// Express identifies this as an error handler because it has 4 parameters
app.use(errorHandler);

module.exports = app;
