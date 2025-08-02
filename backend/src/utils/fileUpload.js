import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    let subDir = 'documents';
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      subDir = 'audio';
    }
    
    const uploadPath = path.join(uploadsDir, subDir);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
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
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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

// Delete file from local storage
export const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, message: 'File not found' };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get file info from local storage
export const getFileInfo = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    }
    throw new Error('File not found');
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

// Process uploaded file data
export const processUploadedFile = (file) => {
  if (!file) return null;

  // Create relative URL for frontend access
  const relativePath = file.path.replace(process.cwd(), '').replace(/\\/g, '/');
  const fileUrl = `/uploads${relativePath}`;

  return {
    name: file.originalname,
    type: getFileType(file.mimetype),
    url: fileUrl,
    path: file.path, // Store actual file path for backend operations
    size: file.size,
    uploadedAt: new Date()
  };
};

// Get file type from MIME type
const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || mimeType.includes('word')) return 'document';
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
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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

// Serve static files middleware
export const serveUploads = (req, res, next) => {
  // Serve uploaded files statically
  if (req.path.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), req.path);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  next();
}; 