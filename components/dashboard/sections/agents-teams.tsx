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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bot,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  PenSquare,
  Trash2,
  Mail,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronRight,
  ArrowRightLeft,
  ListChecks,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock agent teams data
const mockTeams = [
  {
    id: '1',
    name: 'Sales Team',
    description: 'Agents that handle sales process automation',
    agents: [
      { id: '1', name: 'Sales Assistant', type: 'email', status: 'active' },
      { id: '4', name: 'Lead Qualifier', type: 'email', status: 'active' },
    ],
    workflows: 3,
    created: new Date('2023-02-15'),
  },
  {
    id: '2',
    name: 'Support Team',
    description: 'Agents that provide customer support',
    agents: [{ id: '3', name: 'Support Helper', type: 'chat', status: 'paused' }],
    workflows: 2,
    created: new Date('2023-03-10'),
  },
  {
    id: '3',
    name: 'Calendar Team',
    description: 'Agents that manage scheduling and meetings',
    agents: [{ id: '2', name: 'Meeting Scheduler', type: 'calendar', status: 'active' }],
    workflows: 1,
    created: new Date('2023-01-20'),
  },
];

// Team Card component
const TeamCard = ({ team, onEdit, onDelete, onViewDetails }) => {
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
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {team.name}
              <Badge variant="outline">
                {team.agents.length} {team.agents.length === 1 ? 'Agent' : 'Agents'}
              </Badge>
            </CardTitle>
            <CardDescription>{team.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Team Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(team.id)}>
                <Users className="h-4 w-4 mr-2" />
                View Team
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(team.id)}>
                <PenSquare className="h-4 w-4 mr-2" />
                Edit Team
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(team.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Agents</h4>
          </div>

          <div className="space-y-2">
            {team.agents.map(agent => (
              <div
                key={agent.id}
                className="flex items-center justify-between border rounded-md p-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      agent.type === 'email'
                        ? 'bg-blue-100 text-blue-700'
                        : agent.type === 'calendar'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {getTypeIcon(agent.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{agent.type} Agent</p>
                  </div>
                </div>
                <Badge
                  className={
                    agent.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                  }
                >
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ListChecks className="h-3.5 w-3.5" />
          {team.workflows} {team.workflows === 1 ? 'Workflow' : 'Workflows'}
        </div>
        <div className="text-xs text-muted-foreground">Created {formatDate(team.created)}</div>
      </CardFooter>
    </Card>
  );
};

// Team Detail View component
const TeamDetail = ({ teamId, onBack }) => {
  const team = mockTeams.find(t => t.id === teamId);

  if (!team) {
    return (
      <div className="p-6 text-center">
        <p>Team not found</p>
        <Button variant="link" onClick={onBack}>
          Back to Teams
        </Button>
      </div>
    );
  }

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

  // Mocked workflows data
  const workflows = [
    {
      id: '1',
      name: 'Lead Qualification',
      description: 'Qualifies leads and schedules follow-up',
      status: 'active',
      lastRun: new Date('2023-05-09T14:30:00'),
    },
    {
      id: '2',
      name: 'Email Follow-up',
      description: 'Sends follow-up emails based on lead activity',
      status: 'active',
      lastRun: new Date('2023-05-10T09:15:00'),
    },
    {
      id: '3',
      name: 'Meeting Coordination',
      description: 'Coordinates meeting times between team and clients',
      status: 'paused',
      lastRun: new Date('2023-05-01T11:45:00'),
    },
  ].slice(0, team.workflows);

  // Mocked team members data
  const teamMembers = [
    { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'Team Lead' },
    { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'AI Specialist' },
    { id: '3', name: 'Michael Brown', email: 'michael@example.com', role: 'Sales Manager' },
  ];

  const formatDate = date => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          <h1 className="text-2xl font-bold">{team.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <PenSquare className="h-4 w-4 mr-2" />
            Edit Team
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>{team.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agents</p>
                <p className="text-xl font-bold">{team.agents.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Workflows</p>
                <p className="text-xl font-bold">{team.workflows}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-xl font-bold">{formatDate(team.created)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Team Members</h3>
              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Settings
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle>Team Agents</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.agents.map(agent => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="font-medium">{agent.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(agent.type)}
                        <span className="capitalize">{agent.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          agent.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                        }
                      >
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Remove from Team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle>Team Workflows</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
          <CardDescription>Automated workflows created for this team</CardDescription>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No workflows created yet</div>
          ) : (
            <div className="space-y-4">
              {workflows.map(workflow => (
                <Card key={workflow.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {workflow.name}
                          {workflow.status === 'active' ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                              Paused
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last run: {formatDate(workflow.lastRun)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Team Creation Form component
const TeamCreationForm = ({ onCancel, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);

  // Mock available agents data
  const availableAgents = [
    { id: '1', name: 'Sales Assistant', type: 'email', status: 'active' },
    { id: '2', name: 'Meeting Scheduler', type: 'calendar', status: 'active' },
    { id: '3', name: 'Support Helper', type: 'chat', status: 'paused' },
    { id: '4', name: 'Lead Qualifier', type: 'email', status: 'active' },
  ];

  const handleSubmit = e => {
    e.preventDefault();
    onCreate({
      name,
      description,
      agents: availableAgents.filter(agent => selectedAgents.includes(agent.id)),
      workflows: 0,
      created: new Date(),
    });
  };

  const toggleAgentSelection = agentId => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create AI Agent Team</CardTitle>
        <CardDescription>Group your AI agents together for better collaboration</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="team-name" className="text-sm font-medium">
              Team Name
            </label>
            <Input
              id="team-name"
              placeholder="E.g. Sales Team, Support Team"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="team-description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="team-description"
              placeholder="What is this team for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Agents</label>
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-2">
                {availableAgents.map(agent => (
                  <div
                    key={agent.id}
                    className={`flex items-center justify-between border rounded-md p-2 cursor-pointer ${
                      selectedAgents.includes(agent.id) ? 'bg-primary/10 border-primary' : ''
                    }`}
                    onClick={() => toggleAgentSelection(agent.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          agent.type === 'email'
                            ? 'bg-blue-100 text-blue-700'
                            : agent.type === 'calendar'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {agent.type === 'email' ? (
                          <Mail className="h-4 w-4" />
                        ) : agent.type === 'calendar' ? (
                          <CalendarDays className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {agent.type} Agent
                        </p>
                      </div>
                    </div>
                    {selectedAgents.includes(agent.id) && <Badge>Selected</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={selectedAgents.length === 0}>
          Create Team
        </Button>
      </CardFooter>
    </Card>
  );
};

export function AgentsTeamsSection() {
  const { changeSection } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [viewingTeamId, setViewingTeamId] = useState(null);
  const [teams, setTeams] = useState(mockTeams);

  // Handler for editing a team
  const handleEditTeam = teamId => {
    // In a real app, this would navigate to the team edit view
    console.log(`Edit team ${teamId}`);
  };

  // Handler for deleting a team
  const handleDeleteTeam = teamId => {
    setTeams(teams.filter(team => team.id !== teamId));
  };

  // Handler for creating a new team
  const handleCreateTeam = newTeam => {
    setTeams([
      ...teams,
      {
        ...newTeam,
        id: Date.now().toString(),
      },
    ]);
    setShowCreationForm(false);
  };

  // Filter teams based on search term
  const filteredTeams = (teams.filter = teams.filter(team => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    return (
      team.name.toLowerCase().includes(searchLower) ||
      team.description.toLowerCase().includes(searchLower) ||
      team.agents.some(agent => agent.name.toLowerCase().includes(searchLower))
    );
  }));

  return (
    <div className="space-y-4">
      {viewingTeamId ? (
        <TeamDetail teamId={viewingTeamId} onBack={() => setViewingTeamId(null)} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Agent Teams</h1>
            <Button onClick={() => setShowCreationForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          {showCreationForm ? (
            <TeamCreationForm
              onCancel={() => setShowCreationForm(false)}
              onCreate={handleCreateTeam}
            />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search teams..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeams.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-muted-foreground">
                    No teams found matching your criteria
                  </div>
                ) : (
                  filteredTeams.map(team => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      onEdit={handleEditTeam}
                      onDelete={handleDeleteTeam}
                      onViewDetails={setViewingTeamId}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
