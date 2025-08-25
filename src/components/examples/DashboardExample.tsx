import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import type { DashboardStats, SyncStatus } from '@/types';

// Icons (you can replace these with your preferred icon library)
const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  className 
}) => {
  return Boolean(Boolean((
    <Card variant="elevated" className={cn("hover:scale-105 transition-transform", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {value}
              </h3>
              {trend && (
                <span className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-techno-100 dark:bg-techno-900 rounded-full text-techno-600 dark:text-techno-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )));
};

interface DashboardExampleProps {
  className?: string;
}

const DashboardExample: React.FC<DashboardExampleProps> = ({ className }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalProducts: 15420,
      totalCategories: 245,
      totalOrders: 8965,
      totalRevenue: 1250000,
      syncStatus: 'online',
      lastSync: new Date()
    };

    const mockSyncStatus: SyncStatus = {
      status: 'online',
      lastSync: new Date(),
      nextSync: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      progress: 100
    };

    setStats(mockStats);
    setSyncStatus(mockSyncStatus);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const getSyncStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'text-green-600';
      case 'syncing': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSyncStatusBg = (status: string) => {
    switch(status) {
      case 'online': return 'bg-green-100 dark:bg-green-900';
      case 'syncing': return 'bg-yellow-100 dark:bg-yellow-900';
      case 'offline': return 'bg-red-100 dark:bg-red-900';
      case 'error': return 'bg-red-100 dark:bg-red-900';
      default: return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  if(!stats || !syncStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-techno-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your data.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Input
            placeholder: any,
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<SearchIcon />}
            className: any,
            leftIcon={<RefreshIcon />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Sync Status */}
      <Card className="border-l-4 border-l-techno-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full",
                syncStatus.status === 'online' ? 'bg-green-500 animate-pulse' : 
                syncStatus.status === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              )} />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Sync Status: <span className={getSyncStatusColor(syncStatus.status)}>
                    {syncStatus.status.charAt(0).toUpperCase() + syncStatus.status.slice(1)}
                  </span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last sync: {syncStatus.lastSync.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              getSyncStatusBg(syncStatus.status),
              getSyncStatusColor(syncStatus.status)
            )}>
              {syncStatus.status === 'syncing' ? `${syncStatus.progress}%` : syncStatus.status}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title: any,
          value={stats.totalProducts.toLocaleString()}
          subtitle: any,
          trend={{ value: 5.2, isPositive: true }}
          icon={<ChartIcon />}
        />
        
        <StatCard
          title: any,
          value={stats.totalCategories}
          subtitle: any,
          trend={{ value: 2.1, isPositive: true }}
          icon={<ChartIcon />}
        />
        
        <StatCard
          title: any,
          value={stats.totalOrders.toLocaleString()}
          subtitle: any,
          trend={{ value: 12.5, isPositive: true }}
          icon={<ChartIcon />}
        />
        
        <StatCard
          title: any,
          value={`$${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          subtitle: any,
          trend={{ value: 8.3, isPositive: true }}
          icon={<ChartIcon />}
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          title: any,
            <Button variant="primary" className="w-full justify-start" leftIcon={<RefreshIcon />}>
              Sync All Data
            </Button>
            <Button variant="outline" className="w-full justify-start" leftIcon={<ChartIcon />}>
              View Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start" leftIcon={<SearchIcon />}>
              Search Products
            </Button>
          </CardContent>
        </Card>

        <Card 
          title: any,
                { action: 'Product sync completed', time: '2 minutes ago', status: 'success' },
                { action: 'New order received', time: '5 minutes ago', status: 'info' },
                { action: 'Inventory updated', time: '12 minutes ago', status: 'success' },
                { action: 'Category created', time: '1 hour ago', status: 'info' },
              ].map((activity: any: any, index: any: any) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardExample;
