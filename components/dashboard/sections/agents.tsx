'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bot,
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  PenSquare,
  Trash2,
  Copy,
  Users,
  Terminal,
  MessageSquare,
  BarChart3,
  BrainCircuit,
  Mail,
  CalendarDays,
  BellRing,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock AI agents data
const mockAgents = [
  {
    id: '1',
    name: 'Sales Assistant',
    description: 'Handles initial outreach and follow-ups with leads',
    status: 'active',
    type: 'email',
    stats: {
      messagesHandled: 458,
      responseRate: 92,
      averageResponseTime: '12m',
      positiveRating: 87,
    },
    lastActivity: new Date('2023-05-10T16:30:00'),
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Meeting Scheduler',
    description: 'Coordinates and schedules meetings with clients',
    status: 'active',
    type: 'calendar',
    stats: {
      messagesHandled: 312,
      responseRate: 98,
      averageResponseTime: '8m',
      positiveRating: 94,
    },
    lastActivity: new Date('2023-05-09T14:45:00'),
    createdAt: new Date('2023-02-20'),
  },
  {
    id: '3',
    name: 'Support Helper',
    description: 'Answers common customer questions and routes complex issues',
    status: 'paused',
    type: 'chat',
    stats: {
      messagesHandled: 1023,
      responseRate: 89,
      averageResponseTime: '4m',
      positiveRating: 83,
    },
    lastActivity: new Date('2023-05-01T10:15:00'),
    createdAt: new Date('2022-12-05'),
  },
  {
    id: '4',
    name: 'Lead Qualifier',
    description: 'Qualifies leads based on predefined criteria',
    status: 'active',
    type: 'email',
    stats: {
      messagesHandled: 267,
      responseRate: 95,
      averageResponseTime: '15m',
      positiveRating: 88,
    },
    lastActivity: new Date('2023-05-08T11:30:00'),
    createdAt: new Date('2023-03-10'),
  },
];

// Agent Card component
const AgentCard = ({ agent, onEdit, onToggleStatus, onDelete, onDuplicate }) => {
  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'paused':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTypeIcon = type => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'calendar':
        return <CalendarDays className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const formatDate = date => {
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {agent.name}
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(agent.status)}`}>
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </span>
            </CardTitle>
            <CardDescription>{agent.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Agent Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(agent.id)}>
                <PenSquare className="h-4 w-4 mr-2" />
                Edit Agent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(agent.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(agent.id)}>
                {agent.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Agent
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate Agent
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(agent.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Messages</p>
            <p className="text-lg font-medium">{agent.stats.messagesHandled}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Response Rate</p>
            <p className="text-lg font-medium">{agent.stats.responseRate}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Response</p>
            <p className="text-lg font-medium">{agent.stats.averageResponseTime}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="text-lg font-medium">{agent.stats.positiveRating}%</p>
          </div>
        </div>
        <div className="border-t pt-2 flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BellRing className="h-3 w-3" />
            Last active {formatDate(agent.lastActivity)}
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {getTypeIcon(agent.type)}
            {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Agent Creation Form component
const AgentCreationForm = ({ onCancel, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('email');

  const handleSubmit = e => {
    e.preventDefault();
    onCreate({
      name,
      description,
      type,
      status: 'active',
      stats: {
        messagesHandled: 0,
        responseRate: 0,
        averageResponseTime: '0m',
        positiveRating: 0,
      },
      lastActivity: new Date(),
      createdAt: new Date(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create AI Agent</CardTitle>
        <CardDescription>Configure a new AI agent to automate tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="agent-name" className="text-sm font-medium">
              Agent Name
            </label>
            <Input
              id="agent-name"
              placeholder="E.g. Sales Assistant, Meeting Scheduler"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="agent-description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="agent-description"
              placeholder="What tasks will this agent handle?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Agent Type</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={type === 'email' ? 'default' : 'outline'}
                className="flex flex-col items-center justify-center h-24 gap-2"
                onClick={() => setType('email')}
              >
                <Mail className="h-8 w-8" />
                <span>Email Agent</span>
              </Button>
              <Button
                type="button"
                variant={type === 'chat' ? 'default' : 'outline'}
                className="flex flex-col items-center justify-center h-24 gap-2"
                onClick={() => setType('chat')}
              >
                <MessageSquare className="h-8 w-8" />
                <span>Chat Agent</span>
              </Button>
              <Button
                type="button"
                variant={type === 'calendar' ? 'default' : 'outline'}
                className="flex flex-col items-center justify-center h-24 gap-2"
                onClick={() => setType('calendar')}
              >
                <CalendarDays className="h-8 w-8" />
                <span>Calendar Agent</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Agent Capabilities</label>
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <span className="text-sm">Natural language processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">Contextual conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span className="text-sm">API integrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Customizable responses</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create Agent</Button>
      </CardFooter>
    </Card>
  );
};

// Agent Overview component
const AgentOverview = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-800">
                <Bot className="h-6 w-6 text-indigo-700 dark:text-indigo-300" />
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                3 Active
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
              <h3 className="text-2xl font-bold">4</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-800">
                <MessageSquare className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                This Month
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Messages Handled</p>
              <h3 className="text-2xl font-bold">2,060</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-800">
                <BarChart3 className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                87.5%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
              <h3 className="text-2xl font-bold">93.5%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Agent activity over the past 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <div className="flex justify-center items-center h-full text-muted-foreground">
            [Performance chart would be displayed here]
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Performing Agents</CardTitle>
            <CardDescription>Based on success rate and response time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAgents
                .sort((a, b) => b.stats.positiveRating - a.stats.positiveRating)
                .slice(0, 3)
                .map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-4 pb-3 border-b last:border-0 last:pb-0"
                  >
                    <div className="rounded-full bg-primary/10 w-8 h-8 flex items-center justify-center text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{agent.name}</p>
                        <Badge variant="outline">{agent.stats.positiveRating}% Rating</Badge>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{agent.stats.messagesHandled} Messages</span>
                        <span>{agent.stats.averageResponseTime} Avg Response</span>
                      </div>
                      <Progress value={agent.stats.positiveRating} className="h-1.5 mt-2" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Agent Activity</CardTitle>
            <CardDescription>Latest interactions and events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <div key={index} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index % 3 === 0
                          ? 'bg-blue-100 text-blue-700'
                          : index % 3 === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {index % 3 === 0 ? (
                        <Mail className="h-4 w-4" />
                      ) : index % 3 === 1 ? (
                        <CalendarDays className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {index % 3 === 0
                          ? 'Email sent by Sales Assistant'
                          : index % 3 === 1
                          ? 'Meeting scheduled by Scheduler'
                          : 'Chat responded by Support Helper'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {index % 3 === 0
                          ? 'Sent follow-up email to lead John Doe.'
                          : index % 3 === 1
                          ? 'Scheduled meeting with client for next Tuesday.'
                          : 'Responded to support question about pricing.'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(Date.now() - (index + 1) * 30 * 60 * 1000).toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export function AgentsSection() {
  const { changeSection } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState(mockAgents);

  // Handler for editing an agent
  const handleEditAgent = agentId => {
    // In a real app, this would navigate to the agent edit view
    console.log(`Edit agent ${agentId}`);
  };

  // Handler for toggling agent status
  const handleToggleStatus = agentId => {
    setAgents(
      agents.map(agent => {
        if (agent.id === agentId) {
          return {
            ...agent,
            status: agent.status === 'active' ? 'paused' : 'active',
          };
        }
        return agent;
      })
    );
  };

  // Handler for deleting an agent
  const handleDeleteAgent = agentId => {
    setAgents(agents.filter(agent => agent.id !== agentId));
  };

  // Handler for duplicating an agent
  const handleDuplicateAgent = agentId => {
    const agentToDuplicate = agents.find(agent => agent.id === agentId);
    if (agentToDuplicate) {
      const newAgent = {
        ...agentToDuplicate,
        id: Date.now().toString(),
        name: `${agentToDuplicate.name} (Copy)`,
        createdAt: new Date(),
        lastActivity: new Date(),
      };
      setAgents([...agents, newAgent]);
    }
  };

  // Handler for creating a new agent
  const handleCreateAgent = newAgent => {
    setAgents([
      ...agents,
      {
        ...newAgent,
        id: Date.now().toString(),
      },
    ]);
    setShowCreationForm(false);
  };

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    return (
      agent.name.toLowerCase().includes(searchLower) ||
      agent.description.toLowerCase().includes(searchLower) ||
      agent.type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">AI Agents</h1>
        <Button onClick={() => setShowCreationForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {showCreationForm ? (
        <AgentCreationForm
          onCancel={() => setShowCreationForm(false)}
          onCreate={handleCreateAgent}
        />
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto mb-4">
              <TabsTrigger value="overview" className="flex-1">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="my-agents" className="flex-1">
                <Bot className="h-4 w-4 mr-2" />
                My Agents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AgentOverview />
            </TabsContent>

            <TabsContent value="my-agents">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search agents..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-muted-foreground">
                    No agents found matching your criteria
                  </div>
                ) : (
                  filteredAgents.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onEdit={handleEditAgent}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteAgent}
                      onDuplicate={handleDuplicateAgent}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
