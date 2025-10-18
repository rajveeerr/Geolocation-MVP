import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

// Health Check Types

export interface HealthCheckResponse {
  success: boolean;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    redis?: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    storage?: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
  };
  error?: string;
}

export interface DetailedHealthCheckResponse extends HealthCheckResponse {
  metrics: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      load: number[];
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  errors: Array<{
    type: string;
    message: string;
    count: number;
    lastOccurred: string;
  }>;
}

// Hooks for Health Check

export const useHealthCheck = () => {
  return useQuery<HealthCheckResponse>({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      const res = await apiGet<HealthCheckResponse>('/health');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Health check failed');
      }
      return res.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
};

export const useDetailedHealthCheck = () => {
  return useQuery<DetailedHealthCheckResponse>({
    queryKey: ['detailedHealthCheck'],
    queryFn: async () => {
      const res = await apiGet<DetailedHealthCheckResponse>('/health/detailed');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Detailed health check failed');
      }
      return res.data;
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });
};
