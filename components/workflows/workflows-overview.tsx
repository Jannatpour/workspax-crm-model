'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Activity,
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  MoreVertical,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';

// Mock data for workflows
const mockWorkflows = [
  {
    id: 'wf1',
    name: 'Customer Onboarding',
    status: 'active',
    lastRun: '2025-05-12T14:30:00Z',
    steps: 5,
    assignees: ['Alex Kim', 'Jamie Smith'],
    avgCompletionTime: '3 days',
  },
  {
    id: 'wf2',
    name: 'Email Campaign Review',
    status: 'paused',
    lastRun: '2025-05-10T09:15:00Z',
    steps: 4,
    assignees: ['Morgan Lee'],
    avgCompletionTime: '2 days',
  },
  {
    id: 'wf3',
    name: 'Contract Approval',
    status: 'active',
    lastRun: '2025-05-14T10:45:00Z',
    steps: 7,
    assignees: ['Taylor Jones', 'Riley Chen', 'Sam Wilson'],
    avgCompletionTime: '5 days',
  },
  {
    id: 'wf4',
    name: 'Content Publishing',
    status: 'draft',
    lastRun: null,
    steps: 6,
    assignees: [],
    avgCompletionTime: 'N/A',
  },
];

// Workflow statistics for the dashboard
const workflowStats = [
  { title: 'Active Workflows', value: 2, icon: <Activity className="h-4 w-4 text-emerald-500" /> },
  {
    title: 'Avg. Completion Time',
    value: '3.5 days',
    icon: <Clock className="h-4 w-4 text-blue-500" />,
  },
  { title: 'Total Workflows', value: 4, icon: <Calendar className="h-4 w-4 text-purple-500" /> },
  { title: 'Team Members', value: 5, icon: <Users className="h-4 w-4 text-amber-500" /> },
];

export function WorkflowsOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filteredWorkflows, setFilteredWorkflows] = useState(mockWorkflows);

  // Filter workflows based on search query and active tab
  useEffect(() => {
    let filtered = mockWorkflows;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(workflow =>
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === activeTab);
    }

    setFilteredWorkflows(filtered);
  }, [searchQuery, activeTab]);

  // Format date to be more readable
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <Check className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Paused
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workflows</h1>
        <Button className="whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" /> Create Workflow
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {workflowStats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-sm font-medium text-muted-foreground truncate">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Manage Workflows</CardTitle>
          <CardDescription className="mt-1">
            View and manage your team's automated workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-4 sm:px-0">
            <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="h-9">
                  <TabsTrigger value="all" className="px-3">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="active" className="px-3">
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="paused" className="px-3">
                    Paused
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="px-3">
                    Drafts
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search workflows..."
                className="w-full sm:w-[250px] pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[240px]">Name</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Steps</TableHead>
                  <TableHead className="whitespace-nowrap">Last Run</TableHead>
                  <TableHead className="whitespace-nowrap">Avg. Time</TableHead>
                  <TableHead className="whitespace-nowrap">Assignees</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkflows.length > 0 ? (
                  filteredWorkflows.map(workflow => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate max-w-[230px]">{workflow.name}</div>
                            </TooltipTrigger>
                            <TooltipContent>{workflow.name}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(workflow.status)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{workflow.steps}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(workflow.lastRun)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {workflow.avgCompletionTime}
                      </TableCell>
                      <TableCell>
                        {workflow.assignees.length ? (
                          <div className="flex items-center">
                            <span className="whitespace-nowrap">{workflow.assignees.length}</span>
                            {workflow.assignees.length > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="ml-2 text-muted-foreground truncate max-w-[80px] inline-block align-bottom">
                                      {workflow.assignees[0]}
                                      {workflow.assignees.length > 1 &&
                                        ` +${workflow.assignees.length - 1}`}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>{workflow.assignees.join(', ')}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground whitespace-nowrap">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-0 pr-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>Run Now</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No workflows found.{' '}
                      {searchQuery ? 'Try a different search term.' : 'Create your first workflow.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4 sm:p-6">
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button variant="outline" size="sm">
            Import
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
