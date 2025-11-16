/**
 * Document Controller
 * 
 * Handles all business logic for document operations:
 * - Fetching documents (all, single, search)
 * - Creating new documents
 * - Updating existing documents
 * - Deleting documents
 * 
 * Note: This controller gracefully handles cases where MongoDB is not connected,
 * returning mock responses to allow the application to work without a database.
 */

const Document = require('../models/Document');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// ==================== Document Retrieval ====================

/**
 * Get all documents with pagination and optional search
 * GET /api/documents?page=1&limit=10&search=query
 */
const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const documents = await Document.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email');

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

/**
 * Get a single document by ID
 * GET /api/documents/:id
 */
const getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id).populate('author', 'name email');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

// ==================== Document Creation ====================

/**
 * Create a new document
 * POST /api/documents
 * Body: { title: string, content: string, isPublic?: boolean, tags?: string[] }
 */
const createDocument = async (req, res) => {
  try {
    const { title, content, isPublic = false, tags = [] } = req.body;
    
    // If MongoDB is not connected, return a mock response
    if (!mongoose.connection.readyState) {
      const mockDocument = {
        id: Date.now().toString(),
        _id: Date.now().toString(),
        title: title || 'Untitled Document',
        content: content || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      logger.info(`Document created (mock, no DB): ${mockDocument.id}`);
      return res.status(201).json({ document: mockDocument });
    }
    
    const document = new Document({
      title: title || 'Untitled Document',
      content: content || '',
      author: req.user?.id || 'anonymous',
      isPublic,
      tags
    });

    await document.save();
    logger.info(`Document created: ${document._id}`);

    res.status(201).json({ document });
  } catch (error) {
    logger.error('Error creating document:', error);
    // Return mock response if database error
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      const mockDocument = {
        id: Date.now().toString(),
        _id: Date.now().toString(),
        title: req.body.title || 'Untitled Document',
        content: req.body.content || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      logger.info(`Document created (mock, DB error): ${mockDocument.id}`);
      return res.status(201).json({ document: mockDocument });
    }
    res.status(500).json({ error: 'Failed to create document', message: error.message });
  }
};

// ==================== Document Update ====================

/**
 * Update an existing document
 * PUT /api/documents/:id
 * Body: { title?: string, content?: string, isPublic?: boolean, tags?: string[] }
 */
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPublic, tags } = req.body;

    // If MongoDB is not connected, return a mock response
    if (!mongoose.connection.readyState) {
      const mockDocument = {
        id: id,
        _id: id,
        title: title || 'Untitled Document',
        content: content || '',
        updatedAt: new Date()
      };
      logger.info(`Document updated (mock, no DB): ${id}`);
      return res.json({ document: mockDocument });
    }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update fields
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (isPublic !== undefined) document.isPublic = isPublic;
    if (tags !== undefined) document.tags = tags;

    await document.save();
    logger.info(`Document updated: ${document._id}`);

    res.json({ document });
  } catch (error) {
    logger.error('Error updating document:', error);
    // Return mock response if database error
    if (error.name === 'MongoError' || error.name === 'MongooseError' || error.name === 'CastError') {
      const mockDocument = {
        id: id,
        _id: id,
        title: req.body.title || 'Untitled Document',
        content: req.body.content || '',
        updatedAt: new Date()
      };
      logger.info(`Document updated (mock, DB error): ${id}`);
      return res.json({ document: mockDocument });
    }
    res.status(500).json({ error: 'Failed to update document', message: error.message });
  }
};

// ==================== Document Deletion ====================

/**
 * Delete a document by ID
 * DELETE /api/documents/:id
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await Document.findByIdAndDelete(id);
    logger.info(`Document deleted: ${id}`);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

// ==================== Document Search ====================

/**
 * Search documents by query string
 * GET /api/documents/search?q=query&page=1&limit=10
 * Searches in title, content, and tags
 */
const searchDocuments = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    const documents = await Document.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email');

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      query: q
    });
  } catch (error) {
    logger.error('Error searching documents:', error);
    res.status(500).json({ error: 'Failed to search documents' });
  }
};

module.exports = {
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  searchDocuments
};


























