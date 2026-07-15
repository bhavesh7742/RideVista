const express = require('express');
const router = express.Router();

const { getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

module.exports = router;
