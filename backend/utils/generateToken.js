const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 *
 * HOW JWT WORKS (Interview Gold):
 * 1. We put the user's ID inside the token (payload)
 * 2. We sign it with our secret key (JWT_SECRET)
 * 3. The token is sent to the client (stored in localStorage or cookie)
 * 4. On every request, client sends this token in the Authorization header
 * 5. Our middleware verifies the token and extracts the user ID
 * 6. We fetch the user from DB using that ID → now we know WHO is making the request
 *
 * WHY JWT over Sessions?
 * - Stateless: No server-side storage needed (scales better)
 * - Works across multiple servers (no sticky sessions)
 * - Perfect for REST APIs consumed by mobile apps too
 *
 * @param {string} userId - The MongoDB _id of the user
 * @returns {string} JWT token string
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },        // Payload - data encoded in the token
    process.env.JWT_SECRET // Secret key - used to sign/verify
  );
};

module.exports = generateToken;
