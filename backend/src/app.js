/**
 * backend/src/app.js
 * Express Application Assembly Module.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Doctors Vedika API Gateway',
    version: '1.0.0',
  });
});

// API Routes mounting
app.use('/api/v1', routes);
app.use('/api', routes);


// Global Error Handler
app.use(errorHandler);

module.exports = app;
