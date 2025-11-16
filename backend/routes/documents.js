/**
 * Document Routes
 * 
 * Handles all document-related API endpoints:
 * - GET /api/documents - List all documents (with pagination and search)
 * - GET /api/documents/search - Search documents by query
 * - GET /api/documents/:id - Get a specific document by ID
 * - POST /api/documents - Create a new document
 * - PUT /api/documents/:id - Update an existing document
 * - DELETE /api/documents/:id - Delete a document
 */

const express = require('express');
const router = express.Router();

// Import document controller functions
const { 
  getAllDocuments, 
  getDocument, 
  createDocument, 
  updateDocument, 
  deleteDocument,
  searchDocuments 
} = require('../controllers/documentController');

// Import validation middleware
const { validateDocument } = require('../middleware/auth');

// ==================== Route Definitions ====================

// GET /api/documents - Get all documents with pagination
router.get('/', getAllDocuments);

// GET /api/documents/search - Search documents by query string
router.get('/search', searchDocuments);

// POST /api/documents - Create a new document
// Uses validateDocument middleware to validate request body
router.post('/', validateDocument, createDocument);

// GET /api/documents/:id - Get a specific document by ID
router.get('/:id', getDocument);

// PUT /api/documents/:id - Update an existing document
// Uses validateDocument middleware to validate request body
router.put('/:id', validateDocument, updateDocument);

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', deleteDocument);

module.exports = router;


























