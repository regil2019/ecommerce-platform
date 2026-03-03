import multer from 'multer'

export const errorHandler = (err, req, res, next) => {
  // Only log full error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error handler:', err)
  } else {
    console.error('Error handler:', err.message)
  }

  // Default error format
  const errorResponse = {
    success: false,
    message: 'Internal Server Error',
    errorCode: 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? err.message : null
  }

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    const messages = {
      'LIMIT_FILE_SIZE': 'File too large. Maximum size is 5MB.',
      'LIMIT_FILE_COUNT': 'Too many files uploaded.',
      'LIMIT_UNEXPECTED_FILE': 'Unexpected file field.',
    }
    return res.status(400).json({
      success: false,
      message: messages[err.code] || `Upload error: ${err.message}`,
      errorCode: 'UPLOAD_ERROR'
    })
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errorCode: 'VALIDATION_ERROR',
      details: err.errors.map(e => e.message)
    })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid Token',
      errorCode: 'AUTH_INVALID_TOKEN'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token Expired',
      errorCode: 'AUTH_TOKEN_EXPIRED'
    })
  }

  res.status(500).json(errorResponse)
}

