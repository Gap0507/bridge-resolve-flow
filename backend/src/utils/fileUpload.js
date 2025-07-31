import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resolveit',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4', 'mp3', 'wav'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' }, // Limit image size
      { quality: 'auto' } // Auto optimize quality
    ]
  }
});

// Configure multer for file upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    files: 10 // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'audio/mpeg',
      'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Single file upload middleware
export const uploadSingle = upload.single('file');

// Multiple files upload middleware
export const uploadMultiple = upload.array('files', 10);

// Delete file from Cloudinary
export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Get file info from Cloudinary
export const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw error;
  }
};

// Generate signed upload URL for direct upload
export const generateUploadSignature = (params = {}) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      ...params
    },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  };
};

// Process uploaded file data
export const processUploadedFile = (file) => {
  if (!file) return null;

  return {
    name: file.originalname,
    type: getFileType(file.mimetype),
    url: file.path,
    size: file.size,
    uploadedAt: new Date()
  };
};

// Get file type from MIME type
const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'document';
  return 'document';
};

// Validate file size
export const validateFileSize = (file) => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB
  return file.size <= maxSize;
};

// Validate file type
export const validateFileType = (file) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'audio/mpeg',
    'application/pdf'
  ];
  return allowedTypes.includes(file.mimetype);
};

// Error handler for file upload
export const handleFileUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }

  if (error.message === 'File type not allowed') {
    return res.status(400).json({
      success: false,
      message: 'File type not allowed'
    });
  }

  return res.status(500).json({
    success: false,
    message: 'File upload failed'
  });
}; 