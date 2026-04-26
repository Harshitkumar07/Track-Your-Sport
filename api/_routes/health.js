const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'vercel',
    version: '1.0.0',
    apis: {
      cricapi: {
        status: 'configured',
        hasKey: !!process.env.CRICAPI_KEY
      },
      apisports: {
        status: 'configured', 
        hasKey: !!process.env.APISPORTS_KEY
      }
    }
  });
});

router.get('/status', (req, res) => {
  res.json({
    server: 'Vercel Functions',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
