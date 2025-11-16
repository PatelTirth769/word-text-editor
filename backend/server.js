/**
 * Word Editor Backend Server
 * 
 * This is the main Express server for the Word-like text editor application.
 * It handles document CRUD operations, export functionality (PDF/DOCX), and API endpoints.
 * 
 * Features:
 * - Document management (create, read, update, delete, search)
 * - Export to PDF and DOCX formats
 * - MongoDB integration (optional - works without DB for export features)
 * - JWT authentication support
 * - Rate limiting and security middleware
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import API routes
const documentRoutes = require('./routes/documents');
const exportRoutes = require('./routes/export');

// Import middleware
const { authenticateToken, validateDocument } = require('./middleware/auth');

// Import database connection (optional - server works without DB)
const connectDB = require('./config/database');

// Import logger utility
const logger = require('./utils/logger');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Connect to MongoDB database (optional - server works without DB)
// Export features (PDF/DOCX) will still work even if DB is not connected
connectDB();

// ==================== Middleware Configuration ====================

// Security middleware - sets various HTTP headers for security
app.use(helmet());

// CORS configuration - allows frontend to make requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - prevents abuse by limiting requests per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100 // Maximum 100 requests per IP per window
});
app.use(limiter);

// Compression middleware - compresses response bodies
app.use(compression());

// HTTP request logger
app.use(morgan('combined'));

// Body parsing middleware - parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' })); // Support up to 10MB JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== API Routes ====================

// Health check endpoint - used to verify server is running
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Word Editor Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Document management routes
// Handles: GET /api/documents, POST /api/documents, PUT /api/documents/:id, DELETE /api/documents/:id
app.use('/api/documents', documentRoutes);

// Export routes
// Handles: POST /api/export/pdf, POST /api/export/docx
app.use('/api/export', exportRoutes);

// ==================== Error Handling ====================

// Global error handler - catches all unhandled errors
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - catches all unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`🚀 Backend server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});


























