import express from 'express';
import osu from 'node-os-utils';
import monitoringService from '../services/monitoringService.js';

const router = express.Router();

// Simple health check for load balancers (Koyeb, etc.)
// Returns 200 quickly without expensive operations
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Full health check with system metrics
router.get('/ready', async (req, res) => {
  try {
    // Get system metrics
    const cpuUsage = await osu.cpu.usage();
    const memInfo = await osu.mem.info();
    const osInfo = await osu.os.oos();

    // Get application metrics
    const metrics = monitoringService.getMetrics();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      system: {
        platform: osInfo,
        cpu: {
          usage: `${cpuUsage}%`
        },
        memory: {
          total: `${(memInfo.totalMemMb / 1024).toFixed(2)} GB`,
          used: `${(memInfo.usedMemMb / 1024).toFixed(2)} GB`,
          free: `${(memInfo.freeMemMb / 1024).toFixed(2)} GB`,
          usage: `${memInfo.usedMemPercentage}%`
        }
      },
      metrics: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
