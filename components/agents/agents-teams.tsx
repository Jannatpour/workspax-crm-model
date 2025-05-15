'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/dashboard-context';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Bot,
  UserPlus,
  Settings,
  Trash2,
  Edit,
  MessageSquare,
  Mail,
  Calendar,
  Code,
  Star,
  UserCircle,
  UsersRound,
  ChevronRight,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

// Team type definition
type TeamStatus = 'active' | 'inactive';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  agentId: string;
  type: string;
  status: 'active' | 'paused' | 'draft';
  icon: React.ReactNode;
}

interface Team {
  id: string;
  name: string;
  description: string;
  status: TeamStatus;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  workspaceId: string;
  members: TeamMember[];
}

// Mock data for teams
const mockTeams: Team[] = [
  {
    id: 'team1',
    name: 'Customer Success Team',
    description: 'Agents dedicated to customer support and success',
    status: 'active',
    createdAt: '2025-04-15T10:30:00Z',
    updatedAt: '2025-05-12T14:30:00Z',
    ownerId: 'user1',
    workspaceId: 'workspace1',
    members: [
      {
        id: 'member1',
        name: 'Support Assistant',
        role: 'lead',
        agentId: 'agent1',
        type: 'support',
        status: 'active',
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        id: 'member2',
        name: 'Email Helper',
        role: 'member',
        agentId: 'agent3',
        type: 'email',
        status: 'active',
        icon: <Mail className="h-4 w-4" />,
      },
      {
        id: 'member3',
        name: 'Meeting Scheduler',
        role: 'member',
        agentId: 'agent2',
        type: 'scheduling',
        status: 'active',
        icon: <Calendar className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'team2',
    name: 'Sales Acceleration',
    description: 'Agents focused on sales processes and lead qualification',
    status: 'active',
    createdAt: '2025-05-01T09:15:00Z',
    updatedAt: '2025-05-10T11:30:00Z',
    ownerId: 'user1',
    workspaceId: 'workspace1',
    members: [
      {
        id: 'member4',
        name: 'Lead Qualifier',
        role: 'lead',
        agentId: 'agent4',
        type: 'sales',
        status: 'active',
        icon: <Star className="h-4 w-4" />,
      },
      {
        id: 'member5',
        name: 'Email Outreach',
        role: 'member',
        agentId: 'agent3',
        type: 'email',
        status: 'paused',
        icon: <Mail className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'team3',
    name: 'Developer Productivity',
    description: 'Code assistance and documentation agents',
    status: 'inactive',
    createdAt: '2025-04-20T14:45:00Z',
    updatedAt: '2025-05-05T09:10:00Z',
    ownerId: 'user1',
    workspaceId: 'workspace1',
    members: [
      {
        id: 'member6',
        name: 'Code Assistant',
        role: 'lead',
        agentId: 'agent5',
        type: 'coding',
        status: 'active',
        icon: <Code className="h-4 w-4" />,
      },
    ],
  },
];

// Mock available agents for adding to teams
const availableAgents = [
  {
    id: 'agent1',
    name: 'Customer Support Assistant',
    description: 'Handles basic customer support queries',
    type: 'support',
    status: 'active',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: 'agent2',
    name: 'Meeting Scheduler',
    description: 'Books meetings based on calendar availability',
    type: 'scheduling',
    status: 'active',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: 'agent3',
    name: 'Email Campaign Helper',
    description: 'Drafts and schedules email campaigns',
    type: 'email',
    status: 'active',
    icon: <Mail className="h-4 w-4" />,
  },
  {
    id: 'agent4',
    name: 'Product Recommendation Bot',
    description: 'Recommends products based on preferences',
    type: 'sales',
    status: 'active',
    icon: <Star className="h-4 w-4" />,
  },
  {
    id: 'agent5',
    name: 'Code Assistant',
    description: 'Helps with coding tasks and reviews',
    type: 'coding',
    status: 'active',
    icon: <Code className="h-4 w-4" />,
  },
];

// Team creation dialog component
interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTeam: (name: string, description: string) => void;
}

const CreateTeamDialog = ({ open, onOpenChange, onCreateTeam }: CreateTeamDialogProps) => {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!teamName.trim()) {
      toast({
        title: 'Team name required',
        description: 'Please provide a name for your team.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onCreateTeam(teamName, teamDescription);
      setTeamName('');
      setTeamDescription('');
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a new team of agents that work together on related tasks
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Name</label>
            <Input
              placeholder="Enter team name"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Enter team description"
              value={teamDescription}
              onChange={e => setTeamDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add agent to team dialog component
interface AddAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAgent: (teamId: string, agentId: string) => void;
  teamId: string;
  teamName: string;
  existingAgentIds: string[];
}

const AddAgentDialog = ({
  open,
  onOpenChange,
  onAddAgent,
  teamId,
  teamName,
  existingAgentIds,
}: AddAgentDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAgents, setFilteredAgents] = useState(availableAgents);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Filter agents based on search and exclude existing team members
  useEffect(() => {
    const filtered = availableAgents.filter(agent => {
      const matchesSearch =
        !searchQuery ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());

      const notInTeam = !existingAgentIds.includes(agent.id);

      return matchesSearch && notInTeam;
    });

    setFilteredAgents(filtered);
  }, [searchQuery, existingAgentIds]);

  const handleAddAgent = () => {
    if (!selectedAgentId) {
      toast({
        title: 'No agent selected',
        description: 'Please select an agent to add to the team.',
        variant: 'destructive',
      });
      return;
    }

    onAddAgent(teamId, selectedAgentId);
    setSelectedAgentId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Agent to {teamName}</DialogTitle>
          <DialogDescription>Select an agent to add to this team</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search agents..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredAgents.length > 0 ? (
                filteredAgents.map(agent => (
                  <div
                    key={agent.id}
                    className={`flex items-center p-3 border rounded-md cursor-pointer ${
                      selectedAgentId === agent.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <Avatar className="h-10 w-10 mr-3 bg-primary/10">
                      <AvatarFallback className="text-primary">{agent.icon}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">{agent.description}</div>
                    </div>
                    {selectedAgentId === agent.id && (
                      <Check className="ml-auto h-5 w-5 text-primary" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="bg-muted/30 rounded-full p-3 inline-flex mb-4">
                    <Bot className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No agents found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery
                      ? 'Try a different search term or create a new agent'
                      : 'All available agents are already in this team'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddAgent} disabled={!selectedAgentId}>
            Add to Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Team details panel component
interface TeamDetailsPanelProps {
  team: Team;
  onClose: () => void;
  onAddAgent: () => void;
  onDeleteTeam: () => void;
  onRemoveAgent: (memberId: string) => void;
}

const TeamDetailsPanel = ({
  team,
  onClose,
  onAddAgent,
  onDeleteTeam,
  onRemoveAgent,
}: TeamDetailsPanelProps) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status badge for team member
  const getMemberStatusBadge = (status: 'active' | 'paused' | 'draft') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>;
      case 'paused':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Paused</Badge>;
      case 'draft':
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 bg-primary/10">
              <AvatarFallback className="text-primary">
                <UsersRound className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{team.name}</h2>
              <p className="text-muted-foreground">{team.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`
                  ${
                    team.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : ''
                  }
                  ${team.status === 'inactive' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
                `}
                >
                  {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {team.members.length} agent{team.members.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={onAddAgent}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={onDeleteTeam}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Team Members</h3>
            <div className="space-y-3">
              {team.members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-primary/10">
                      <AvatarFallback className="text-primary">{member.icon}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {member.type} • {member.role === 'lead' ? 'Team Lead' : 'Member'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getMemberStatusBadge(member.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onRemoveAgent(member.id)}
                        >
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full flex items-center justify-center py-6"
                onClick={onAddAgent}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Agent to Team
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Team Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(team.createdAt)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{formatDate(team.updatedAt)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">ID</span>
                <span className="font-medium">{team.id}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export function AgentsTeams() {
  const { changeSection } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState(mockTeams);
  const [filteredTeams, setFilteredTeams] = useState(mockTeams);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddAgentDialogOpen, setIsAddAgentDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  // Filter teams based on search query
  useEffect(() => {
    if (searchQuery) {
      setFilteredTeams(
        teams.filter(
          team =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredTeams(teams);
    }
  }, [teams, searchQuery]);

  // Handle team creation
  const handleCreateTeam = (name: string, description: string) => {
    const newTeam: Team = {
      id: `team${teams.length + 1}`,
      name,
      description,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: 'user1',
      workspaceId: 'workspace1',
      members: [],
    };

    setTeams([...teams, newTeam]);

    toast({
      title: 'Team created',
      description: `${name} has been created successfully.`,
    });
  };

  // Handle adding agent to team
  const handleAddAgent = (teamId: string, agentId: string) => {
    const updatedTeams = teams.map(team => {
      if (team.id === teamId) {
        const agent = availableAgents.find(a => a.id === agentId);

        if (agent) {
          const newMember: TeamMember = {
            id: `member${team.members.length + 1}`,
            name: agent.name,
            role: 'member',
            agentId: agent.id,
            type: agent.type,
            status: agent.status,
            icon: agent.icon,
          };

          return {
            ...team,
            members: [...team.members, newMember],
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return team;
    });

    setTeams(updatedTeams);

    if (selectedTeam) {
      const updatedTeam = updatedTeams.find(t => t.id === selectedTeam.id);
      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
      }
    }

    toast({
      title: 'Agent added',
      description: 'Agent has been added to the team.',
    });
  };

  // Handle removing agent from team
  const handleRemoveAgent = (memberId: string) => {
    if (!selectedTeam) return;

    const updatedTeams = teams.map(team => {
      if (team.id === selectedTeam.id) {
        return {
          ...team,
          members: team.members.filter(m => m.id !== memberId),
          updatedAt: new Date().toISOString(),
        };
      }
      return team;
    });

    setTeams(updatedTeams);

    const updatedTeam = updatedTeams.find(t => t.id === selectedTeam.id);
    if (updatedTeam) {
      setSelectedTeam(updatedTeam);
    }

    toast({
      title: 'Agent removed',
      description: 'Agent has been removed from the team.',
    });
  };

  // Handle team deletion
  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  // Confirm team deletion
  const confirmDeleteTeam = () => {
    if (teamToDelete) {
      setTeams(teams.filter(team => team.id !== teamToDelete.id));

      toast({
        title: 'Team deleted',
        description: `${teamToDelete.name} has been deleted.`,
      });

      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);

      // Close details panel if the deleted team was selected
      if (selectedTeam?.id === teamToDelete.id) {
        setSelectedTeam(null);
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

  // Get status badge for team
  const getStatusBadge = (status: TeamStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex h-full">
      <div className={`flex-1 space-y-6 ${showDetails ? 'pr-4' : ''}`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agent Teams</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </div>

        {/* Teams List */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Manage your AI agent teams for collaborative tasks</CardDescription>
            <div className="mt-4 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search teams..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Agents</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.length > 0 ? (
                  filteredTeams.map(team => (
                    <TableRow
                      key={team.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowDetails(true);
                      }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2 bg-primary/10">
                            <AvatarFallback className="text-primary">
                              <UsersRound className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{team.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                              {team.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(team.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span>{team.members.length}</span>
                          {team.members.length > 0 && (
                            <div className="ml-2 flex -space-x-2">
                              {team.members.slice(0, 3).map(member => (
                                <Avatar
                                  key={member.id}
                                  className="h-6 w-6 border-2 border-background"
                                >
                                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                    {member.icon}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {team.members.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                  +{team.members.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(team.updatedAt)}</TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTeam(team);
                              setIsAddAgentDialogOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedTeam(team);
                                  setShowDetails(true);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedTeam(team);
                                  setIsAddAgentDialogOpen(true);
                                }}
                              >
                                Add Agent
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit Team</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteTeam(team);
                                }}
                              >
                                Delete Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No teams found.{' '}
                      {searchQuery ? 'Try a different search term.' : 'Create your first team.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Team Details Panel */}
      {showDetails && selectedTeam && (
        <div className="w-[400px] border-l bg-card h-full overflow-hidden">
          <TeamDetailsPanel
            team={selectedTeam}
            onClose={() => setShowDetails(false)}
            onAddAgent={() => setIsAddAgentDialogOpen(true)}
            onDeleteTeam={() => handleDeleteTeam(selectedTeam)}
            onRemoveAgent={handleRemoveAgent}
          />
        </div>
      )}

      {/* Create Team Dialog */}
      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateTeam={handleCreateTeam}
      />

      {/* Add Agent to Team Dialog */}
      {selectedTeam && (
        <AddAgentDialog
          open={isAddAgentDialogOpen}
          onOpenChange={setIsAddAgentDialogOpen}
          onAddAgent={handleAddAgent}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          existingAgentIds={selectedTeam.members.map(m => m.agentId)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Team
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {teamToDelete && (
            <div className="p-4 border rounded-md bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="text-primary">
                    <UsersRound className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{teamToDelete.name}</h4>
                  <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                    {teamToDelete.members.length} agent
                    {teamToDelete.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTeam}>
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
