// Vercel Serverless Function Entry Point
const express = require('express');
const cors = require('cors');

// Import routes
const cricketRoutes = require('./routes/cricket');
const sportsRoutes = require('./routes/sports');
const healthRoutes = require('./routes/health');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://matcharena-app-e3d24.web.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/cricket', cricketRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api', healthRoutes);

// Export for Vercel
module.exports = app;
