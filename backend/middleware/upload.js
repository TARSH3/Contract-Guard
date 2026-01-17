/**
 * File Upload Middleware
 * Handles PDF file uploads with validation and security checks
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./errorHandler');

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create user-specific subdirectory
    const userDir = path.join(uploadDir, req.user.id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `contract-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype !== 'application/pdf') {
    return cb(new AppError('Only PDF files are allowed', 400), false);
  }
  
  // Check file extension
  const allowedExtensions = ['.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new AppError('Invalid file extension. Only .pdf files are allowed', 400), false);
  }
  
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only allow one file at a time
  }
});

/**
 * Middleware to handle single PDF upload
 */
const uploadPDF = upload.single('contract');

/**
 * Enhanced upload middleware with additional validation
 */
const uploadWithValidation = (req, res, next) => {
  uploadPDF(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Handle multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File too large. Maximum size is 10MB', 400));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError('Unexpected file field. Use "contract" field name', 400));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new AppError('Too many files. Only one file allowed', 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    } else if (err) {
      // Handle other errors
      return next(err);
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return next(new AppError('No file uploaded. Please select a PDF file', 400));
    }
    
    // Additional file validation
    const file = req.file;
    
    // Validate file size (double-check)
    if (file.size > (parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024)) {
      // Clean up uploaded file
      fs.unlink(file.path, () => {});
      return next(new AppError('File too large. Maximum size is 10MB', 400));
    }
    
    // Validate filename length
    if (file.originalname.length > 255) {
      fs.unlink(file.path, () => {});
      return next(new AppError('Filename too long. Maximum 255 characters', 400));
    }
    
    // Check for potentially malicious filenames
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid filename characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i  // Windows reserved names
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(file.originalname))) {
      fs.unlink(file.path, () => {});
      return next(new AppError('Invalid filename', 400));
    }
    
    // Add file metadata to request
    req.fileMetadata = {
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadTime: new Date()
    };
    
    next();
  });
};

/**
 * Middleware to clean up uploaded files on error
 */
const cleanupOnError = (err, req, res, next) => {
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Failed to cleanup uploaded file:', unlinkErr);
      }
    });
  }
  next(err);
};

/**
 * Utility function to delete a file
 */
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Utility function to clean up old files
 * Removes files older than specified days
 */
const cleanupOldFiles = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (stat.mtime < cutoffDate) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Failed to delete old file ${filePath}:`, err);
            } else {
              console.log(`Deleted old file: ${filePath}`);
            }
          });
        }
      });
    };
    
    if (fs.existsSync(uploadDir)) {
      walkDir(uploadDir);
    }
  } catch (error) {
    console.error('Error during file cleanup:', error);
  }
};

// Schedule cleanup to run daily (in production, use a proper job scheduler)
if (process.env.NODE_ENV === 'production') {
  setInterval(cleanupOldFiles, 24 * 60 * 60 * 1000); // Run daily
}

module.exports = {
  uploadWithValidation,
  cleanupOnError,
  deleteFile,
  cleanupOldFiles
};