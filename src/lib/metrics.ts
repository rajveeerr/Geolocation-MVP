// Lightweight in-memory metrics & health collector
// Provides: metricsMiddleware, metricsCollector
// NOTE: In production consider Prometheus or a proper time-series store.

import { Request, Response, NextFunction } from 'express';

interface RequestMetric {
  method: string;
  route: string;
  status: number;
  durationMs: number;
  timestamp: number;
}

class MetricsCollector {
  private startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private recentRequests: RequestMetric[] = [];
  private responseTimeBuckets: Record<string, number> = {
    '<100ms': 0,
    '100-300ms': 0,
    '300-1000ms': 0,
    '>1000ms': 0,
  };

  incrementRequest() {
    this.requestCount += 1;
  }

  incrementError() {
    this.errorCount += 1;
  }

  recordRequest(metric: RequestMetric) {
    this.recentRequests.push(metric);
    if (this.recentRequests.length > 100) {
      this.recentRequests.shift();
    }
    // Bucket
    if (metric.durationMs < 100) this.responseTimeBuckets['<100ms'] += 1;
    else if (metric.durationMs < 300) this.responseTimeBuckets['100-300ms'] += 1;
    else if (metric.durationMs < 1000) this.responseTimeBuckets['300-1000ms'] += 1;
    else this.responseTimeBuckets['>1000ms'] += 1;
  }

  getMetrics() {
    const uptimeSeconds = Math.round((Date.now() - this.startTime) / 1000);
    return {
      uptimeSeconds,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount ? this.errorCount / this.requestCount : 0,
      responseTimeBuckets: { ...this.responseTimeBuckets },
      recentRequests: [...this.recentRequests],
      timestamp: new Date().toISOString(),
    };
  }

  getHealthStatus() {
    const metrics = this.getMetrics();
    const healthy = metrics.errorRate < 0.2; // arbitrary threshold
    return {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: metrics.timestamp,
      uptimeSeconds: metrics.uptimeSeconds,
      requestCount: metrics.requestCount,
      errorCount: metrics.errorCount,
      errorRate: metrics.errorRate,
    };
  }

  resetMetrics() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.recentRequests = [];
    this.responseTimeBuckets = { '<100ms': 0, '100-300ms': 0, '300-1000ms': 0, '>1000ms': 0 };
    this.startTime = Date.now();
  }
}

export const metricsCollector = new MetricsCollector();

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  metricsCollector.incrementRequest();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const metric: RequestMetric = {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
      durationMs: duration,
      timestamp: Date.now(),
    };
    metricsCollector.recordRequest(metric);
    if (res.statusCode >= 500) metricsCollector.incrementError();
  });

  res.on('error', () => metricsCollector.incrementError());
  next();
}

export default metricsCollector;