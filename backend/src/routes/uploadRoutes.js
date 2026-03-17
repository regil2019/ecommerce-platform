import express from 'express'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'
import { authenticate } from '../middleware/authMiddleware.js'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// Ensure uploads directory exists for local storage
const uploadDir = path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  // Non-fatal: directory creation failure logged once at startup
}

let storage;

// Check if Cloudinary is configured properly
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

if (hasCloudinary) {
  // Cloudinary Storage Configuration
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'ecommerce_products',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
  })
} else {
  // Local Disk Storage Configuration
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + fileExt);
    }
  })
}

// File filter to validate image types
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only JPEG, PNG, WebP and AVIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5
  },
  fileFilter
})

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ error: 'Too many files. Maximum is 5 files.' });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ error: err.message || 'Invalid file type.' });
      default:
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
  }
  if (err) {
    return res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
  next();
};

// Single image upload
router.post('/image', authenticate, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      let fileUrl = req.file.path; // Cloudinary secure_url or Full Path from multer
      
      res.json({
        url: fileUrl,
        filename: req.file.filename || req.file.originalname
      })
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({ error: 'Failed to process uploaded image' })
    }
  });
})

// Product gallery upload (multiple)
router.post('/:id', authenticate, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);

    try {
      const files = req.files
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' })
      }

      const imageUrls = files.map(file => file.path)

      res.json({
        message: 'Images uploaded successfully',
        urls: imageUrls
      })
    } catch (error) {
      res.status(500).json({ message: 'Image processing failed' })
    }
  });
})

export default router
