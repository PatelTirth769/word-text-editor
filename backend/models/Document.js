/**
 * Document Model
 * 
 * Mongoose schema for documents stored in MongoDB.
 * Defines the structure and validation rules for documents.
 * 
 * Fields:
 * - title: Document title (required, max 200 chars)
 * - content: Document HTML content
 * - author: Reference to User model
 * - isPublic: Whether document is publicly accessible
 * - tags: Array of tag strings
 * - wordCount: Automatically calculated word count
 * - lastModified: Last modification timestamp
 * - timestamps: Automatically adds createdAt and updatedAt
 */

const mongoose = require('mongoose');

// Define document schema
const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  wordCount: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ==================== Indexes ====================
// Create indexes for better query performance

// Index for author-based queries sorted by creation date
documentSchema.index({ author: 1, createdAt: -1 });

// Text index for full-text search on title and content
documentSchema.index({ title: 'text', content: 'text' });

// ==================== Virtual Fields ====================

// Virtual field to expose _id as 'id' in JSON responses
documentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are included in JSON output
documentSchema.set('toJSON', {
  virtuals: true
});

// ==================== Middleware ====================

// Pre-save hook: Automatically calculate word count when content changes
documentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Count words by splitting on whitespace and filtering empty strings
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
    this.lastModified = new Date();
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);


























