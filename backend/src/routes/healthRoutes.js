import express from 'express';
// Temporarily comment out heavy dependencies for Koyeb deployment
// import osu from 'node-os-utils';
// import monitoringService from '../services/monitoringService.js';

const router = express.Router();

// Simple health check for load balancers (Koyeb, etc.)
// Returns 200 quickly without expensive operations
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Full health check with system metrics
router.get('/ready', async (req, res) => {
  try {
    // Basic health check - skip heavy metrics for now
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
