'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Settings, ArrowRight, Check, X, HelpCircle, Sparkle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAgent, AgentConfiguration } from '@/context/agent-context';
import { toast } from 'sonner';

interface ModuleAgentAssignment {
  moduleType: string;
  agentId?: string;
  isEnabled: boolean;
  settings: Record<string, any>;
}

interface ModuleAgentSelectorProps {
  moduleType: string;
  onAssignmentChange?: (assignment: ModuleAgentAssignment) => void;
  className?: string;
}

export function ModuleAgentSelector({
  moduleType,
  onAssignmentChange,
  className = '',
}: ModuleAgentSelectorProps) {
  const { agents, currentAgent, getModuleConfig, updateModuleConfig, isLoading } = useAgent();

  const [moduleConfig, setModuleConfig] = useState<ModuleAgentAssignment | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load the module configuration
  useEffect(() => {
    const config = getModuleConfig(moduleType);
    if (config) {
      setModuleConfig(config);
      setSelectedAgentId(config.agentId);
      setIsEnabled(config.isEnabled);
    } else if (currentAgent) {
      // If no config exists but we have a current agent, use that as default
      setSelectedAgentId(currentAgent.id);
    }
  }, [moduleType, getModuleConfig, currentAgent]);

  // Handle agent selection change
  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);

    // If we have a change handler, call it
    if (onAssignmentChange) {
      onAssignmentChange({
        moduleType,
        agentId,
        isEnabled,
        settings: moduleConfig?.settings || {},
      });
    }
  };

  // Handle enabled state change
  const handleEnabledChange = (enabled: boolean) => {
    setIsEnabled(enabled);

    // If we have a change handler, call it
    if (onAssignmentChange) {
      onAssignmentChange({
        moduleType,
        agentId: selectedAgentId,
        isEnabled: enabled,
        settings: moduleConfig?.settings || {},
      });
    }
  };

  // Save the module configuration
  const saveModuleConfig = async () => {
    if (!selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }

    try {
      setIsSaving(true);

      const updatedConfig = await updateModuleConfig(moduleType, {
        agentId: selectedAgentId,
        isEnabled,
        settings: moduleConfig?.settings || {},
      });

      setModuleConfig(updatedConfig);
      toast.success('Module configuration saved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save module configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Get the selected agent
  const selectedAgent = selectedAgentId ? agents.find(a => a.id === selectedAgentId) : null;

  // Get a formatted module type display name
  const getModuleDisplayName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  // Determine the module display name
  const moduleDisplayName = getModuleDisplayName(moduleType);

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base flex items-center gap-1">
              <Bot className="h-4 w-4 text-primary" />
              {moduleDisplayName} Assistant
            </CardTitle>
            <CardDescription>Assign an AI agent to help with {moduleType} tasks</CardDescription>
          </div>

          <Switch checked={isEnabled} onCheckedChange={handleEnabledChange} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="agent-select" className="text-sm font-medium">
                Select Agent
              </label>

              {selectedAgent && (
                <Badge variant="outline" className="font-normal">
                  {selectedAgent.modelType}
                </Badge>
              )}
            </div>

            <Select
              value={selectedAgentId}
              onValueChange={handleAgentChange}
              disabled={!isEnabled || isLoading}
            >
              <SelectTrigger id="agent-select" className="w-full">
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center">
                      <span>{agent.name}</span>
                      {!agent.isActive && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAgent && (
            <div className="border rounded-md p-3 bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium">{selectedAgent.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedAgent.description || 'No description available'}
                  </p>
                </div>

                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Settings className="h-3.5 w-3.5 mr-1" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{moduleDisplayName} Agent Settings</DialogTitle>
                      <DialogDescription>
                        Configure how this agent works with {moduleType} tasks
                      </DialogDescription>
                    </DialogHeader>

                    {/* Module-specific settings would go here */}
                    <div className="py-4">
                      <div className="space-y-4">
                        {moduleType === 'email' && (
                          <>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">Auto-analyze emails</h4>
                                <p className="text-xs text-muted-foreground">
                                  Automatically analyze emails when selected
                                </p>
                              </div>
                              <Switch
                                checked={moduleConfig?.settings?.autoAnalyze || false}
                                onCheckedChange={checked => {
                                  setModuleConfig(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        autoAnalyze: checked,
                                      },
                                    };
                                  });
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">Auto-suggest responses</h4>
                                <p className="text-xs text-muted-foreground">
                                  Generate response suggestions automatically
                                </p>
                              </div>
                              <Switch
                                checked={moduleConfig?.settings?.autoSuggest || false}
                                onCheckedChange={checked => {
                                  setModuleConfig(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        autoSuggest: checked,
                                      },
                                    };
                                  });
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">Generate tasks</h4>
                                <p className="text-xs text-muted-foreground">
                                  Extract and create tasks from emails
                                </p>
                              </div>
                              <Switch
                                checked={moduleConfig?.settings?.generateTasks || false}
                                onCheckedChange={checked => {
                                  setModuleConfig(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        generateTasks: checked,
                                      },
                                    };
                                  });
                                }}
                              />
                            </div>
                          </>
                        )}

                        {moduleType === 'leads' && (
                          <>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">Auto-score leads</h4>
                                <p className="text-xs text-muted-foreground">
                                  Automatically score new leads
                                </p>
                              </div>
                              <Switch
                                checked={moduleConfig?.settings?.autoScore || false}
                                onCheckedChange={checked => {
                                  setModuleConfig(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        autoScore: checked,
                                      },
                                    };
                                  });
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">Enrich contact data</h4>
                                <p className="text-xs text-muted-foreground">
                                  Automatically enhance lead information
                                </p>
                              </div>
                              <Switch
                                checked={moduleConfig?.settings?.enrichContacts || false}
                                onCheckedChange={checked => {
                                  setModuleConfig(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        enrichContacts: checked,
                                      },
                                    };
                                  });
                                }}
                              />
                            </div>
                          </>
                        )}

                        {moduleType === 'templates' && (
                          <>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">AI template generation</h4>
                                <p className="text-xs text-muted-foreground">
                                  Generate email templates with AI
                                </p>
                              </div>
                              <Switch
                                checked={moduleConfig?.settings?.templateGeneration || false}
                                onCheckedChange={checked => {
                                  setModuleConfig(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        templateGeneration: checked,
                                      },
                                    };
                                  });
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">Template suggestions</h4>
                                <p className="text-xs text-muted-foreground">
                                  Suggest templates based on context
                                </p>
                              </div>
                              <Switch
                                checked={moduleConfig?.settings?.templateSuggestions || false}
                                onCheckedChange={checked => {
                                  setModuleConfig(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      settings: {
                                        ...prev.settings,
                                        templateSuggestions: checked,
                                      },
                                    };
                                  });
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={() => setIsSettingsOpen(false)}>Save Settings</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator className="my-3" />

              <div className="flex flex-wrap gap-1">
                {selectedAgent.capabilities
                  .filter(cap => cap.isEnabled)
                  .map((capability, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {capability.name}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Sparkle className="h-3.5 w-3.5 mr-1 text-primary" />
          <span>AI-powered assistance</span>
        </div>

        <Button
          onClick={saveModuleConfig}
          disabled={!selectedAgentId || !isEnabled || isSaving}
          size="sm"
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-1" />
              Apply
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
