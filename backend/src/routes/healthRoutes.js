import express from 'express';
import osu from 'node-os-utils';
import monitoringService from '../services/monitoringService.js';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Health check endpoint for monitoring service status
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-12-28T01:37:48.638Z"
 *                 uptime:
 *                   type: number
 *                   format: float
 *                   example: 123.456
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
router.get('/', async (req, res) => {
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

export default router;
