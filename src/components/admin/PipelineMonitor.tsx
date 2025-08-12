
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDataPipeline } from '@/hooks/useDataPipeline';
import { RefreshCw, Database, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const PipelineMonitor = () => {
  const { pipelineStats, syncGrants } = useDataPipeline();

  if (pipelineStats.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const { logs, sources, totalGrants, activeGrants } = pipelineStats.data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Pipeline Monitor</h2>
          <p className="text-muted-foreground">Monitor grant data ingestion and processing</p>
        </div>
        <Button 
          onClick={() => syncGrants.mutate()}
          disabled={syncGrants.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncGrants.isPending ? 'animate-spin' : ''}`} />
          {syncGrants.isPending ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grants</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGrants?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Grants</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGrants?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sources?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Connected APIs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs?.[0] ? new Date(logs[0].created_at).toLocaleDateString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {logs?.[0] ? new Date(logs[0].created_at).toLocaleTimeString() : 'No sync yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>Status of connected grant data sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources?.map((source: any) => (
              <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-sm text-muted-foreground">{source.api_url}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={source.is_active ? 'default' : 'secondary'}>
                    {source.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {source.last_sync ? `Last: ${new Date(source.last_sync).toLocaleDateString()}` : 'Never synced'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pipeline Activity</CardTitle>
          <CardDescription>Latest data ingestion and processing logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs?.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <span className="font-medium">{log.source}</span>
                    <span className="text-muted-foreground"> - {log.operation}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {log.records_processed} processed
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {(!logs || logs.length === 0) && (
              <p className="text-center text-muted-foreground py-4">No pipeline activity yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
