'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { useRouter } from 'next/navigation';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Bot,
  ChevronRight,
  Plus,
  Search,
  MoreVertical,
  Sparkles,
  Mail,
  MessageSquare,
  Phone,
  PenSquare,
  Calendar,
  Star,
  Zap,
  PlusCircle,
  Trash2,
  Edit,
  Copy,
  PlayCircle,
  Folder,
  BarChart,
  UserPlus,
  Settings,
  Brain,
  Code,
  FileCode,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// Agent types
type AgentStatus = 'active' | 'paused' | 'draft' | 'training' | 'archived';
type AgentType =
  | 'support'
  | 'email'
  | 'sales'
  | 'scheduling'
  | 'content'
  | 'research'
  | 'assistant'
  | 'coding'
  | 'custom';

// Mock agent data
const mockAgents = [
  {
    id: 'agent1',
    name: 'Customer Support Assistant',
    description: 'Handles basic customer support queries and routes complex issues',
    type: 'support' as AgentType,
    creator: 'You',
    lastModified: '2025-05-12T14:30:00Z',
    status: 'active' as AgentStatus,
    usageCount: 1248,
    rating: 4.7,
    model: 'gpt-4o',
    provider: 'OpenAI',
    capabilities: ['web_search', 'email_access'],
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: 'agent2',
    name: 'Meeting Scheduler',
    description: 'Books meetings based on calendar availability and sends reminders',
    type: 'scheduling' as AgentType,
    creator: 'You',
    lastModified: '2025-05-01T09:15:00Z',
    status: 'active' as AgentStatus,
    usageCount: 972,
    rating: 4.2,
    model: 'claude-3-sonnet',
    provider: 'Anthropic',
    capabilities: ['calendar_access', 'email_access'],
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: 'agent3',
    name: 'Email Campaign Helper',
    description: 'Drafts and schedules email campaigns based on templates',
    type: 'email' as AgentType,
    creator: 'You',
    lastModified: '2025-04-20T11:45:00Z',
    status: 'paused' as AgentStatus,
    usageCount: 546,
    rating: 4.5,
    model: 'gpt-4-turbo',
    provider: 'OpenAI',
    capabilities: ['email_access', 'file_access'],
    icon: <Mail className="h-4 w-4" />,
  },
  {
    id: 'agent4',
    name: 'Product Recommendation Bot',
    description: 'Recommends products based on customer preferences and behavior',
    type: 'sales' as AgentType,
    creator: 'Marketing Team',
    lastModified: '2025-05-08T16:20:00Z',
    status: 'active' as AgentStatus,
    usageCount: 1850,
    rating: 4.9,
    model: 'gemini-pro',
    provider: 'Google',
    capabilities: ['database_access', 'web_search'],
    icon: <Star className="h-4 w-4" />,
  },
  {
    id: 'agent5',
    name: 'Code Assistant',
    description: 'Helps with coding tasks, debugging, and code reviews',
    type: 'coding' as AgentType,
    creator: 'You',
    lastModified: '2025-05-05T13:40:00Z',
    status: 'active' as AgentStatus,
    usageCount: 789,
    rating: 4.8,
    model: 'gpt-4o',
    provider: 'OpenAI',
    capabilities: ['code_execution', 'file_access'],
    icon: <Code className="h-4 w-4" />,
  },
  {
    id: 'agent6',
    name: 'Content Generator',
    description: 'Creates blog posts, articles, and social media content',
    type: 'content' as AgentType,
    creator: 'You',
    lastModified: '2025-05-10T10:25:00Z',
    status: 'draft' as AgentStatus,
    usageCount: 0,
    rating: 0,
    model: 'claude-3-opus',
    provider: 'Anthropic',
    capabilities: ['web_search', 'file_access'],
    icon: <PenSquare className="h-4 w-4" />,
  },
];

// Agent usage stats for the dashboard
const agentStats = [
  { label: 'Total Agents', value: '6' },
  { label: 'Total Interactions', value: '5,405' },
  { label: 'Avg. Rating', value: '4.6' },
  { label: 'Active Agents', value: '4' },
];

// Component for chat dialog
interface ChatDialogProps {
  agent: (typeof mockAgents)[0];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChatDialog = ({ agent, open, onOpenChange }: ChatDialogProps) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to conversation
    const newMessage = { role: 'user' as const, content: message };
    setConversation(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "I'll help you with that. Could you provide more details?",
        "Based on your request, I'd recommend the following approach...",
        "I've analyzed your question and here's what I found...",
        "That's a great question. Let me walk you through the process.",
        'Let me search for the information you need.',
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setConversation(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback className="text-primary">{agent.icon}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{agent.name}</DialogTitle>
              <DialogDescription className="text-xs truncate max-w-[400px]">
                {agent.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          {conversation.length === 0 ? (
            <div className="flex items-center justify-center h-[50vh] flex-col gap-4 text-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Start a new conversation</h3>
                <p className="text-muted-foreground text-sm max-w-[300px] mt-1">
                  This agent can help with {agent.description.toLowerCase()}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 bg-muted">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                      <div
                        className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Component for agent details panel
interface AgentDetailsPanelProps {
  agent: (typeof mockAgents)[0];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChat: () => void;
}

const AgentDetailsPanel = ({
  agent,
  onClose,
  onEdit,
  onDelete,
  onChat,
}: AgentDetailsPanelProps) => {
  // Map capabilities to readable labels
  const capabilityLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    web_search: { label: 'Web Search', icon: <Search className="h-4 w-4 text-blue-500" /> },
    email_access: { label: 'Email Access', icon: <Mail className="h-4 w-4 text-green-500" /> },
    code_execution: { label: 'Code Execution', icon: <Code className="h-4 w-4 text-red-500" /> },
    calendar_access: {
      label: 'Calendar Access',
      icon: <Calendar className="h-4 w-4 text-amber-500" />,
    },
    file_access: { label: 'File Access', icon: <Folder className="h-4 w-4 text-purple-500" /> },
    database_access: {
      label: 'Database Access',
      icon: <FileCode className="h-4 w-4 text-rose-500" />,
    },
    api_access: { label: 'API Access', icon: <Code className="h-4 w-4 text-sky-500" /> },
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 bg-primary/10">
              <AvatarFallback className="text-primary">{agent.icon}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{agent.name}</h2>
              <p className="text-muted-foreground">{agent.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`
                  ${
                    agent.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : ''
                  }
                  ${agent.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                  ${agent.status === 'draft' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
                  ${agent.status === 'training' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                  ${agent.status === 'archived' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                `}
                >
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">Created by {agent.creator}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={onChat}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Agent Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Usage Count</div>
                  <div className="text-2xl font-bold mt-1">{agent.usageCount.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                    <span className="text-2xl font-bold">{agent.rating}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">AI Model</h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{agent.model}</div>
                    <div className="text-sm text-muted-foreground">{agent.provider}</div>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Capabilities</h3>
            <div className="space-y-2">
              {agent.capabilities.map(cap => (
                <div key={cap} className="flex items-center p-2 border rounded-md">
                  <div className="bg-primary/10 p-1 rounded-full mr-2">
                    {capabilityLabels[cap]?.icon || <Sparkles className="h-4 w-4 text-primary" />}
                  </div>
                  <span>{capabilityLabels[cap]?.label || cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{agent.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Last Modified</span>
                <span className="font-medium">{formatDate(agent.lastModified)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">ID</span>
                <span className="font-medium">{agent.id}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export function AgentsMy() {
  const router = useRouter();
  const { changeSection, sectionParams } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filteredAgents, setFilteredAgents] = useState(mockAgents);
  const [selectedAgent, setSelectedAgent] = useState<(typeof mockAgents)[0] | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<(typeof mockAgents)[0] | null>(null);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [chatAgent, setChatAgent] = useState<(typeof mockAgents)[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Check if we should automatically open the dialog based on params
  useEffect(() => {
    if (sectionParams?.action === 'create') {
      handleCreateAgent();
    }
  }, [sectionParams]);

  // Filter agents based on search query and active tab
  useEffect(() => {
    let filtered = mockAgents;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        agent =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(agent => {
        if (activeTab === 'shared') {
          return agent.creator !== 'You';
        } else {
          return agent.type === activeTab;
        }
      });
    }

    setFilteredAgents(filtered);
  }, [searchQuery, activeTab]);

  // Handle agent creation
  const handleCreateAgent = () => {
    changeSection('agent-create');
  };

  // Handle agent editing
  const handleEditAgent = (agent: (typeof mockAgents)[0]) => {
    // Navigate to edit page with agent id
    changeSection('agent-edit', { agentId: agent.id });
  };

  // Handle agent deletion
  const handleDeleteAgent = (agent: (typeof mockAgents)[0]) => {
    setAgentToDelete(agent);
    setIsDeleteDialogOpen(true);
  };

  // Confirm agent deletion
  const confirmDeleteAgent = () => {
    if (agentToDelete) {
      // In a real app, this would call an API
      setFilteredAgents(filteredAgents.filter(a => a.id !== agentToDelete.id));

      toast({
        title: 'Agent deleted',
        description: `${agentToDelete.name} has been deleted.`,
      });

      setIsDeleteDialogOpen(false);
      setAgentToDelete(null);

      // Close details panel if the deleted agent was selected
      if (selectedAgent?.id === agentToDelete.id) {
        setSelectedAgent(null);
        setShowDetails(false);
      }
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Get status badge
  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>;
      case 'paused':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Paused</Badge>;
      case 'draft':
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200">Draft</Badge>;
      case 'training':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Training</Badge>;
      case 'archived':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get agent type badge
  const getTypeBadge = (type: AgentType) => {
    const baseClasses = 'text-xs font-medium px-2.5 py-0.5 rounded-full';

    switch (type) {
      case 'support':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Support</span>;
      case 'email':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Email</span>;
      case 'sales':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Sales</span>;
      case 'scheduling':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Scheduling</span>;
      case 'content':
        return <span className={`${baseClasses} bg-pink-100 text-pink-800`}>Content</span>;
      case 'research':
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Research</span>;
      case 'assistant':
        return <span className={`${baseClasses} bg-teal-100 text-teal-800`}>Assistant</span>;
      case 'coding':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Coding</span>;
      case 'custom':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Custom</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{type}</span>;
    }
  };

  // Handle opening chat dialog with an agent
  const handleOpenChat = (agent: (typeof mockAgents)[0]) => {
    setChatAgent(agent);
    setIsChatDialogOpen(true);
  };

  // Handle agent selection for details panel
  const handleSelectAgent = (agent: (typeof mockAgents)[0]) => {
    setSelectedAgent(agent);
    setShowDetails(true);
  };

  return (
    <div className="flex h-full">
      <div className={`flex-1 space-y-6 ${showDetails ? 'pr-4' : ''}`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Agents</h1>
          <Button onClick={handleCreateAgent}>
            <Plus className="mr-2 h-4 w-4" /> Create Agent
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {agentStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                <div className="text-3xl font-bold mt-2">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent List */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>My Agents</CardTitle>
            <CardDescription>View and manage your personal AI agents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <Tabs defaultValue="all" className="w-[400px]" onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="support">Support</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="coding">Coding</TabsTrigger>
                  <TabsTrigger value="shared">Shared</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search agents..."
                  className="w-[250px] pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.length > 0 ? (
                  filteredAgents.map(agent => (
                    <TableRow
                      key={agent.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSelectAgent(agent)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2 bg-primary/10">
                            <AvatarFallback className="text-primary">{agent.icon}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{agent.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {agent.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(agent.type)}</TableCell>
                      <TableCell>{getStatusBadge(agent.status)}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded-full mr-1">
                                  <Brain className="h-3 w-3 text-primary" />
                                </div>
                                <span className="truncate max-w-[80px]">{agent.model}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {agent.model} ({agent.provider})
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{agent.usageCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                          <span>{agent.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(agent.lastModified)}</TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenChat(agent)}
                            disabled={agent.status !== 'active'}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditAgent(agent)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenChat(agent)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Run
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart className="h-4 w-4 mr-2" />
                                Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteAgent(agent)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No agents found.{' '}
                      {searchQuery ? 'Try a different search term.' : 'Create your first agent.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Agent Details Panel */}
      {showDetails && selectedAgent && (
        <div className="w-[400px] border-l bg-card h-full overflow-hidden">
          <AgentDetailsPanel
            agent={selectedAgent}
            onClose={() => setShowDetails(false)}
            onEdit={() => handleEditAgent(selectedAgent)}
            onDelete={() => handleDeleteAgent(selectedAgent)}
            onChat={() => handleOpenChat(selectedAgent)}
          />
        </div>
      )}

      {/* Chat Dialog */}
      {chatAgent && (
        <ChatDialog agent={chatAgent} open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Agent
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {agentToDelete && (
            <div className="p-4 border rounded-md bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="text-primary">{agentToDelete.icon}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{agentToDelete.name}</h4>
                  <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                    {agentToDelete.description}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAgent}>
              Delete Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
