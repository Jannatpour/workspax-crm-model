// src/components/module-agent-selector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AgentIntegrationService, ModuleType } from '@/lib/services/agent-integration-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Users,
  Info,
  Settings,
  MoreHorizontal,
  Bot as BotIcon,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/sonner';

interface ModuleAgentSelectorProps {
  moduleType: ModuleType;
  moduleId?: string;
  onAgentSelect?: (agentId: string | null, teamId: string | null) => void;
  onExecuteTask?: (taskType: string) => void;
  workspaceId: string;
  compact?: boolean;
}

export function ModuleAgentSelector({
  moduleType,
  moduleId,
  onAgentSelect,
  onExecuteTask,
  workspaceId,
  compact = false,
}: ModuleAgentSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  // Fetch assigned agents and teams for this module
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);

        // In a real implementation, this would call your API
        const assignedAgents = await AgentIntegrationService.getAgentsForModule(
          moduleType,
          moduleId
        );

        // Convert to a format for our dropdown
        const options = assignedAgents
          .map(assignment => {
            if (assignment.agent) {
              return {
                id: `agent-${assignment.agent.id}`,
                name: assignment.agent.name,
                description: assignment.agent.description || 'No description available',
                type: 'agent',
                agentId: assignment.agent.id,
                teamId: null,
                priority: assignment.priority,
              };
            } else if (assignment.team) {
              return {
                id: `team-${assignment.team.id}`,
                name: assignment.team.name,
                description: assignment.team.description || 'No description available',
                type: 'team',
                agentId: null,
                teamId: assignment.team.id,
                priority: assignment.priority,
                members:
                  assignment.team.members?.map(m => ({
                    name: m.agent?.name || 'Unknown Agent',
                    role: m.role,
                    agentId: m.agentId,
                  })) || [],
              };
            }

            return null;
          })
          .filter(Boolean);

        // If no assigned agents, find suitable ones
        if (options.length === 0) {
          const suitableOptions = await AgentIntegrationService.findSuitableAgents(
            moduleType,
            [], // No specific capability requirements
            workspaceId
          );

          suitableOptions.forEach(option => {
            options.push({
              id: `${option.type}-${option.id}`,
              name: option.name || 'Unnamed',
              description: option.description || 'No description available',
              type: option.type,
              agentId: option.type === 'agent' ? option.id : null,
              teamId: option.type === 'team' ? option.id : null,
              priority: option.priority,
            });
          });
        }

        setAgents(options);

        // If there's one available, select it by default
        if (options.length === 1) {
          setSelectedOption(options[0].id);
          if (onAgentSelect) {
            onAgentSelect(options[0].agentId, options[0].teamId);
          }
        }

        // Get available tasks for this module
        const tasks = await AgentIntegrationService.getModuleTasks(moduleType);
        setAvailableTasks(tasks);
      } catch (error) {
        console.error('Error fetching agents for module:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available AI agents',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [moduleType, moduleId, workspaceId, onAgentSelect]);

  // Handle agent selection
  const handleAgentChange = (value: string) => {
    setSelectedOption(value);

    const selected = agents.find(a => a.id === value);
    if (selected && onAgentSelect) {
      onAgentSelect(selected.agentId, selected.teamId);
    }
  };

  // Handle executing a task
  const handleExecuteTask = (taskType: string) => {
    if (onExecuteTask) {
      onExecuteTask(taskType);
    } else {
      toast({
        title: 'Task Execution',
        description: `Executing task: ${taskType}`,
      });
    }
  };

  // Show details for an agent or team
  const showAgentDetails = (option: any) => {
    setSelectedDetails(option);
    setShowDetails(true);
  };

  // Get icon for agent or team
  const getIcon = (type: 'agent' | 'team') => {
    return type === 'agent' ? <BotIcon className="h-4 w-4" /> : <Users className="h-4 w-4" />;
  };

  if (compact) {
    // Compact view for inline use in forms, tables, etc.
    return (
      <div className="flex items-center gap-2">
        <Select value={selectedOption || ''} onValueChange={handleAgentChange} disabled={loading}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select AI assistant..." />
          </SelectTrigger>
          <SelectContent>
            {agents.length > 0 ? (
              agents.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex items-center">
                    {getIcon(option.type)}
                    <span className="ml-2">{option.name}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No agents available
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {selectedOption && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const selected = agents.find(a => a.id === selectedOption);
                    if (selected) {
                      showAgentDetails(selected);
                    }
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View agent details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {availableTasks.length > 0 && selectedOption && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Run Task
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="p-2">
                <p className="text-sm font-medium">Available Tasks</p>
              </div>
              <div className="border-t">
                {availableTasks.map(task => (
                  <Button
                    key={task.id}
                    variant="ghost"
                    className="w-full justify-start rounded-none text-sm"
                    onClick={() => handleExecuteTask(task.name)}
                  >
                    {task.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }

  // Full view with more information
  return (
    <div className="rounded-md border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-sm font-medium">AI Assistant</h3>
        <Badge variant="outline" className="text-xs">
          {moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Module
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading agents...</span>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-4">
            <div className="inline-flex h-10 w-10 rounded-full bg-muted items-center justify-center mb-2">
              <Bot className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No agents available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create or assign an AI agent to help with this {moduleType}
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Select an AI assistant:</label>
              <Select value={selectedOption || ''} onValueChange={handleAgentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent or team..." />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex items-center">
                        {getIcon(option.type)}
                        <span className="ml-2">{option.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOption && (
              <div className="space-y-4">
                {/* Display selected agent/team info */}
                {(() => {
                  const selected = agents.find(a => a.id === selectedOption);
                  if (!selected) return null;

                  return (
                    <div className="flex items-start gap-3 bg-muted/40 p-3 rounded-md">
                      <Avatar className="h-8 w-8 bg-primary/10">
                        <AvatarFallback className="text-primary">
                          {selected.type === 'agent' ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <Users className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{selected.name}</h4>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {selected.type === 'agent' ? 'Agent' : 'Team'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {selected.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => showAgentDetails(selected)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })()}

                {/* Tasks section */}
                {availableTasks.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Available Tasks:</label>
                    <div className="grid gap-2">
                      {availableTasks.slice(0, 3).map(task => (
                        <Button
                          key={task.id}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleExecuteTask(task.name)}
                        >
                          <div className="mr-2 flex-shrink-0">
                            <BrainCircuit className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{task.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </div>
                          </div>
                          <Zap className="ml-2 h-4 w-4 flex-shrink-0" />
                        </Button>
                      ))}

                      {availableTasks.length > 3 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                              View all tasks ({availableTasks.length})
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="end">
                            <div className="p-2">
                              <p className="text-sm font-medium">All Available Tasks</p>
                            </div>
                            <div className="border-t max-h-[300px] overflow-y-auto">
                              {availableTasks.map(task => (
                                <Button
                                  key={task.id}
                                  variant="ghost"
                                  className="w-full justify-start rounded-none text-sm h-auto py-3"
                                  onClick={() => handleExecuteTask(task.name)}
                                >
                                  <div className="flex-1 text-left">
                                    <div className="font-medium">{task.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {task.description}
                                    </div>
                                  </div>
                                  <Zap className="ml-2 h-4 w-4 flex-shrink-0" />
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Agent Details Dialog - Would use a modal component in a real implementation */}
      {showDetails && selectedDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-background flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {selectedDetails.type === 'agent' ? 'Agent Details' : 'Team Details'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                &times;
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="text-primary">
                    {selectedDetails.type === 'agent' ? (
                      <Bot className="h-6 w-6" />
                    ) : (
                      <Users className="h-6 w-6" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold">{selectedDetails.name}</h4>
                  <Badge variant="outline" className="mt-1">
                    {selectedDetails.type === 'agent' ? 'Individual Agent' : 'Agent Team'}
                  </Badge>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-1">Description</h5>
                <p className="text-sm text-muted-foreground">{selectedDetails.description}</p>
              </div>

              {selectedDetails.type === 'team' && selectedDetails.members && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Team Members</h5>
                  <div className="space-y-2">
                    {selectedDetails.members.map((member: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-muted/30 p-2 rounded-md"
                      >
                        <Avatar className="h-6 w-6 bg-primary/10">
                          <AvatarFallback className="text-primary">
                            <Bot className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{member.name}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {member.role === 'lead' ? 'Lead' : 'Member'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
