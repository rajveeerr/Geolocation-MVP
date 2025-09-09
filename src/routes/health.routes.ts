import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { metricsCollector } from '../lib/metrics';
import logger from '../lib/logging/logger';

const router = Router();

// Basic health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'GeolocationMVPBackend',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

// Detailed health check with metrics
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const dbResponseTime = Date.now() - startTime;
    const healthStatus = metricsCollector.getHealthStatus();
    
    res.status(200).json({
      ...healthStatus,
      database: {
        status: 'connected',
        responseTime: dbResponseTime,
      },
    });
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if database is ready
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Database not ready',
    });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Metrics endpoint
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getMetrics();
    res.status(200).json({
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Metrics retrieval failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

// Reset metrics endpoint (for testing/admin purposes)
router.post('/metrics/reset', (req: Request, res: Response) => {
  try {
    metricsCollector.resetMetrics();
    logger.info('Metrics reset requested');
    res.status(200).json({
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Metrics reset failed:', error);
    res.status(500).json({
      error: 'Failed to reset metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
