'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDashboard } from '@/context/dashboard-context';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertCircle,
  Check,
  Zap,
  Bot,
  Code,
  Search,
  Mail,
  Brain,
  Calendar,
  Database,
  Globe,
  File,
  ChevronRight,
  Save,
  PlayCircle,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

// Agent edit form schema (same as create form)
const agentFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum([
    'SUPPORT',
    'EMAIL',
    'SALES',
    'SCHEDULING',
    'CONTENT',
    'RESEARCH',
    'ASSISTANT',
    'CODING',
    'CUSTOM',
  ]),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  capabilities: z.array(z.string()).optional(),
  modelProvider: z.enum(['OPENAI', 'ANTHROPIC', 'GOOGLE', 'MISTRAL', 'CUSTOM']),
  modelName: z.string(),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(100).max(16000),
  systemMessage: z.string().optional(),
  tools: z.array(z.string()).optional(),
  requiresTraining: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  avatarUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'TRAINING', 'ARCHIVED']).default('ACTIVE'),
});

// Example AI model options
const aiModels = {
  OPENAI: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  ANTHROPIC: [
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  ],
  GOOGLE: [
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-ultra', label: 'Gemini Ultra' },
  ],
  MISTRAL: [
    { value: 'mistral-large', label: 'Mistral Large' },
    { value: 'mistral-medium', label: 'Mistral Medium' },
    { value: 'mistral-small', label: 'Mistral Small' },
  ],
  CUSTOM: [{ value: 'custom-model', label: 'Custom Model' }],
};

// Capability options
const capabilities = [
  { id: 'web_search', label: 'Web Search', icon: <Search className="h-4 w-4" /> },
  { id: 'email_access', label: 'Email Access', icon: <Mail className="h-4 w-4" /> },
  { id: 'code_execution', label: 'Code Execution', icon: <Code className="h-4 w-4" /> },
  { id: 'calendar_access', label: 'Calendar Access', icon: <Calendar className="h-4 w-4" /> },
  { id: 'file_access', label: 'File Access', icon: <File className="h-4 w-4" /> },
  { id: 'database_access', label: 'Database Access', icon: <Database className="h-4 w-4" /> },
  { id: 'api_access', label: 'API Access', icon: <Globe className="h-4 w-4" /> },
];

// Mock agent data for editing
const mockAgentData = {
  id: 'agent1',
  name: 'Customer Support Assistant',
  description: 'Handles basic customer support queries and routes complex issues',
  type: 'SUPPORT',
  prompt:
    'You are a customer support assistant that helps users with their questions about our products and services. Be polite, helpful, and concise in your responses.',
  capabilities: ['web_search', 'email_access'],
  modelProvider: 'OPENAI',
  modelName: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2000,
  systemMessage:
    'You are a helpful customer support assistant for our company. Answer customer questions accurately and professionally.',
  tools: [],
  requiresTraining: false,
  isPublic: true,
  avatarUrl: '',
  status: 'ACTIVE',
  createdAt: '2025-04-15T10:30:00Z',
  updatedAt: '2025-05-12T14:30:00Z',
  usageCount: 1248,
  rating: 4.7,
};

export function AgentEdit() {
  const router = useRouter();
  const { changeSection, sectionParams } = useDashboard();
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modelOptions, setModelOptions] = useState(aiModels.OPENAI);
  const [agentData, setAgentData] = useState(mockAgentData);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with agent data
  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'SUPPORT',
      prompt: '',
      modelProvider: 'OPENAI',
      modelName: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000,
      systemMessage: '',
      tools: [],
      requiresTraining: false,
      isPublic: false,
      status: 'ACTIVE',
    },
  });

  // Load agent data when component mounts
  useEffect(() => {
    const loadAgent = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/agents/${sectionParams?.agentId}`);
        // const data = await response.json();

        // For the mock, we'll just use the static data
        const data = mockAgentData;

        setAgentData(data);

        // Set form values
        form.reset({
          name: data.name,
          description: data.description || '',
          type: data.type as any,
          prompt: data.prompt,
          modelProvider: data.modelProvider as any,
          modelName: data.modelName,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          systemMessage: data.systemMessage || '',
          tools: data.tools || [],
          requiresTraining: data.requiresTraining,
          isPublic: data.isPublic,
          status: data.status as any,
        });

        // Set selected capabilities
        setSelectedCapabilities(data.capabilities || []);

        // Set model options based on provider
        setModelOptions(aiModels[data.modelProvider as keyof typeof aiModels]);
      } catch (error) {
        console.error('Error loading agent:', error);
        toast({
          title: 'Error loading agent',
          description: 'There was a problem loading the agent data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAgent();
  }, [form, sectionParams]);

  // Watch for model provider changes to update model options
  const modelProvider = form.watch('modelProvider');

  useEffect(() => {
    setModelOptions(aiModels[modelProvider as keyof typeof aiModels]);
    // If the current model is not in the new provider options, set a default
    const currentModel = form.getValues('modelName');
    const availableModels = aiModels[modelProvider as keyof typeof aiModels].map(m => m.value);

    if (!availableModels.includes(currentModel)) {
      form.setValue('modelName', availableModels[0]);
    }
  }, [modelProvider, form]);

  // Watch for form changes to enable/disable save button
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle capability selection
  const handleCapabilityToggle = (id: string) => {
    setSelectedCapabilities(prev => {
      if (prev.includes(id)) {
        return prev.filter(capId => capId !== id);
      } else {
        return [...prev, id];
      }
    });
    setHasChanges(true);
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof agentFormSchema>) => {
    setIsSubmitting(true);

    // Add selected capabilities to form data
    data.capabilities = selectedCapabilities;

    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/agents/${sectionParams?.agentId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) throw new Error('Failed to update agent');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Agent updated successfully!',
        description: `Your agent "${data.name}" has been updated.`,
      });

      setHasChanges(false);

      // Navigate back to agents list
      changeSection('agents-my');
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: 'Failed to update agent',
        description: 'There was a problem updating your agent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle canceling edit
  const handleCancel = () => {
    if (hasChanges) {
      // Show confirmation dialog in a real app
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        changeSection('agents-my');
      }
    } else {
      changeSection('agents-my');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Agent</h1>
          <p className="text-muted-foreground">Update your AI assistant configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting || !hasChanges}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <p className="text-sm text-amber-600">
          <span className="font-medium">Agent Status: </span>
          {agentData.status === 'ACTIVE'
            ? 'Active - This agent is in production'
            : agentData.status}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="model">AI Model</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Configure the basic details of your agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Agent Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Customer Support Assistant" {...field} />
                        </FormControl>
                        <FormDescription>A descriptive name for your agent</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Agent Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this agent does..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of what this agent does and how it should be used
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Agent Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SUPPORT">Support</SelectItem>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="SALES">Sales</SelectItem>
                            <SelectItem value="SCHEDULING">Scheduling</SelectItem>
                            <SelectItem value="CONTENT">Content</SelectItem>
                            <SelectItem value="RESEARCH">Research</SelectItem>
                            <SelectItem value="ASSISTANT">Assistant</SelectItem>
                            <SelectItem value="CODING">Coding</SelectItem>
                            <SelectItem value="CUSTOM">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The primary function of this agent</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Agent Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PAUSED">Paused</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The current operational status of this agent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Avatar Selection */}
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Avatar</FormLabel>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={field.value} />
                            <AvatarFallback>
                              <Bot className="h-8 w-8" />
                            </AvatarFallback>
                          </Avatar>
                          <Button type="button" variant="outline" className="h-10">
                            Choose Avatar
                          </Button>
                        </div>
                        <FormDescription>
                          Personalize your agent with a custom avatar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" type="button" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setActiveTab('capabilities')}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Capabilities Tab */}
            <TabsContent value="capabilities" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Capabilities</CardTitle>
                  <CardDescription>Choose what your agent can access and do</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Available Capabilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {capabilities.map(capability => (
                        <div
                          key={capability.id}
                          className={cn(
                            'flex items-center space-x-3 rounded-md border p-4 cursor-pointer transition-colors',
                            selectedCapabilities.includes(capability.id)
                              ? 'bg-primary/5 border-primary/20'
                              : 'hover:bg-muted'
                          )}
                          onClick={() => handleCapabilityToggle(capability.id)}
                        >
                          <Checkbox
                            checked={selectedCapabilities.includes(capability.id)}
                            onCheckedChange={() => handleCapabilityToggle(capability.id)}
                            id={capability.id}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center">
                              <div className="mr-2 bg-primary/10 p-1 rounded-full">
                                {capability.icon}
                              </div>
                              <label
                                htmlFor={capability.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {capability.label}
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Message */}
                  <FormField
                    control={form.control}
                    name="systemMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="You are a helpful assistant..."
                            className="resize-none min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Define the agent's behavior and personality with a system message
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Main Prompt */}
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed instructions for your agent..."
                            className="resize-none min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This prompt will guide your agent on how to respond to user queries
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setActiveTab('basic')}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setActiveTab('model')}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* AI Model Tab */}
            <TabsContent value="model" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Configuration</CardTitle>
                  <CardDescription>
                    Choose and configure the AI model that powers your agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Model Provider */}
                  <FormField
                    control={form.control}
                    name="modelProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="OPENAI">OpenAI</SelectItem>
                            <SelectItem value="ANTHROPIC">Anthropic</SelectItem>
                            <SelectItem value="GOOGLE">Google</SelectItem>
                            <SelectItem value="MISTRAL">Mistral AI</SelectItem>
                            <SelectItem value="CUSTOM">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The AI company providing the model</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Model Name */}
                  <FormField
                    control={form.control}
                    name="modelName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modelOptions.map(model => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>The specific model to use for this agent</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Temperature */}
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Temperature</FormLabel>
                          <span className="text-sm text-muted-foreground">{field.value}</span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={values => field.onChange(values[0])}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>More Focused</span>
                          <span>More Creative</span>
                        </div>
                        <FormDescription>
                          Controls randomness: lower values are more deterministic, higher values
                          more creative
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Max Tokens */}
                  <FormField
                    control={form.control}
                    name="maxTokens"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Max Output Length</FormLabel>
                          <span className="text-sm text-muted-foreground">
                            {field.value} tokens
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={100}
                            max={16000}
                            step={100}
                            value={[field.value]}
                            onValueChange={values => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          The maximum length of the response in tokens (roughly 4 characters per
                          token)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setActiveTab('capabilities')}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={() => setActiveTab('advanced')}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>Configure advanced options for your agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Training Toggle */}
                  <FormField
                    control={form.control}
                    name="requiresTraining"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Training Mode</FormLabel>
                          <FormDescription>
                            Allow uploading custom data to train this agent
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Public Toggle */}
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Make Public</FormLabel>
                          <FormDescription>
                            Allow other workspace members to use this agent
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Usage Stats */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Agent Usage</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <div className="text-sm text-muted-foreground">Total Interactions</div>
                        <div className="text-2xl font-bold mt-1">
                          {agentData.usageCount.toLocaleString()}
                        </div>
                      </div>
                      <div className="border rounded-md p-4">
                        <div className="text-sm text-muted-foreground">Average Rating</div>
                        <div className="text-2xl font-bold mt-1">{agentData.rating}</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Additional Information</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Created: {new Date(agentData.createdAt).toLocaleDateString()}</div>
                      <div>Last Updated: {new Date(agentData.updatedAt).toLocaleDateString()}</div>
                      <div>ID: {agentData.id}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => setActiveTab('model')}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !hasChanges}>
                    {isSubmitting ? (
                      <>Saving Changes...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
