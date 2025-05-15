'use client';
import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Calendar,
  Laptop,
  Smartphone,
  Tablet,
  Activity,
  CalendarClock,
  BarChart3,
  PenSquare,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  HelpCircle,
  Info,
  Filter,
  CircleSlash,
  Mail,
  MousePointer,
  AlertCircle,
  Inbox,
  Send,
  File,
  Trash2,
  Star,
  PlusCircle,
  ArrowRightToLine,
  Settings,
  LogOut,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  responseTime: 42, // in minutes
  totalUnread: 24,
  avgResponseTime: 42, // in minutes
  previousStats: {
    openRate: 0.408, // 40.8%
    clickRate: 0.169, // 16.9%
    bounceRate: 0.03, // 3.0%
    responseTime: 46, // in minutes
  },
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
  { name: 'Desktop', value: 642, percent: 0.4 },
  { name: 'Mobile', value: 812, percent: 0.51 },
  { name: 'Tablet', value: 132, percent: 0.09 },
];

// Most engaged recipients
const mockTopRecipients = [
  { name: 'John Doe', email: 'john.doe@example.com', opens: 42, clicks: 18, engagementScore: 89 },
  { name: 'Sarah Smith', email: 'sarah.s@example.com', opens: 38, clicks: 15, engagementScore: 85 },
  { name: 'Alex Johnson', email: 'alex.j@example.com', opens: 35, clicks: 13, engagementScore: 81 },
  { name: 'Lisa Brown', email: 'lisa.b@example.com', opens: 29, clicks: 11, engagementScore: 76 },
];

Email Sidebar Items
const mailboxItems = [
  { name: 'Inbox', icon: Inbox, count: 24, path: '/inbox' },
  { name: 'Starred', icon: Star, count: 7, path: '/starred' },
  { name: 'Sent', icon: Send, count: 145, path: '/sent' },
  { name: 'Drafts', icon: File, count: 3, path: '/drafts' },
  { name: 'Trash', icon: Trash2, count: 18, path: '/trash' },
];

// Component to show trend indicator
const TrendIndicator = ({ value, trend }: { value: number; trend: 'up' | 'down' | 'neutral' }) => {
  return (
    <div
      className={cn('flex items-center', {
        'text-green-600 dark:text-green-400': trend === 'up',
        'text-red-600 dark:text-red-400': trend === 'down',
        'text-gray-500': trend === 'neutral',
      })}
    >
      {trend === 'up' ? (
        <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
      ) : trend === 'down' ? (
        <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
      ) : (
        <div className="h-3.5 w-3.5 mr-1" />
      )}
      <span className="text-xs font-medium">{value.toFixed(1)}%</span>
    </div>
  );
};

// Mail Sidebar Component

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

/**
 * Properties for the EmailStats component
 */
interface EmailStatsProps {
  defaultPeriod?: '24h' | '7d' | '30d' | '90d' | 'custom';
  showDetailedMetrics?: boolean;
  className?: string;
}

// Email Stats Component
function EmailStats({
  defaultPeriod = '7d',
  showDetailedMetrics = true,
  className,
}: EmailStatsProps) {
  // State
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar' | 'pie'>('area');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Using mock data for development
  const stats = mockStats;
  const trends = mockTrends;

  // Calculate trend percentages
  const calculateTrend = (current: number, previous: number) => {
    const percentChange = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(percentChange),
      trend:
        percentChange > 0
          ? 'up'
          : percentChange < 0
          ? 'down'
          : ('neutral' as 'up' | 'down' | 'neutral'),
    };
  };

  // Calculate metrics changes
  const openRateTrend = calculateTrend(stats.openRate, stats.previousStats.openRate);
  const clickRateTrend = calculateTrend(stats.clickRate, stats.previousStats.clickRate);
  const bounceRateTrend = calculateTrend(stats.bounceRate, stats.previousStats.bounceRate);
  const responseTimeTrend = calculateTrend(stats.responseTime, stats.previousStats.responseTime);

  // Determine if decrease is good (for bounce rate and response time)
  if (bounceRateTrend.trend === 'down') bounceRateTrend.trend = 'up';
  else if (bounceRateTrend.trend === 'up') bounceRateTrend.trend = 'down';

  if (responseTimeTrend.trend === 'down') responseTimeTrend.trend = 'up';
  else if (responseTimeTrend.trend === 'up') responseTimeTrend.trend = 'down';

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
    setSelectedPeriod(value as '24h' | '7d' | '30d' | '90d' | 'custom');
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

  // Get period date range
  const getPeriodDateRange = (): string => {
    const endDate = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        return '';
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
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

  // Get chart colors
  const getChartColors = () => {
    return {
      sent: '#8884d8',
      delivered: '#82ca9d',
      opened: '#ffc658',
      clicked: '#ff8042',
    };
  };

  // Render appropriate chart based on chart type
  const renderChart = () => {
    const colors = getChartColors();

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sent"
                name="Sent"
                stroke={colors.sent}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="delivered"
                name="Delivered"
                stroke={colors.delivered}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="opened"
                name="Opened"
                stroke={colors.opened}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="clicked"
                name="Clicked"
                stroke={colors.clicked}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="sent" name="Sent" fill={colors.sent} radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="delivered"
                name="Delivered"
                fill={colors.delivered}
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="opened" name="Opened" fill={colors.opened} radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicked" name="Clicked" fill={colors.clicked} radius={[4, 4, 0, 0]} />
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
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.sent} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors.sent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.delivered} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors.delivered} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.opened} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors.opened} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.clicked} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors.clicked} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="sent"
                name="Sent"
                stroke={colors.sent}
                fillOpacity={1}
                fill="url(#colorSent)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="delivered"
                name="Delivered"
                stroke={colors.delivered}
                fillOpacity={1}
                fill="url(#colorDelivered)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="opened"
                name="Opened"
                stroke={colors.opened}
                fillOpacity={1}
                fill="url(#colorOpened)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="clicked"
                name="Clicked"
                stroke={colors.clicked}
                fillOpacity={1}
                fill="url(#colorClicked)"
                strokeWidth={2}
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
      {/* Header Section with Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Email Performance
          </h2>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span>{getPeriodDescription()}</span>
            {getPeriodDateRange() && (
              <span className="text-xs opacity-80">({getPeriodDateRange()})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[130px] h-9">
              <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9" onClick={handleRefresh}>
            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="outline" size="sm" className="h-9" onClick={downloadStats}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Open Rate Card */}
        <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <CardContent className="p-4 pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPercent(stats.openRate)}
                </p>
                <div className="flex items-center space-x-1">
                  <TrendIndicator value={openRateTrend.value} trend={openRateTrend.trend} />
                  <span className="text-xs text-muted-foreground">vs previous period</span>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 rounded-full p-3">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Click Rate Card */}
        <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
          <CardContent className="p-4 pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatPercent(stats.clickRate)}
                </p>
                <div className="flex items-center space-x-1">
                  <TrendIndicator value={clickRateTrend.value} trend={clickRateTrend.trend} />
                  <span className="text-xs text-muted-foreground">vs previous period</span>
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950 rounded-full p-3">
                <MousePointer className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bounce Rate Card */}
        <Card className="overflow-hidden border-red-100 dark:border-red-900">
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
          <CardContent className="p-4 pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Bounce Rate</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatPercent(stats.bounceRate)}
                </p>
                <div className="flex items-center space-x-1">
                  <TrendIndicator value={bounceRateTrend.value} trend={bounceRateTrend.trend} />
                  <span className="text-xs text-muted-foreground">vs previous period</span>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-950 rounded-full p-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Card */}
        <Card className="overflow-hidden border-green-100 dark:border-green-900">
          <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
          <CardContent className="p-4 pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.responseTime} min
                </p>
                <div className="flex items-center space-x-1">
                  <TrendIndicator value={responseTimeTrend.value} trend={responseTimeTrend.trend} />
                  <span className="text-xs text-muted-foreground">vs previous period</span>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950 rounded-full p-3">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Summary Card */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Email Trends Chart */}
        <Card className="overflow-hidden border-blue-100 dark:border-blue-900 lg:col-span-2">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-blue-100 dark:border-blue-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Email Activity Trends
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={chartType} onValueChange={value => setChartType(value as any)}>
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="h-8">
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <CardDescription>Tracking email engagement over time</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4">{renderChart()}</div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-t border-blue-100 dark:border-blue-900 py-2.5 px-4 justify-between items-center">
            <div className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Last updated: Today at 9:32 AM</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setActiveTab('activity')}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Detailed Analytics
            </Button>
          </CardFooter>
        </Card>
      </div>

      {showDetailedMetrics && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity Details</TabsTrigger>
            <TabsTrigger value="devices">Device Breakdown</TabsTrigger>
            <TabsTrigger value="engagement">Top Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
              <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Email Performance Summary
                </CardTitle>
                <CardDescription>Overview of key email metrics</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-0 pb-0">
                <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-blue-100 dark:divide-blue-900">
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-sm text-muted-foreground mb-1">Total Sent</span>
                    <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                      {stats.sent.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">emails</span>
                  </div>
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-sm text-muted-foreground mb-1">Delivered</span>
                    <span className="text-2xl font-semibold text-green-600 dark:text-green-400">
                      {stats.delivered.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">emails</span>
                  </div>
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-sm text-muted-foreground mb-1">Opened</span>
                    <span className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                      {stats.opened.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">emails</span>
                  </div>
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-sm text-muted-foreground mb-1">Clicked</span>
                    <span className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                      {stats.clicked.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">emails</span>
                  </div>
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-sm text-muted-foreground mb-1">Bounced</span>
                    <span className="text-2xl font-semibold text-red-600 dark:text-red-400">
                      {stats.bounced.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">emails</span>
                  </div>
                  <div className="p-4 flex flex-col items-center text-center">
                    <span className="text-sm text-muted-foreground mb-1">Click/Open Rate</span>
                    <span className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                      {formatPercent(stats.clickToOpenRate)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">conversion</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between py-3 px-4 bg-blue-50 dark:bg-blue-950 border-t border-blue-100 dark:border-blue-900">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" /> Filter by campaign
                </p>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={downloadStats}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Export Data
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
              <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Detailed Email Activity
                </CardTitle>
                <CardDescription>Complete breakdown of email performance</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-blue-100 dark:border-blue-900 rounded-md p-4 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/50 dark:to-gray-900">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Open Rate Analysis
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Open Rate</span>
                        <span className="text-sm font-medium">{formatPercent(stats.openRate)}</span>
                      </div>
                      <div className="w-full bg-blue-100 dark:bg-blue-900 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-full rounded-full"
                          style={{ width: `${stats.openRate * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-900">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Industry Average</span>
                          <span className="text-xs">21.5%</span>
                        </div>
                        <div className="w-full bg-blue-100 dark:bg-blue-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-400/50 dark:bg-blue-600/50 h-full rounded-full"
                            style={{ width: '21.5%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-indigo-100 dark:border-indigo-900 rounded-md p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/50 dark:to-gray-900">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                      <MousePointer className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      Click Rate Analysis
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Click Rate</span>
                        <span className="text-sm font-medium">
                          {formatPercent(stats.clickRate)}
                        </span>
                      </div>
                      <div className="w-full bg-indigo-100 dark:bg-indigo-900 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full"
                          style={{ width: `${stats.clickRate * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Industry Average</span>
                          <span className="text-xs">10.8%</span>
                        </div>
                        <div className="w-full bg-indigo-100 dark:bg-indigo-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-400/50 dark:bg-indigo-600/50 h-full rounded-full"
                            style={{ width: '10.8%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-800 rounded-md mt-6 overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 text-sm font-medium">
                    Daily Email Activity
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="sent" name="Sent" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="opened" name="Opened" fill="#ffc658" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
              <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Device Breakdown
                </CardTitle>
                <CardDescription>Analysis of device usage for email opens</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <div className="space-y-6">
                      {deviceData.map((device, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: device.color }}
                              ></div>
                              <span className="text-sm font-medium">{device.name}</span>
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {device.value.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${device.percent * 100}%`,
                                backgroundColor: device.color,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-right text-muted-foreground">
                            {(device.percent * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <h3 className="text-sm font-medium mb-4">Device Trends</h3>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Smartphone className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-xs">Mobile usage</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-500">+8.2%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Laptop className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-xs">Desktop usage</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-500">-5.7%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Tablet className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs">Tablet usage</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-500">-2.5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex items-center justify-center">
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {deviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center py-3 px-4 bg-blue-50 dark:bg-blue-950 border-t border-blue-100 dark:border-blue-900">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" /> Based on{' '}
                  {mockDeviceData.reduce((sum, item) => sum + item.value, 0).toLocaleString()} email
                  opens
                </p>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Download className="h-3.5 w-3.5" /> Export Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card className="overflow-hidden border-blue-100 dark:border-blue-900">
              <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950 border-b border-blue-100 dark:border-blue-900">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Top Engaging Recipients
                </CardTitle>
                <CardDescription>Recipients with highest engagement rates</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-80">
                  <div className="divide-y divide-blue-100 dark:divide-blue-900">
                    {mockTopRecipients.map((recipient, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                index === 0
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                  : index === 1
                                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                  : index === 2
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              }`}
                            >
                              {index < 3 ? (
                                <span className="text-lg font-bold">{index + 1}</span>
                              ) : (
                                recipient.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{recipient.name}</p>
                              <p className="text-xs text-muted-foreground">{recipient.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="mb-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {recipient.engagementScore}% Score
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {recipient.opens} opens, {recipient.clicks} clicks
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between items-center py-3 px-4 bg-blue-50 dark:bg-blue-950 border-t border-blue-100 dark:border-blue-900">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" /> Engagement score based on open/click rate and
                  frequency
                </p>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <PenSquare className="h-3.5 w-3.5" /> Create Segment
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Main component integrating sidebar with email stats
const EmailDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <MailSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 overflow-auto p-6">
        <EmailStats showDetailedMetrics={true} />
      </div>
    </div>
  );
};

export { EmailStats };
export default EmailDashboard;
