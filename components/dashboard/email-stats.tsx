'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  RefreshCcw,
  BarChart2,
  Download,
  Eye,
  MessageSquare,
  Clock,
  MailCheck,
  TrendingUp,
  TrendingDown,
  MailX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Use these imports in production with your real API
// import { fetchEmailStats, fetchEmailTrends } from '@/lib/api/stats';

/**
 * Time period options for stats filtering
 */
type TimePeriod = '24h' | '7d' | '30d' | '90d' | 'custom';

/**
 * Chart type options
 */
type ChartType = 'line' | 'bar' | 'pie' | 'area';

/**
 * Properties for the EmailStats component
 */
interface EmailStatsProps {
  defaultPeriod?: TimePeriod;
  showDetailedMetrics?: boolean;
  className?: string;
}

// Mock data for development
const mockStats = {
  sent: 3518,
  delivered: 3454,
  opened: 1586,
  clicked: 693,
  bounced: 64,
  openRate: 0.46,
  clickRate: 0.2,
  clickToOpenRate: 0.44,
  bounceRate: 0.018,
};

const mockTrends = [
  { date: '2025-05-05', sent: 450, delivered: 442, opened: 201, clicked: 89 },
  { date: '2025-05-06', sent: 512, delivered: 505, opened: 225, clicked: 94 },
  { date: '2025-05-07', sent: 478, delivered: 470, opened: 215, clicked: 97 },
  { date: '2025-05-08', sent: 562, delivered: 550, opened: 250, clicked: 115 },
  { date: '2025-05-09', sent: 510, delivered: 499, opened: 235, clicked: 101 },
  { date: '2025-05-10', sent: 486, delivered: 479, opened: 220, clicked: 92 },
  { date: '2025-05-11', sent: 520, delivered: 509, opened: 240, clicked: 105 },
];

// Device data
const mockDeviceData = [
  { name: 'Desktop', value: 642 },
  { name: 'Mobile', value: 812 },
  { name: 'Tablet', value: 132 },
];

// Component to show trend indicator
const TrendIndicator = ({ value, trend }: { value: number; trend: 'up' | 'down' | 'neutral' }) => {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  };

  return (
    <div className={cn('flex items-center', trendColors[trend])}>
      {trend === 'up' ? (
        <TrendingUp className="h-3 w-3 mr-1" />
      ) : trend === 'down' ? (
        <TrendingDown className="h-3 w-3 mr-1" />
      ) : (
        <div className="h-3 w-3 mr-1" />
      )}
      <span className="text-xs font-medium">{value}%</span>
    </div>
  );
};

// Loading skeleton
const EmailStatsSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-10 w-[150px]" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(4)
        .fill(null)
        .map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>

    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  </div>
);

// Error display
const ErrorDisplay = ({ onRetry }: { onRetry: () => void }) => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
      <MailX className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-medium mb-2">Unable to load email statistics</h3>
      <p className="text-muted-foreground max-w-md mb-4">
        There was an error loading your email statistics. Please try again later.
      </p>
      <Button onClick={onRetry}>
        <RefreshCcw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </CardContent>
  </Card>
);

// Main component
function EmailStats({
  defaultPeriod = '7d',
  showDetailedMetrics = true,
  className,
}: EmailStatsProps) {
  // State
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(defaultPeriod);
  const [chartType, setChartType] = useState<ChartType>('area');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  // In a real implementation, you would use React Query or SWR
  // const { data: stats, isLoading, error, refetch } = useQuery(['emailStats', selectedPeriod],
  //   () => fetchEmailStats({ period: selectedPeriod }));

  // Using mock data for development
  const stats = mockStats;
  const trends = mockTrends;

  // Format percentages for display
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Prepare chart data
  const chartData = useMemo(() => {
    return trends.map(item => ({
      name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sent: item.sent,
      delivered: item.delivered,
      opened: item.opened,
      clicked: item.clicked,
    }));
  }, [trends]);

  // Device data with colors
  const deviceData = useMemo(() => {
    return mockDeviceData.map((item, index) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];
      return {
        ...item,
        color: colors[index % colors.length],
      };
    });
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    // In a real implementation, you would call refetch()

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Handle period changes
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value as TimePeriod);
    // In a real implementation, this would trigger data refetching
  };

  // Get period description
  const getPeriodDescription = (): string => {
    switch (selectedPeriod) {
      case '24h':
        return 'Last 24 hours';
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      case '90d':
        return 'Last 90 days';
      case 'custom':
        return 'Custom date range';
      default:
        return 'Email Statistics';
    }
  };

  // Download stats as CSV
  const downloadStats = () => {
    // Prepare CSV data
    const headers = ['Date', 'Sent', 'Delivered', 'Opened', 'Clicked'];
    const csvContent = [
      headers.join(','),
      ...trends.map(item =>
        [item.date, item.sent, item.delivered, item.opened, item.clicked].join(',')
      ),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `email_stats_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render appropriate chart based on chart type
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="delivered" stroke="#82ca9d" />
              <Line type="monotone" dataKey="opened" stroke="#ffc658" />
              <Line type="monotone" dataKey="clicked" stroke="#ff8042" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="sent" fill="#8884d8" />
              <Bar dataKey="delivered" fill="#82ca9d" />
              <Bar dataKey="opened" fill="#ffc658" />
              <Bar dataKey="clicked" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8042" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff8042" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="sent"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorSent)"
              />
              <Area
                type="monotone"
                dataKey="delivered"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorDelivered)"
              />
              <Area
                type="monotone"
                dataKey="opened"
                stroke="#ffc658"
                fillOpacity={1}
                fill="url(#colorOpened)"
              />
              <Area
                type="monotone"
                dataKey="clicked"
                stroke="#ff8042"
                fillOpacity={1}
                fill="url(#colorClicked)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  // Main render with error handling
  if (error) {
    return <ErrorDisplay onRetry={handleRefresh} />;
  }

  if (isLoading) {
    return <EmailStatsSkeleton />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Performance</h2>
          <p className="text-muted-foreground">{getPeriodDescription()}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={downloadStats}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-semibold">{formatPercent(stats.openRate)}</p>
                <div className="flex items-center space-x-1">
                  <TrendIndicator value={5.2} trend="up" />
                  <span className="text-xs text-muted-foreground">vs previous period</span>
                </div>
              </div>
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-semibold">{formatPercent(stats.clickRate)}</p>
                <div className="flex items-center space-x-1">
                  <TrendIndicator value={3.1} trend="up" />
                  <span className="text-xs text-muted-foreground">vs previous period</span>
                </div>
              </div>
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-semibold">{formatPercent(stats.bounceRate)}</p>
                <div className="flex items-center space-x-1">
                  <TrendIndicator value={1.2} trend="down" />
                  <span className="text-xs text-muted-foreground">vs previous period</span>
                </div>
              </div>
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <MailX className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-semibold">42 min</p>
                <div className="flex items-center space-x-1">
                  <TrendIndicator value={8.5} trend="down" />
                  <span className="text-xs text-muted-foreground">vs previous period</span>
                </div>
              </div>
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle>Email Trends</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={value => setChartType(value as ChartType)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>

      {showDetailedMetrics && (
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="devices">Device Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground mb-1">Total Sent</span>
                    <span className="text-2xl font-semibold">{stats.sent}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground mb-1">Delivered</span>
                    <span className="text-2xl font-semibold">{stats.delivered}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground mb-1">Opened</span>
                    <span className="text-2xl font-semibold">{stats.opened}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground mb-1">Clicked</span>
                    <span className="text-2xl font-semibold">{stats.clicked}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground mb-1">Bounced</span>
                    <span className="text-2xl font-semibold">{stats.bounced}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground mb-1">Click/Open Rate</span>
                    <span className="text-2xl font-semibold">
                      {formatPercent(stats.clickToOpenRate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  {deviceData.map((device, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: device.color }}
                      ></div>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-sm">{device.name}</span>
                        <Badge variant="outline">{device.value}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Make sure to export the component
export { EmailStats }; // Named export
export default EmailStats; // Default export
