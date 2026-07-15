const multer = require('multer');
const path = require('path');

// Configure disk storage
// We save files temporarily in backend/uploads/ and delete them after uploading to Cloudinary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // Generate unique name to prevent naming collisions
    // e.g. vehicle-1719876543210-9874.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter - reject non-image uploads
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (.jpg, .jpeg, .png, .webp) are allowed!'), false);
  }
};

// Initialize multer middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB size limit per image
  },
  fileFilter: fileFilter,
});

module.exports = upload;
