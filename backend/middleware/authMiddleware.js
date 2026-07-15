const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * PROTECT MIDDLEWARE - Verifies JWT token
 *
 * HOW IT WORKS (Interview Explanation):
 * 1. Client sends request with header: Authorization: Bearer <token>
 * 2. We extract the token from the header
 * 3. We verify the token using our secret key
 * 4. If valid, we decode the payload (which contains user ID)
 * 5. We fetch the user from database using that ID
 * 6. We attach the user to req.user so controllers can access it
 * 7. If anything fails, we return 401 Unauthorized
 *
 * WHERE IS THIS USED?
 * Any route that requires login → router.get('/profile', protect, controller)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token (split "Bearer <token>" and take the second part)
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, user is not logged in
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.',
      });
    }

    // Verify token - this will throw if token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database using the ID from token payload
    // This ensures the user still exists (hasn't been deleted since token was issued)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User no longer exists.',
      });
    }

    // Attach user to request object - now any controller can access req.user
    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws specific errors:
    // - TokenExpiredError: token has expired
    // - JsonWebTokenError: token is malformed/invalid
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.',
    });
  }
};

/**
 * AUTHORIZE MIDDLEWARE - Role-based access control
 *
 * HOW IT WORKS:
 * - Takes allowed roles as arguments
 * - Returns a middleware function that checks if req.user.role is in the allowed list
 * - Must be used AFTER protect middleware (because it needs req.user)
 *
 * USAGE:
 * router.post('/company', protect, authorize('rental_company'), createCompany)
 * router.get('/admin/users', protect, authorize('admin'), getAllUsers)
 *
 * This is a HIGHER-ORDER FUNCTION (returns a function) - common interview topic!
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
