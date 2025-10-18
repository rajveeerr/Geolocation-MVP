import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Server, 
  HardDrive, 
  Cpu, 
  Memory,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useHealthCheck, useDetailedHealthCheck } from '@/hooks/useHealthCheck';
import { toast } from 'sonner';

export const HealthMonitor = () => {
  const { 
    data: healthData, 
    isLoading: isLoadingHealth, 
    refetch: refetchHealth 
  } = useHealthCheck();
  
  const { 
    data: detailedHealthData, 
    isLoading: isLoadingDetailed, 
    refetch: refetchDetailed 
  } = useDetailedHealthCheck();

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchHealth(), refetchDetailed()]);
      toast.success('Health data refreshed');
    } catch (error) {
      toast.error('Failed to refresh health data');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'unhealthy':
        return 'bg-red-500';
      case 'degraded':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoadingHealth || isLoadingDetailed) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">Loading health data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Monitor</h1>
          <p className="text-muted-foreground">
            Monitor system performance and service status
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(healthData.status)}
              System Status
            </CardTitle>
            <CardDescription>
              Last updated: {new Date(healthData.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{healthData.status.toUpperCase()}</div>
                <div className="text-sm text-muted-foreground">Overall Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatUptime(healthData.uptime)}</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{healthData.version}</div>
                <div className="text-sm text-muted-foreground">Version</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{healthData.environment}</div>
                <div className="text-sm text-muted-foreground">Environment</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Status */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Individual service health checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Database */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Database</div>
                    <div className="text-sm text-muted-foreground">
                      {healthData.services.database.responseTime && 
                        `${healthData.services.database.responseTime}ms`
                      }
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={healthData.services.database.status === 'healthy' ? 'default' : 'destructive'}
                  className={getStatusColor(healthData.services.database.status)}
                >
                  {healthData.services.database.status}
                </Badge>
              </div>

              {/* Redis */}
              {healthData.services.redis && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">Redis</div>
                      <div className="text-sm text-muted-foreground">
                        {healthData.services.redis.responseTime && 
                          `${healthData.services.redis.responseTime}ms`
                        }
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={healthData.services.redis.status === 'healthy' ? 'default' : 'destructive'}
                    className={getStatusColor(healthData.services.redis.status)}
                  >
                    {healthData.services.redis.status}
                  </Badge>
                </div>
              )}

              {/* Storage */}
              {healthData.services.storage && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Storage</div>
                      <div className="text-sm text-muted-foreground">
                        {healthData.services.storage.responseTime && 
                          `${healthData.services.storage.responseTime}ms`
                        }
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={healthData.services.storage.status === 'healthy' ? 'default' : 'destructive'}
                    className={getStatusColor(healthData.services.storage.status)}
                  >
                    {healthData.services.storage.status}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      {detailedHealthData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Resources */}
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>CPU, Memory, and Disk usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CPU Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {detailedHealthData.metrics.cpu.usage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={detailedHealthData.metrics.cpu.usage} className="h-2" />
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Memory className="h-4 w-4" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {detailedHealthData.metrics.memory.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={detailedHealthData.metrics.memory.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {formatBytes(detailedHealthData.metrics.memory.used)} / {formatBytes(detailedHealthData.metrics.memory.total)}
                </div>
              </div>

              {/* Disk Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm font-medium">Disk Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {detailedHealthData.metrics.disk.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={detailedHealthData.metrics.disk.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {formatBytes(detailedHealthData.metrics.disk.used)} / {formatBytes(detailedHealthData.metrics.disk.total)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Request Metrics</CardTitle>
              <CardDescription>API performance and error rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {detailedHealthData.requests.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {detailedHealthData.requests.successful}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {detailedHealthData.requests.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {detailedHealthData.requests.averageResponseTime.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
              </div>

              {/* Success Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {((detailedHealthData.requests.successful / detailedHealthData.requests.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(detailedHealthData.requests.successful / detailedHealthData.requests.total) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Errors */}
      {detailedHealthData && detailedHealthData.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Recent Errors
            </CardTitle>
            <CardDescription>Error occurrences in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detailedHealthData.errors.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-red-600">{error.type}</div>
                    <div className="text-sm text-muted-foreground">{error.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last occurred: {new Date(error.lastOccurred).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="destructive">{error.count} occurrences</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
