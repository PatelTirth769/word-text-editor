/**
 * Authentication Middleware
 * 
 * Provides middleware functions for:
 * - JWT token verification
 * - Request body validation
 * - File upload handling (placeholder)
 */

const jwt = require('jsonwebtoken');

// ==================== Authentication ====================

/**
 * Middleware to verify JWT token from Authorization header
 * 
 * Expects: Authorization: Bearer <token>
 * Sets req.user with decoded token data if valid
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== Validation ====================

/**
 * Middleware to validate document request body
 * 
 * Allows empty documents (like MS Word does)
 * Only validates that request body exists
 */
const validateDocument = (req, res, next) => {
  const { title, content } = req.body;
  
  // Allow empty documents - just validate that we have a request body
  // MS Word allows saving empty documents
  if (req.body === undefined || req.body === null) {
    return res.status(400).json({ 
      error: 'Request body is required' 
    });
  }
  
  next();
};

// ==================== File Upload ====================

/**
 * Middleware to handle file uploads
 * 
 * TODO: Implement file upload handling using multer
 * This is a placeholder for future file upload functionality
 */
const handleFileUpload = (req, res, next) => {
  // TODO: Implement file upload handling
  next();
};

module.exports = {
  authenticateToken,
  validateDocument,
  handleFileUpload
};































