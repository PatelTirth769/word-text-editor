/**
 * Export Routes
 * 
 * Handles document export functionality:
 * - POST /api/export/pdf - Export HTML content to PDF format
 * - POST /api/export/docx - Export HTML content to DOCX (Word) format
 * 
 * Both endpoints accept HTML content in the request body and return
 * the exported file as a downloadable response.
 */

const express = require('express');
const router = express.Router();

// Import export controller functions
const { exportToPDF, exportToDOCX } = require('../controllers/exportController');

// ==================== Route Definitions ====================

// POST /api/export/pdf - Export HTML content to PDF
// Request body: { htmlContent: string, title?: string }
router.post('/pdf', exportToPDF);

// POST /api/export/docx - Export HTML content to DOCX (Word format)
// Request body: { htmlContent: string, title?: string }
router.post('/docx', exportToDOCX);

module.exports = router;










