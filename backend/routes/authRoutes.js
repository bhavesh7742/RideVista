const express = require('express');
const router = express.Router();

// Import controller functions
const { register, login, getMe, changePassword } = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

// Import validators
const {
  registerValidator,
  loginValidator,
} = require('../validators/authValidator');

/**
 * AUTH ROUTES
 *
 * ROUTE DESIGN PATTERN:
 * - Public routes (no middleware): register, login
 * - Protected routes (protect middleware): getMe
 *
 * MIDDLEWARE CHAIN (how a request flows):
 * POST /api/auth/register → [registerValidator] → [validate] → register controller
 * POST /api/auth/login    → [loginValidator]    → [validate] → login controller
 * GET  /api/auth/me       → [protect]                        → getMe controller
 *
 * Each middleware either:
 * - Calls next() → request moves to the next middleware/controller
 * - Sends response → chain stops (e.g., validation error, unauthorized)
 */

const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post(
  '/register',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'verificationDocs', maxCount: 5 }
  ]),
  registerValidator,
  validate,
  register
);
router.post('/login', loginValidator, validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
