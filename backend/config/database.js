/**
 * Database Configuration
 * 
 * Handles MongoDB connection using Mongoose.
 * 
 * Features:
 * - Gracefully handles missing MongoDB URI (server continues without DB)
 * - Export features (PDF/DOCX) work even without database connection
 * - Document save/load features require database connection
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * 
 * If MONGODB_URI is not provided or connection fails,
 * the server will continue running without database.
 * Export features will still work.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/word-editor';
    
    // Only connect if MongoDB URI is provided and not empty
    if (mongoUri && mongoUri.trim() !== '') {
      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } else {
      console.log('MongoDB URI not provided. Server will run without database (export features will still work).');
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('⚠️  Server will continue without database. Save functionality will use localStorage fallback.');
    console.log('   Export features (PDF/DOCX) will still work.');
    // Don't exit - allow server to run without database for export features
  }
};

module.exports = connectDB;































