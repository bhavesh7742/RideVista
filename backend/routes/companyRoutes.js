const express = require('express');
const router = express.Router();

const {
  createCompany,
  getOwnCompany,
  updateOwnCompany,
  verifyCompany,
  getAllCompanies,
  getCompanyById,
  deleteCompany,
  verifyCompanyById,
} = require('../controllers/companyController');

const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createCompanyValidator,
  updateCompanyValidator,
} = require('../validators/companyValidator');

// Company own profile routes (Protected - Defined before dynamic :id)
router.get(
  '/my-company',
  protect,
  authorize('rental_company'),
  getOwnCompany
);

router.put(
  '/my-company',
  protect,
  authorize('rental_company'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'verificationDocs', maxCount: 5 }
  ]),
  updateCompanyValidator,
  validate,
  updateOwnCompany
);

// Public routes (No login required)
router.get('/', getAllCompanies);
router.get('/verify-id/:companyId', verifyCompanyById);
router.get('/:id', getCompanyById);

// Protected routes (Login required)
router.use(protect);

// Admin-only routes
router.patch('/:id/verify', authorize('admin'), verifyCompany);
router.delete('/:id', authorize('admin'), deleteCompany);

// Routes for rental companies
router.post(
  '/',
  authorize('rental_company'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'verificationDocs', maxCount: 5 }
  ]),
  createCompanyValidator,
  validate,
  createCompany
);

module.exports = router;
