const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary using environment variables
// If CLOUDINARY_URL is present, Cloudinary automatically configures itself.
// Otherwise, we manually pass the cloud name, api key and secret.
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload a local temp file to Cloudinary
 *
 * HOW IT WORKS (Interview Explanation):
 * 1. Multer stores the file temporarily in the backend's 'uploads/' directory.
 * 2. We use the Cloudinary SDK to upload the file to Cloudinary servers.
 * 3. We use the 'folder' option to organize our files (e.g. 'ridevista/vehicles', 'ridevista/avatars').
 * 4. Once uploaded, we get a secure URL pointing to the image on Cloudinary's CDN.
 * 5. We synchronously delete the local temp file using fs.unlinkSync() to save disk space.
 * 6. We return the secure URL.
 *
 * @param {string} localFilePath - Path of the file on local disk (multer destination)
 * @param {string} folder - Folder name in Cloudinary (e.g. 'ridevista/vehicles')
 * @returns {Promise<string>} Secure URL of the uploaded image
 */
const uploadToCloudinary = async (localFilePath, folder = 'ridevista') => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: 'auto', // Automatically detect image/video
    });

    // Remove the locally saved temporary file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return result.secure_url;
  } catch (error) {
    // Remove local file if upload fails to avoid clogging the disk
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = { uploadToCloudinary };
