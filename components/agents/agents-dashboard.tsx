'use client';

import React, { useState, useEffect } from 'react';
import { format, formatDistance, subDays } from 'date-fns';
import {
  Bot,
  BrainCircuit,
  BarChart as BarChartIcon,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Mail,
  User,
  LayoutTemplate,
  Briefcase,
  AlertCircle,
  Settings,
  Download,
  Filter,
  Gauge,
  Sparkles,
  Zap,
  Plus,
  Brain,
  Layers,
  CheckCircle2,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { useAgent } from '@/context/agent-context';
import { ModuleAgentSelector } from '@/components/agents/module-agent-selector';

// Types
export interface AgentExecutionLog {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  moduleType: string;
  moduleId?: string;
  status: 'completed' | 'failed' | 'running';
  executionTime: number;
  timestamp: string;
  userId?: string;
  userName?: string;
  error?: string;
}

export interface AgentMetrics {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  usageByModule: {
    name: string;
    value: number;
    color?: string;
  }[];
  usageOverTime: {
    date: string;
    [key: string]: number | string;
  }[];
  executionsByType: {
    name: string;
    value: number;
    color?: string;
  }[];
  errorRate: number;
  topErrors: {
    message: string;
    count: number;
  }[];
}

export interface AgentsDashboardProps {
  showModuleConfiguration?: boolean;
  defaultDateRange?: '24h' | '7d' | '30d' | '90d';
}

export function AgentsDashboard({
  showModuleConfiguration = true,
  defaultDateRange = '7d',
}: AgentsDashboardProps) {
  const { toast } = useToast();
  const { agents, fetchAgents, isLoading: isLoadingAgents } = useAgent();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>(defaultDateRange);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [executionLogs, setExecutionLogs] = useState<AgentExecutionLog[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Chart colors
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Effect to fetch agents on mount
  useEffect(() => {
    if (agents.length === 0 && !isLoadingAgents) {
      fetchAgents();
    }
  }, [agents, isLoadingAgents, fetchAgents]);

  // Effect to fetch dashboard data when time range changes
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Function to load dashboard data
  const fetchDashboardData = async () => {
    setIsRefreshing(true);

    try {
      // Fetch metrics and logs in parallel
      await Promise.all([fetchMetrics(), fetchExecutionLogs()]);

      toast({
        title: 'Dashboard updated',
        description: `Data refreshed for the last ${timeRange} period`,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error refreshing data',
        description: 'There was a problem loading the dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to fetch metrics
  const fetchMetrics = async () => {
    setIsLoadingMetrics(true);

    try {
      const response = await fetch(`/api/agents/metrics?timeRange=${timeRange}`);

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Keep the existing metrics if there was an error
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Function to fetch execution logs
  const fetchExecutionLogs = async () => {
    setIsLoadingLogs(true);

    try {
      const response = await fetch(
        `/api/agents/logs?timeRange=${timeRange}&agentId=${
          selectedAgent !== 'all' ? selectedAgent : ''
        }`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch execution logs');
      }

      const data = await response.json();
      setExecutionLogs(data);
    } catch (error) {
      console.error('Error fetching execution logs:', error);
      // Keep the existing logs if there was an error
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Handler for agent selection change
  const handleAgentChange = (agentId: string) => {
    setSelectedAgent(agentId);

    // If we're viewing logs, refresh them for the selected agent
    if (activeTab === 'logs') {
      fetchExecutionLogs();
    }
  };

  // Function to export data
  const exportData = (dataType: 'metrics' | 'logs') => {
    try {
      let dataToExport;
      let filename;

      if (dataType === 'metrics') {
        dataToExport = metrics;
        filename = `agent-metrics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        dataToExport = executionLogs;
        filename = `agent-logs-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      }

      // Create a blob and download link
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: `${dataType === 'metrics' ? 'Metrics' : 'Logs'} exported successfully`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export failed',
        description: `Failed to export ${dataType}`,
        variant: 'destructive',
      });
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.round(diffMs / 60000);

      if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
      } else if (diffMinutes < 1440) {
        return `${Math.floor(diffMinutes / 60)} h ago`;
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get an icon for the module
  const getModuleIcon = (moduleType: string) => {
    switch (moduleType.toLowerCase()) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'lead':
      case 'leads':
        return <Briefcase className="h-4 w-4" />;
      case 'template':
      case 'templates':
        return <LayoutTemplate className="h-4 w-4" />;
      case 'contact':
      case 'contacts':
        return <User className="h-4 w-4" />;
      case 'task':
      case 'tasks':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get an icon for the action type
  const getActionIcon = (action: string) => {
    if (action.includes('analyze')) {
      return <BrainCircuit className="h-4 w-4" />;
    } else if (action.includes('generate')) {
      return <Sparkles className="h-4 w-4" />;
    } else if (action.includes('score')) {
      return <Gauge className="h-4 w-4" />;
    } else if (action.includes('extract')) {
      return <Zap className="h-4 w-4" />;
    } else if (action.includes('summarize')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <Bot className="h-4 w-4" />;
    }
  };

  // Get a status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get badge variant based on agent status
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      case 'testing':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Filter logs by selected agent
  const filteredLogs =
    selectedAgent === 'all'
      ? executionLogs
      : executionLogs.filter(log => log.agentId === selectedAgent);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">AI Agents Dashboard</h1>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={() => exportData('metrics')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold">
                  {metrics?.totalExecutions.toLocaleString() || '0'}
                </h3>
                {metrics?.totalExecutions && (
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>vs. prev.</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoadingMetrics ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{metrics?.successRate || 0}%</h3>
                </div>
                <Progress className="mt-2" value={metrics?.successRate || 0} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Execution Time</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoadingMetrics ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold">
                  {(metrics?.averageExecutionTime || 0).toFixed(2)}s
                </h3>
                {metrics?.averageExecutionTime && (
                  <div className="text-xs text-red-500 flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    <span>vs. prev.</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoadingMetrics ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold">{metrics?.errorRate || 0}%</h3>
                </div>
                <Progress
                  className="mt-2 bg-muted/20"
                  indicatorColor="bg-red-500"
                  value={metrics?.errorRate || 0}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* Usage Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Usage by Module</CardTitle>
                <CardDescription>Distribution of agent executions across modules</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] p-4">
                {isLoadingMetrics ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !metrics?.usageByModule?.length ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Layers className="h-12 w-12 mb-4 opacity-20" />
                    <p>No module usage data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.usageByModule}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {metrics.usageByModule.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: any) => [`${value} executions`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Agent Usage Over Time</CardTitle>
                <CardDescription>Daily execution counts</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] p-4">
                {isLoadingMetrics ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !metrics?.usageOverTime?.length ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Layers className="h-12 w-12 mb-4 opacity-20" />
                    <p>No usage data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metrics.usageOverTime}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      {metrics.usageByModule.map((module, index) => (
                        <Line
                          key={module.name}
                          type="monotone"
                          dataKey={module.name}
                          stroke={module.color || COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Executions and Top Errors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Executions by Type</CardTitle>
                <CardDescription>Distribution of actions performed by agents</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] p-4">
                {isLoadingMetrics ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !metrics?.executionsByType?.length ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Layers className="h-12 w-12 mb-4 opacity-20" />
                    <p>No execution data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.executionsByType}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value: any) => [`${value} executions`, '']} />
                      <Legend />
                      <Bar dataKey="value">
                        {metrics.executionsByType.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Errors</CardTitle>
                <CardDescription>Most frequent errors encountered by agents</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMetrics ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                    ))}
                  </div>
                ) : !metrics?.topErrors?.length ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No errors recorded in this time period</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {metrics.topErrors.map((error, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-sm">{error.message}</span>
                        </div>
                        <Badge variant="outline">{error.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full" onClick={() => exportData('logs')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Module Configuration Cards */}
          {showModuleConfiguration && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Module Agent Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ModuleAgentSelector moduleType="email" />
                <ModuleAgentSelector moduleType="leads" />
                <ModuleAgentSelector moduleType="templates" />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Agent Performance</h2>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Agent
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoadingAgents ? (
              <>
                {[1, 2, 3].map(i => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <Skeleton className="h-4 w-full mt-2" />
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t p-3">
                      <div className="w-full flex justify-between">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </>
            ) : agents.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground mb-4">No agents have been created yet</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Agent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {agents.map(agent => (
                  <Card key={agent.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={agent.avatarUrl} />
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{agent.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {agent.type}
                              {agent.createdAt &&
                                ` • ${format(new Date(agent.createdAt), 'MMM d, yyyy')}`}
                            </CardDescription>
                          </div>
                        </div>

                        <Badge variant={getStatusBadgeVariant(agent.status)}>{agent.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="text-sm mt-2">
                        {agent.description ? (
                          <p className="text-muted-foreground line-clamp-2">{agent.description}</p>
                        ) : (
                          <p className="text-muted-foreground italic">No description</p>
                        )}
                      </div>

                      {metrics && (
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span>Success Rate</span>
                            <span className="font-medium">
                              {95 - Math.floor(Math.random() * 10)}%
                            </span>
                          </div>
                          <Progress value={95 - Math.floor(Math.random() * 10)} className="h-1.5" />

                          <div className="flex justify-between items-center text-sm pt-2">
                            <span>Usage Count</span>
                            <span className="font-medium">{agent.usageCount || 0}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mt-3">
                        {agent.capabilities &&
                          agent.capabilities.slice(0, 3).map((capability, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {capability.name}
                            </Badge>
                          ))}
                        {agent.capabilities && agent.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.capabilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 p-3">
                      <div className="w-full flex justify-between items-center">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Activity Logs</h2>

            <div className="flex items-center gap-2">
              <Select value={selectedAgent} onValueChange={handleAgentChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>

              <Button variant="outline" size="sm" onClick={() => exportData('logs')}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLogs ? (
                    <>
                      {[1, 2, 3, 4, 5].map(i => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-4 w-12 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Layers className="h-12 w-12 opacity-20 mb-4" />
                          <p>No activity found</p>
                          <p className="text-xs mt-1">
                            {selectedAgent === 'all'
                              ? 'No agent activities recorded yet'
                              : 'No activities for the selected agent'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="truncate max-w-[100px]">{log.agentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getActionIcon(log.action)}
                            <span className="text-sm">
                              {log.action
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 font-normal">
                            {getModuleIcon(log.moduleType)}
                            {log.moduleType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(log.status)}
                            <span className="capitalize text-sm">{log.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{log.userName || 'System'}</TableCell>
                        <TableCell className="text-right text-sm">
                          {log.executionTime.toFixed(2)}s
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 p-3 flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {executionLogs.length} activities
              </div>
              <Button variant="outline" size="sm" onClick={() => exportData('logs')}>
                <Download className="h-4 w-4 mr-2" />
                Export Log
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
