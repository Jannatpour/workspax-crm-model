'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { useAgent } from '@/context/agent-context';
import { usePromptBuilder } from '@/lib/hooks/use-prompt-builder';

import {
  Plus,
  Trash2,
  Save,
  X,
  GripVertical,
  RefreshCw,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Lightbulb,
  Brain,
  Sparkles,
  Copy,
  HelpCircle,
  BrainCircuit,
  Bot,
  AlertCircle,
  Settings,
  Sliders,
  Check,
  Edit,
  RotateCcw,
} from 'lucide-react';

// Types
export interface AgentCapability {
  id?: string;
  key: string;
  name: string;
  description?: string;
  type?: string;
  isEnabled: boolean;
  config?: Record<string, any>;
  settings?: Record<string, any>;
  agentId?: string;
}

export type AgentModelType =
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'mistral-large'
  | 'mistral-medium'
  | 'gemini-pro'
  | 'llama-3'
  | 'custom';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  avatarUrl?: string;
  prompt: string;
  systemPrompt?: string;
  modelType?: AgentModelType;
  modelConfig: Record<string, any>;
  settings?: Record<string, any>;
  capabilities: AgentCapability[];
  isActive?: boolean;
}

// Form schema
const agentFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  type: z.string(),
  status: z.string(),
  avatarUrl: z.string().optional(),
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters.',
  }),
  systemPrompt: z.string().optional(),
  modelType: z.string().optional(),
  modelConfig: z.record(z.any()),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof agentFormSchema>;

interface AgentConfigurationFormProps {
  agent?: Agent;
  onSave?: (agent: Agent) => void;
  onCancel?: () => void;
  layout?: 'page' | 'modal';
}

export function AgentConfigurationForm({
  agent,
  onSave,
  onCancel,
  layout = 'page',
}: AgentConfigurationFormProps) {
  // Hooks
  const { createAgent, updateAgent, deleteAgent, isLoading } = useAgent();
  const { buildPromptFromCapabilities, getCapabilityPrompt, fetchTemplates } = usePromptBuilder();

  // State
  const [activeTab, setActiveTab] = useState('basic');
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [showCapabilityDialog, setShowCapabilityDialog] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<Partial<AgentCapability> | null>(
    null
  );
  const [promptVariables, setPromptVariables] = useState<Record<string, string>>({});
  const [promptPreview, setPromptPreview] = useState('');
  const [showPromptHelp, setShowPromptHelp] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: agent?.name || '',
      description: agent?.description || '',
      type: agent?.type || 'GENERAL',
      status: agent?.status || 'DRAFT',
      avatarUrl: agent?.avatarUrl || '',
      prompt: agent?.prompt || agent?.systemPrompt || '',
      systemPrompt: agent?.systemPrompt || agent?.prompt || '',
      modelType: agent?.modelType || 'gpt-4o',
      modelConfig: agent?.modelConfig || {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.95,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
      isActive: agent?.isActive !== undefined ? agent.isActive : true,
    },
  });

  // Watch relevant form values
  const prompt = form.watch('prompt');
  const systemPrompt = form.watch('systemPrompt');

  // Update prompt preview when prompt or variables change
  useEffect(() => {
    try {
      // Use either prompt or systemPrompt based on which one is being actively used
      const promptToPreview = prompt || systemPrompt;

      // Simple variable replacement for preview
      let preview = promptToPreview;
      Object.entries(promptVariables).forEach(([key, value]) => {
        preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      setPromptPreview(preview);
    } catch (error) {
      console.error('Error updating prompt preview:', error);
    }
  }, [prompt, systemPrompt, promptVariables]);

  // Load agent data when provided
  useEffect(() => {
    if (agent) {
      setIsEditing(true);
      setCapabilities(agent.capabilities || []);

      // Reset form with agent values
      form.reset({
        name: agent.name,
        description: agent.description || '',
        type: agent.type,
        status: agent.status,
        avatarUrl: agent.avatarUrl || '',
        prompt: agent.prompt || agent.systemPrompt || '',
        systemPrompt: agent.systemPrompt || agent.prompt || '',
        modelType: agent.modelType,
        modelConfig: agent.modelConfig,
        isActive: agent.isActive !== undefined ? agent.isActive : true,
      });
    } else {
      setIsEditing(false);
      setCapabilities([]);
    }
  }, [agent, form]);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Generate prompt from capabilities
  const generatePrompt = () => {
    try {
      // Name is required to generate a prompt
      const agentName = form.getValues('name');
      if (!agentName) {
        toast.error('Please provide an agent name first');
        return;
      }

      // Get enabled capabilities
      const enabledCapabilities = capabilities.filter(cap => cap.isEnabled);
      if (enabledCapabilities.length === 0) {
        toast.error('No capabilities are enabled');
        return;
      }

      // Initialize the prompt
      let newPrompt = `You are ${agentName}, an AI assistant specialized in the following capabilities:\n\n`;

      // Add each capability to the prompt
      enabledCapabilities.forEach(capability => {
        // Try to get a specialized prompt for this capability
        const capabilityPrompt = getCapabilityPrompt(capability.key);

        if (capabilityPrompt) {
          newPrompt += `# ${capability.name}\n${capabilityPrompt}\n\n`;
        } else {
          // Fallback if no specialized prompt is available
          newPrompt += `# ${capability.name}\n`;
          if (capability.description) {
            newPrompt += `${capability.description}\n`;
          }
          newPrompt += '\n';
        }
      });

      // Add a general guideline
      newPrompt +=
        'When responding to requests, use your specialized capabilities appropriately based on the context and provide helpful, accurate information.';

      // Update form values
      form.setValue('prompt', newPrompt);
      form.setValue('systemPrompt', newPrompt);

      toast.success('Prompt generated based on capabilities');
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error('Failed to generate prompt from capabilities');
    }
  };

  // Add or update capability
  const saveCapability = (capability: Partial<AgentCapability>) => {
    if (!capability.name || !capability.key) {
      toast.error('Capability name and key are required');
      return;
    }

    // Check if this is an update to an existing capability
    if (capability.id) {
      setCapabilities(prev =>
        prev.map(c => (c.id === capability.id ? { ...c, ...capability } : c))
      );
    } else {
      // Generate a temporary ID for new capabilities
      const newCapability: AgentCapability = {
        id: `temp-${Date.now()}`,
        key: capability.key,
        name: capability.name,
        description: capability.description || '',
        type: capability.type || 'GENERAL',
        isEnabled: true,
        config: capability.config || {},
        settings: capability.settings || {},
        agentId: agent?.id,
      };

      setCapabilities(prev => [...prev, newCapability]);
    }

    setShowCapabilityDialog(false);
    setSelectedCapability(null);
    toast.success(`Capability ${capability.id ? 'updated' : 'added'}`);
  };

  // Remove capability
  const removeCapability = (id: string) => {
    setCapabilities(prev => prev.filter(c => c.id !== id));
    toast.success('Capability removed');
  };

  // Toggle capability enabled state
  const toggleCapability = (id: string) => {
    setCapabilities(prev => prev.map(c => (c.id === id ? { ...c, isEnabled: !c.isEnabled } : c)));
  };

  // Move capability up in the list
  const moveCapabilityUp = (index: number) => {
    if (index <= 0) return;

    setCapabilities(prev => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  };

  // Move capability down in the list
  const moveCapabilityDown = (index: number) => {
    if (index >= capabilities.length - 1) return;

    setCapabilities(prev => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(capabilities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCapabilities(items);
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Combine form data with capabilities
      const agentData = {
        ...values,
        capabilities: capabilities.map(c => ({
          ...c,
          // Don't include temporary IDs for new capabilities
          id: c.id?.startsWith('temp-') ? undefined : c.id,
        })),
      };

      let savedAgent;

      if (isEditing && agent?.id) {
        // Update existing agent
        savedAgent = await updateAgent(agent.id, agentData);
        toast.success('Agent updated successfully');
      } else {
        // Create new agent
        savedAgent = await createAgent(agentData);
        toast.success('Agent created successfully');
      }

      if (savedAgent && onSave) {
        onSave(savedAgent);
      }
    } catch (error: any) {
      console.error('Error saving agent:', error);
      toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} agent: ${error.message || 'Unknown error'}`
      );
    }
  };

  // Handle agent deletion
  const handleDeleteAgent = async () => {
    if (!agent?.id) return;

    try {
      setIsDeleting(true);
      await deleteAgent(agent.id);
      toast.success('Agent deleted successfully');

      if (onCancel) {
        onCancel();
      }
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      toast.error(`Failed to delete agent: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle agent duplication
  const handleDuplicateAgent = () => {
    try {
      setIsDuplicating(true);

      // Get current values
      const currentValues = form.getValues();

      // Update the name to indicate it's a copy
      form.setValue('name', `${currentValues.name} (Copy)`);

      // Switch to create mode
      setIsEditing(false);

      toast.success('Agent duplicated - save to create a new copy');
    } catch (error) {
      console.error('Error duplicating agent:', error);
      toast.error('Failed to duplicate agent');
    } finally {
      setIsDuplicating(false);
    }
  };

  // Handle form cancellation
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Content for the prompt help dialog
  const promptHelpContent = (
    <div className="space-y-4 text-sm">
      <p>
        The system prompt defines your agent's personality, capabilities, and how it responds to
        requests. A good system prompt should include:
      </p>

      <div className="space-y-2">
        <h3 className="font-semibold">1. Role Definition</h3>
        <p className="text-muted-foreground">Define who the agent is and its purpose clearly.</p>
        <div className="bg-muted p-2 rounded text-xs">
          <code>
            You are a professional email assistant focused on helping users manage their inbox
            efficiently.
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">2. Capabilities</h3>
        <p className="text-muted-foreground">
          List the specific capabilities and how they should be used.
        </p>
        <div className="bg-muted p-2 rounded text-xs">
          <code>
            Your capabilities include:
            <br />
            - Analyzing emails for sentiment, intent, and priority
            <br />
            - Summarizing long email threads concisely
            <br />
            - Drafting appropriate responses based on context
            <br />- Identifying action items and deadlines
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">3. Guidelines & Constraints</h3>
        <p className="text-muted-foreground">
          Provide specific guidelines for how the agent should behave.
        </p>
        <div className="bg-muted p-2 rounded text-xs">
          <code>
            When analyzing emails:
            <br />
            - Focus on identifying the core message and purpose
            <br />
            - Detect the overall sentiment (positive, negative, neutral)
            <br />
            - Identify specific requests or questions
            <br />
            - Extract action items and deadlines
            <br />- Recognize important entities (people, companies, products)
          </code>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">4. Output Format</h3>
        <p className="text-muted-foreground">Specify how responses should be structured.</p>
        <div className="bg-muted p-2 rounded text-xs">
          <code>
            Provide your analysis in a structured format with the following sections:
            <br />
            - Summary: A brief overview of the email content
            <br />
            - Sentiment: The overall tone and attitude
            <br />
            - Key Points: The main information or requests
            <br />
            - Action Items: Things that need to be done
            <br />- Response Suggestions: If applicable
          </code>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="text-muted-foreground">
          Click the "Generate from Capabilities" button to automatically create a prompt based on
          your selected capabilities.
        </p>
      </div>
    </div>
  );

  // Determine if we're using a compact layout
  const isCompact = layout === 'modal';

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Agent' : 'Create New Agent'}
            </h2>

            <div className="flex gap-2">
              {isEditing && agent?.id && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleDuplicateAgent}
                    disabled={isDuplicating}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm" type="button">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Delete Agent</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this agent? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-4 gap-2 sm:justify-start">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleDeleteAgent}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Agent
                            </>
                          )}
                        </Button>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              <TabsTrigger value="model">Model</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Email Assistant" {...field} />
                      </FormControl>
                      <FormDescription>A descriptive name for your agent</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GENERAL">General</SelectItem>
                          <SelectItem value="EMAIL">Email</SelectItem>
                          <SelectItem value="SALES">Sales</SelectItem>
                          <SelectItem value="SUPPORT">Support</SelectItem>
                          <SelectItem value="ANALYTICS">Analytics</SelectItem>
                          <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The primary function of this agent</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this agent does and when to use it..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Explain the agent's purpose and capabilities</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                          <SelectItem value="TESTING">Testing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The current status of this agent</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enabled</FormLabel>
                        <FormDescription>Enable or disable this agent</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.png" {...field} />
                    </FormControl>
                    <FormDescription>Optional image URL for the agent</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-medium">Agent Capabilities</h3>
                  <p className="text-sm text-muted-foreground">Define what this agent can do</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCapability(null);
                    setShowCapabilityDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Capability
                </Button>
              </div>

              <div className="border rounded-md">
                {capabilities.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Brain className="mx-auto h-8 w-8 mb-4 opacity-50" />
                    <p>No capabilities added yet</p>
                    <p className="text-sm mt-1">
                      Add capabilities to define what this agent can do
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setSelectedCapability(null);
                        setShowCapabilityDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Capability
                    </Button>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="capabilities">
                      {provided => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="p-2 space-y-2"
                        >
                          {capabilities.map((capability, index) => (
                            <Draggable
                              key={capability.id || `temp-${index}`}
                              draggableId={capability.id || `temp-${index}`}
                              index={index}
                            >
                              {provided => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border rounded-md bg-muted/20 group"
                                >
                                  <div className="flex items-center p-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="p-1 text-muted-foreground"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>

                                    <Switch
                                      checked={capability.isEnabled}
                                      onCheckedChange={() =>
                                        toggleCapability(capability.id || `temp-${index}`)
                                      }
                                      className="ml-1 mr-3"
                                    />

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm">{capability.name}</h4>
                                        {capability.type && (
                                          <Badge variant="outline" className="text-xs">
                                            {capability.type}
                                          </Badge>
                                        )}
                                      </div>
                                      {capability.description && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {capability.description}
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                              onClick={() => moveCapabilityUp(index)}
                                              disabled={index === 0}
                                            >
                                              <ChevronUp className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Move Up</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                              onClick={() => moveCapabilityDown(index)}
                                              disabled={index === capabilities.length - 1}
                                            >
                                              <ChevronDown className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Move Down</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                              onClick={() => {
                                                setSelectedCapability(capability);
                                                setShowCapabilityDialog(true);
                                              }}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Edit</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                              onClick={() =>
                                                removeCapability(capability.id || `temp-${index}`)
                                              }
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Remove</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>

              {capabilities.length > 0 && (
                <div className="bg-muted/20 rounded-md p-4 flex items-center gap-4">
                  <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Generate Prompt</p>
                    <p className="text-xs text-muted-foreground">
                      Create a prompt based on the selected capabilities
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={generatePrompt}
                    disabled={capabilities.filter(c => c.isEnabled).length === 0}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="prompt" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <h3 className="text-base font-medium">System Prompt</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setShowPromptHelp(true)}
                        >
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>System Prompt Help</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Dialog open={showPromptHelp} onOpenChange={setShowPromptHelp}>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>System Prompt Guide</DialogTitle>
                      <DialogDescription>
                        How to write effective system prompts for your agents
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[50vh] pr-4">{promptHelpContent}</ScrollArea>
                    <DialogFooter>
                      <Button onClick={() => setShowPromptHelp(false)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="font-mono text-sm h-60 resize-none"
                        placeholder="You are an AI assistant. Your task is to..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Define the agent's behavior and capabilities. Use {{ variable }} for dynamic
                      content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Prompt Preview</CardTitle>
                  <CardDescription>
                    How the prompt will look with variables filled in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {promptPreview || 'Enter a prompt template above to see a preview'}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Reset variables with some defaults for preview
                      setPromptVariables({
                        name: 'John Doe',
                        email: 'john@example.com',
                        subject: 'Meeting Request',
                        body: 'I would like to schedule a meeting to discuss our project.',
                        date: new Date().toLocaleDateString(),
                      });
                    }}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Reset Preview
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={generatePrompt}
                    disabled={capabilities.filter(c => c.isEnabled).length === 0}
                  >
                    <Sparkles className="h-3 w-3 mr-2" />
                    Generate from Capabilities
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="model" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="modelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo (OpenAI)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus (Anthropic)</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Anthropic)</SelectItem>
                        <SelectItem value="claude-3-haiku">Claude 3 Haiku (Anthropic)</SelectItem>
                        <SelectItem value="mistral-large">Mistral Large (Mistral AI)</SelectItem>
                        <SelectItem value="mistral-medium">Mistral Medium (Mistral AI)</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro (Google)</SelectItem>
                        <SelectItem value="llama-3">Llama 3 (Meta)</SelectItem>
                        <SelectItem value="custom">Custom Model</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The AI model to use for this agent</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel>Temperature</FormLabel>
                  <div className="flex items-center gap-2">
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[form.getValues('modelConfig.temperature') || 0.7]}
                      onValueChange={vals => form.setValue('modelConfig.temperature', vals[0])}
                      className="flex-1"
                    />
                    <div className="w-12 text-center">
                      {Number(form.getValues('modelConfig.temperature') || 0.7).toFixed(2)}
                    </div>
                  </div>
                  <FormDescription>
                    Controls randomness: lower means more deterministic
                  </FormDescription>
                </div>

                <div>
                  <FormLabel>Max Tokens</FormLabel>
                  <Input
                    type="number"
                    min="100"
                    max="100000"
                    value={form.getValues('modelConfig.maxTokens') || ''}
                    onChange={e =>
                      form.setValue(
                        'modelConfig.maxTokens',
                        e.target.value === '' ? undefined : parseInt(e.target.value)
                      )
                    }
                    placeholder="Default"
                  />
                  <FormDescription>Maximum response length</FormDescription>
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-md space-y-3">
                <h3 className="font-medium">Advanced Settings</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Top P</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={form.getValues('modelConfig.topP') || ''}
                      onChange={e =>
                        form.setValue(
                          'modelConfig.topP',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
                      placeholder="Default"
                    />
                    <FormDescription className="text-xs">
                      Controls diversity via nucleus sampling
                    </FormDescription>
                  </div>

                  <div>
                    <FormLabel>Frequency Penalty</FormLabel>
                    <Input
                      type="number"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={form.getValues('modelConfig.frequencyPenalty') || ''}
                      onChange={e =>
                        form.setValue(
                          'modelConfig.frequencyPenalty',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
                      placeholder="Default"
                    />
                    <FormDescription className="text-xs">Penalizes repeated tokens</FormDescription>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Presence Penalty</FormLabel>
                    <Input
                      type="number"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={form.getValues('modelConfig.presencePenalty') || ''}
                      onChange={e =>
                        form.setValue(
                          'modelConfig.presencePenalty',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
                      placeholder="Default"
                    />
                    <FormDescription className="text-xs">Penalizes repeated topics</FormDescription>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={form.getValues('modelConfig.streamResponse')}
                        onCheckedChange={checked =>
                          form.setValue('modelConfig.streamResponse', !!checked)
                        }
                      />
                      <span>Stream Response</span>
                    </label>
                    <FormDescription className="text-xs ml-6">
                      Get partial results as they're generated
                    </FormDescription>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update' : 'Create'} Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Capability Dialog */}
      <Dialog open={showCapabilityDialog} onOpenChange={setShowCapabilityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCapability?.id ? 'Edit Capability' : 'Add New Capability'}
            </DialogTitle>
            <DialogDescription>Define what this agent can do</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel>Capability Name</FormLabel>
              <Input
                placeholder="Email Analysis"
                value={selectedCapability?.name || ''}
                onChange={e =>
                  setSelectedCapability(prev => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
              <FormDescription>A descriptive name for this capability</FormDescription>
            </div>

            <div className="space-y-2">
              <FormLabel>Capability Key</FormLabel>
              <Input
                placeholder="email_analysis"
                value={selectedCapability?.key || ''}
                onChange={e =>
                  setSelectedCapability(prev => ({
                    ...prev,
                    key: e.target.value,
                  }))
                }
              />
              <FormDescription>
                A unique identifier for this capability (lowercase with underscores)
              </FormDescription>
            </div>

            <div className="space-y-2">
              <FormLabel>Type</FormLabel>
              <Select
                value={selectedCapability?.type || undefined}
                onValueChange={value =>
                  setSelectedCapability(prev => ({
                    ...prev,
                    type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="EMAIL_SENDING">Email Sending</SelectItem>
                  <SelectItem value="EMAIL_READING">Email Reading</SelectItem>
                  <SelectItem value="ANALYTICS">Analytics</SelectItem>
                  <SelectItem value="DOCUMENT_CREATION">Document Creation</SelectItem>
                  <SelectItem value="DATA_PROCESSING">Data Processing</SelectItem>
                  <SelectItem value="CALENDAR_ACCESS">Calendar Access</SelectItem>
                  <SelectItem value="TASK_MANAGEMENT">Task Management</SelectItem>
                  <SelectItem value="WEB_SEARCH">Web Search</SelectItem>
                  <SelectItem value="KNOWLEDGE_BASE">Knowledge Base</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>The category of this capability</FormDescription>
            </div>

            <div className="space-y-2">
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Analyzes email content to extract insights..."
                value={selectedCapability?.description || ''}
                onChange={e =>
                  setSelectedCapability(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <FormDescription>Describe what this capability does</FormDescription>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setShowCapabilityDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="button" onClick={() => saveCapability(selectedCapability || {})}>
              <Save className="h-4 w-4 mr-2" />
              Save Capability
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
