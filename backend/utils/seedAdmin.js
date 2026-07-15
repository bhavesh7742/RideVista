const User = require('../models/User');

/**
 * Seeds a default admin account if one doesn't exist.
 * Fixed credentials — single admin only.
 */
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'RideVista Admin',
        email: 'admin@ridevista.com',
        password: 'admin@123',
        role: 'admin',
        phone: '+91 0000000000',
      });
      console.log('🔑 Default admin account seeded (admin@ridevista.com / admin@123)');
    }
  } catch (error) {
    console.error('Admin seed error:', error.message);
  }
};

module.exports = seedAdmin;
