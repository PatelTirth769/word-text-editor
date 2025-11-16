/**
 * Logger Utility
 * 
 * Configures Winston logger for the application.
 * 
 * Features:
 * - Logs to files (error.log, combined.log)
 * - Console logging in non-production environments
 * - JSON format for structured logging
 * - Timestamp and error stack traces included
 */

const winston = require('winston');

// Create Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'word-editor-backend' },
  transports: [
    // Log errors to separate file
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Log all messages to combined log file
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// In development, also log to console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;








































