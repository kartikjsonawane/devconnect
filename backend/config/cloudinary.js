const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'devconnect/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    public_id: (req) => `avatar_${req.user._id}_${Date.now()}`,
  },
});

const postImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'devconnect/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, quality: 'auto' }],
    public_id: (req) => `post_${req.user._id}_${Date.now()}`,
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

const uploadPostImage = multer({
  storage: postImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Non-critical: log and continue
    require('../utils/logger').warn(`Failed to delete Cloudinary asset: ${publicId}`);
  }
};

module.exports = { cloudinary, uploadAvatar, uploadPostImage, deleteFromCloudinary };
