'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  Sparkles,
  Settings,
  BrainCircuit,
  MessageSquare,
  Mail,
  FileText,
  UserPlus,
  Github,
  Lock,
  Bot,
  Database,
  Clock,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Check,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/sonner';
import { useDashboard } from '@/context/dashboard-context';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export function SettingsAI() {
  const { goBack } = useDashboard();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('models');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [aiSettings, setAiSettings] = useState({
    temperature: 0.7,
    contextWindow: 'medium',
    streaming: true,
    autoSave: true,
    enhanceDrafts: true,
    contactEnrichment: true,
    analyticsEnabled: true,
    webSearch: true,
  });
  const [usagePercent, setUsagePercent] = useState(68);
  const [isResetting, setIsResetting] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Save AI settings
  const saveSettings = () => {
    toast({
      title: 'AI settings saved',
      description: 'Your AI configuration has been updated successfully.',
    });
  };

  // Reset AI settings to defaults
  const resetSettings = () => {
    setIsResetting(true);

    // Simulate reset delay
    setTimeout(() => {
      setAiSettings({
        temperature: 0.7,
        contextWindow: 'medium',
        streaming: true,
        autoSave: true,
        enhanceDrafts: true,
        contactEnrichment: true,
        analyticsEnabled: true,
        webSearch: true,
      });
      setSelectedModel('gpt-4o');
      setIsResetting(false);

      toast({
        title: 'Settings reset',
        description: 'AI settings have been reset to default values.',
      });
    }, 1000);
  };

  // Format the AI model data
  const models = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Our most capable model for complex tasks',
      price: '0.01 / 1K tokens',
      contextSize: 128000,
      recommended: true,
    },
    {
      id: 'claude-3',
      name: 'Claude 3 Opus',
      description: "Anthropic's most advanced model",
      price: '0.015 / 1K tokens',
      contextSize: 100000,
      recommended: false,
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and cost-effective for simpler tasks',
      price: '0.002 / 1K tokens',
      contextSize: 16000,
      recommended: false,
    },
    {
      id: 'internal',
      name: 'Fine-tuned Internal Model',
      description: 'Custom model trained on your company data',
      price: 'Custom pricing',
      contextSize: 32000,
      recommended: false,
    },
  ];

  // Connect to OpenAI
  const connectOpenAI = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'API key required',
        description: 'Please enter your OpenAI API key to connect.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Connected to OpenAI',
      description: 'Your API key has been verified and connected successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">AI Settings</h1>
      </div>

      <div className="flex items-center justify-between bg-muted/40 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <BrainCircuit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-medium">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Enable AI-powered features across the application
            </p>
          </div>
        </div>
        <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} className="ml-4" />
      </div>

      {aiEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>
                  Configure how AI behaves and integrates with your workflow.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="flex justify-start px-6 pt-2 border-b w-full rounded-none">
                    <TabsTrigger value="models" className="flex items-center gap-1.5">
                      <BrainCircuit className="h-4 w-4" />
                      <span>Models</span>
                    </TabsTrigger>
                    <TabsTrigger value="behavior" className="flex items-center gap-1.5">
                      <Settings className="h-4 w-4" />
                      <span>Behavior</span>
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="flex items-center gap-1.5">
                      <Bot className="h-4 w-4" />
                      <span>Integrations</span>
                    </TabsTrigger>
                    <TabsTrigger value="api" className="flex items-center gap-1.5">
                      <Lock className="h-4 w-4" />
                      <span>API Keys</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="models" className="p-6 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Select AI Model</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose which AI model to use for various features in the application.
                        Different models have different capabilities and pricing.
                      </p>

                      <RadioGroup
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                        className="mt-4 space-y-4"
                      >
                        {models.map(model => (
                          <div
                            key={model.id}
                            className={`flex flex-col p-4 border rounded-lg cursor-pointer hover:border-primary/50 transition-all ${
                              selectedModel === model.id ? 'border-primary bg-primary/5' : ''
                            }`}
                            onClick={() => setSelectedModel(model.id)}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem
                                value={model.id}
                                id={`model-${model.id}`}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <Label
                                    htmlFor={`model-${model.id}`}
                                    className="text-base font-medium cursor-pointer"
                                  >
                                    {model.name}
                                  </Label>
                                  <div className="flex items-center">
                                    {model.recommended && (
                                      <Badge className="mr-2 bg-primary/20 text-primary border-primary/30">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Recommended
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {model.price}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {model.description}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge variant="outline" className="bg-muted/50">
                                    {model.contextSize.toLocaleString()} token context
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </TabsContent>

                  <TabsContent value="behavior" className="p-6 space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-base font-medium">Response Parameters</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="temperature">
                                Temperature: {aiSettings.temperature.toFixed(1)}
                              </Label>
                            </div>
                            <Slider
                              id="temperature"
                              min={0}
                              max={1}
                              step={0.1}
                              value={[aiSettings.temperature]}
                              onValueChange={value =>
                                setAiSettings({ ...aiSettings, temperature: value[0] })
                              }
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Precise (0.0)</span>
                              <span>Creative (1.0)</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Controls the randomness of responses. Lower values are more
                              deterministic, higher values are more creative.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="context-window">Context Window</Label>
                            <Select
                              value={aiSettings.contextWindow}
                              onValueChange={value =>
                                setAiSettings({ ...aiSettings, contextWindow: value })
                              }
                            >
                              <SelectTrigger id="context-window">
                                <SelectValue placeholder="Select context window size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small (4K tokens)</SelectItem>
                                <SelectItem value="medium">Medium (16K tokens)</SelectItem>
                                <SelectItem value="large">Large (32K tokens)</SelectItem>
                                <SelectItem value="maximum">
                                  Maximum (available in selected model)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              How much conversation history to include. Larger windows provide more
                              context but use more tokens.
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="streaming">Response Streaming</Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Show AI responses as they're being generated in real-time.
                              </p>
                            </div>
                            <Switch
                              id="streaming"
                              checked={aiSettings.streaming}
                              onCheckedChange={value =>
                                setAiSettings({ ...aiSettings, streaming: value })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h3 className="text-base font-medium">AI Features</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="enhance-drafts">Email Draft Enhancement</Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Automatically suggest improvements to your email drafts.
                              </p>
                            </div>
                            <Switch
                              id="enhance-drafts"
                              checked={aiSettings.enhanceDrafts}
                              onCheckedChange={value =>
                                setAiSettings({ ...aiSettings, enhanceDrafts: value })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="contact-enrichment">Contact Data Enrichment</Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Automatically fill in missing contact information from public
                                sources.
                              </p>
                            </div>
                            <Switch
                              id="contact-enrichment"
                              checked={aiSettings.contactEnrichment}
                              onCheckedChange={value =>
                                setAiSettings({ ...aiSettings, contactEnrichment: value })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="web-search">Web Search Access</Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Allow AI to search the web for up-to-date information.
                              </p>
                            </div>
                            <Switch
                              id="web-search"
                              checked={aiSettings.webSearch}
                              onCheckedChange={value =>
                                setAiSettings({ ...aiSettings, webSearch: value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="integrations" className="p-6 space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-base font-medium">AI Assistant Integrations</h3>
                        <p className="text-sm text-muted-foreground">
                          Enable AI features in specific areas of the application.
                        </p>

                        <div className="space-y-4 mt-2">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="font-medium">Email Composer</p>
                                <p className="text-xs text-muted-foreground">
                                  Smart suggestions and auto-completion for emails
                                </p>
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <MessageSquare className="h-5 w-5 text-purple-500" />
                              <div>
                                <p className="font-medium">Meeting Summaries</p>
                                <p className="text-xs text-muted-foreground">
                                  Generate summaries and action items from meetings
                                </p>
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="font-medium">Document Analysis</p>
                                <p className="text-xs text-muted-foreground">
                                  Extract insights and key points from documents
                                </p>
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <UserPlus className="h-5 w-5 text-orange-500" />
                              <div>
                                <p className="font-medium">Contact Insights</p>
                                <p className="text-xs text-muted-foreground">
                                  Generate insights and engagement recommendations for contacts
                                </p>
                              </div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-base font-medium">Third-Party AI Services</h3>
                        <p className="text-sm text-muted-foreground">
                          Connect with external AI services for enhanced functionality.
                        </p>

                        <div className="space-y-4 mt-2">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Github className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-medium">GitHub Copilot</p>
                                  <Badge variant="outline" className="ml-1 text-xs px-1.5">
                                    External
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  AI-powered code suggestions and integration
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Connect
                            </Button>
                          </div>

                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Database className="h-5 w-5 text-blue-600" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-medium">Clearbit</p>
                                  <Badge variant="outline" className="ml-1 text-xs px-1.5">
                                    External
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Enhanced contact and company data enrichment
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Connect
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="api" className="p-6 space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-base font-medium">API Access</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure API keys for third-party AI services.
                        </p>

                        <div className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-md">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-green-600"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M19.3641 5.42124C18.9738 5.63436 18.4224 5.46409 18.2093 5.07373C18.0103 4.70711 17.9798 4.27792 18.1249 3.88638C18.2747 3.48051 18.5836 3.1627 18.9798 3.00348C19.3975 2.83833 19.8674 2.87608 20.2521 3.10447C20.6358 3.33372 20.9049 3.72935 20.995 4.18608C21.0841 4.6437 20.9841 5.11579 20.7152 5.49293C20.4473 5.86919 20.0351 6.11953 19.5759 6.18408C19.5077 6.19353 19.4385 6.19867 19.3702 6.19867C19.3674 6.19867 19.3656 6.19857 19.3637 6.19837C19.3619 6.19857 19.3601 6.19867 19.3574 6.19867C19.1249 6.19867 18.896 6.13577 18.6951 6.01507C18.2519 5.74344 17.9911 5.25144 18.0084 4.73363C18.026 4.20969 18.3367 3.73848 18.8001 3.49861C19.2625 3.25953 19.8145 3.28883 20.2502 3.57092C20.6899 3.85616 20.9511 4.36467 20.9254 4.89338C20.9158 5.08658 20.8734 5.27466 20.7992 5.44968C20.7181 5.64167 20.6043 5.81697 20.4634 5.9643C20.4591 5.96897 20.4549 5.97364 20.4507 5.97831C20.1207 6.33446 19.6515 6.51587 19.1713 6.47169C18.6921 6.42674 18.2681 6.16434 18.0084 5.76359C17.7486 5.36295 17.6792 4.87198 17.8152 4.4145C17.9512 3.95701 18.2747 3.58151 18.7061 3.38842C19.1427 3.19414 19.6348 3.20874 20.0596 3.4221C20.4854 3.63644 20.7883 4.02772 20.8953 4.49008C20.8983 4.50523 20.9011 4.52038 20.9039 4.53565C21.0841 5.01869 20.9841 5.55037 20.6367 5.93274C20.2924 6.31211 19.7708 6.47214 19.3021 6.34074C19.2973 6.33952 19.2926 6.33827 19.2879 6.33698C19.2877 6.33691 19.2875 6.33685 19.2873 6.33679C18.8331 6.20299 18.4861 5.84582 18.3757 5.38655C18.2642 4.92213 18.3873 4.43715 18.7068 4.09514C18.7118 4.08987 18.7168 4.08466 18.722 4.07952C19.0572 3.74607 19.5457 3.61166 19.9946 3.73424C20.4435 3.85682 20.7834 4.21332 20.8945 4.66241C21.0057 5.11161 20.8835 5.59669 20.5638 5.93879C20.2441 6.28088 19.7667 6.41752 19.3179 6.29605C18.869 6.17448 18.5282 5.82052 18.4151 5.37367C18.3019 4.92682 18.421 4.43953 18.74 4.09417C19.058 3.74989 19.5309 3.61236 19.9814 3.72627C20.4328 3.84028 20.7799 4.18513 20.899 4.62788C21.0181 5.07072 20.9053 5.55545 20.5922 5.90384C20.2791 6.25233 19.8091 6.39649 19.3578 6.28892C19.3509 6.28742 19.344 6.28585 19.3371 6.28422C18.9341 6.15635 18.6241 5.83546 18.5173 5.42124C18.4097 5.004 18.5142 4.56608 18.7939 4.24276C19.073 3.9198 19.4948 3.76743 19.9079 3.83616C20.3179 3.90428 20.6564 4.18732 20.8001 4.5746C20.9446 4.96385 20.8794 5.39579 20.6227 5.72193C20.366 6.04796 19.964 6.21166 19.5604 6.14953C19.1486 6.08585 18.8045 5.79539 18.6642 5.39863C18.5248 5.00382 18.6018 4.56857 18.867 4.24725C19.1323 3.9258 19.5397 3.77734 19.9403 3.85735C20.3398 3.93705 20.6634 4.23321 20.7969 4.62583C20.932 5.02281 20.8448 5.46227 20.5707 5.78125C20.2996 6.09718 19.8948 6.24186 19.5028 6.1586C19.3874 6.13102 19.2769 6.08406 19.1758 6.01961C19.1747 6.01896 19.1737 6.01832 19.1727 6.01768C18.7705 5.76835 18.5686 5.29662 18.6714 4.84449C18.6718 4.84309 18.6722 4.84168 18.6726 4.84028C18.776 4.38804 19.1239 4.03702 19.5709 3.92585C19.7913 3.87208 20.0193 3.87962 20.235 3.94716C20.4488 4.01408 20.643 4.13849 20.7969 4.30842C20.9509 4.47845 21.0606 4.68792 21.1152 4.91624C21.1699 5.14455 21.1671 5.38459 21.1095 5.61047C21.0519 5.83645 20.9403 6.04237 20.7841 6.20808C20.6279 6.37379 20.4325 6.49269 20.2183 6.55274C20.003 6.61319 19.7754 6.61392 19.5603 6.5565C19.4471 6.5267 19.3394 6.4825 19.2406 6.42388C19.2111 6.40568 19.1825 6.38613 19.1548 6.36509C18.8064 6.1145 18.6126 5.69376 18.6535 5.26613C18.6943 4.83849 18.9546 4.46544 19.3324 4.30842C19.7101 4.15151 20.1408 4.23323 20.4436 4.52282C20.7453 4.81137 20.8486 5.23885 20.7242 5.62457C20.5988 6.01322 20.2706 6.29744 19.8741 6.34306C19.4777 6.38858 19.0963 6.19414 18.8881 5.84289C18.6788 5.49019 18.6788 5.05275 18.8881 4.70004C19.0973 4.34734 19.4807 4.15453 19.8753 4.20291C20.2698 4.25128 20.5949 4.53735 20.7172 4.92495C20.8396 5.31255 20.7337 5.73699 20.4352 6.021C20.1366 6.30501 19.7079 6.38746 19.3324 6.23109C18.9569 6.07472 18.7002 5.70456 18.6642 5.28058C18.6283 4.85649 18.8207 4.44799 19.1727 4.22072C19.5256 3.99262 19.9655 3.99524 20.3158 4.22664C20.6651 4.45763 20.8481 4.87154 20.8114 5.29573C20.7747 5.71981 20.5136 6.08795 20.1336 6.24116C19.7536 6.39427 19.3221 6.31275 19.0255 6.03543C18.7288 5.758 18.6248 5.33123 18.7595 4.94836C18.8943 4.56558 19.2255 4.28918 19.6193 4.2537C20.0153 4.2181 20.381 4.41875 20.5766 4.76376C20.7722 5.10877 20.758 5.53975 20.5396 5.87168C20.3211 6.20362 19.9422 6.37849 19.5563 6.34897C19.1705 6.31944 18.8284 6.09082 18.6642 5.75312C18.4989 5.4142 18.5475 5.01175 18.7939 4.72324C19.0403 4.43474 19.4306 4.32752 19.7792 4.45165C20.1267 4.57558 20.3736 4.90533 20.418 5.28244C20.4624 5.65955 20.2972 6.0252 20.0003 6.23853C19.7034 6.45187 19.3209 6.47536 19.0035 6.29958C18.6861 6.1238 18.4917 5.78026 18.4948 5.41285C18.4978 5.04544 18.6969 4.70535 19.0168 4.53565C19.3376 4.36502 19.7178 4.39645 20.0061 4.62685C20.2954 4.85836 20.4305 5.24109 20.3538 5.60632C20.2771 5.97155 20.0001 6.25963 19.642 6.33362C19.2839 6.40761 18.9187 6.25474 18.7061 5.9501C18.5546 5.75335 18.4816 5.5046 18.5017 5.25533C18.5218 5.00605 18.634 4.77246 18.8179 4.60232C19.063 4.3695 19.4149 4.27804 19.745 4.36264C20.0739 4.44692 20.3338 4.69345 20.4352 5.01869C20.5366 5.34393 20.4629 5.7012 20.2425 5.95835C20.0211 6.21655 19.6854 6.33088 19.3645 6.26394C19.0436 6.197 18.7767 5.9618 18.6714 5.64729C18.5659 5.33288 18.6342 4.98267 18.8509 4.73333C19.0667 4.48482 19.3905 4.38234 19.7001 4.45882C20.0097 4.5353 20.2504 4.77743 20.3274 5.08673C20.3478 5.1582 20.3589 5.23153 20.3603 5.30553C20.3603 5.30644 20.3603 5.30735 20.3603 5.30826C20.3603 5.36793 20.3542 5.42748 20.3411 5.48572C20.2651 5.79472 20.0252 6.03602 19.716 6.11174C19.4061 6.18747 19.084 6.08346 18.8689 5.83703C18.6538 5.59059 18.5905 5.2416 18.7061 4.9336C18.8217 4.6256 19.0946 4.40063 19.4147 4.36099C19.7347 4.32125 20.0483 4.47278 20.2183 4.75194C20.3882 5.03109 20.387 5.38449 20.2149 5.66242C20.0427 5.94035 19.7274 6.09004 19.4066 6.04694C19.0857 6.00395 18.8127 5.77563 18.7011 5.46379C18.5906 5.15371 18.6535 4.80627 18.8689 4.55826C19.0832 4.31138 19.4064 4.211 19.7104 4.30167C20.0145 4.39234 20.2444 4.6574 20.2982 4.97476C20.352 5.29212 20.2207 5.61158 19.9696 5.80168C19.7195 5.99078 19.3899 6.02128 19.1103 5.87847C18.8308 5.73577 18.6583 5.44523 18.6642 5.13203C18.6701 4.81882 18.8533 4.53485 19.1389 4.40267C19.4246 4.27048 19.7558 4.31458 20.0003 4.51522C20.2448 4.71585 20.355 5.04358 20.2866 5.35744C20.2182 5.67129 19.9865 5.92092 19.6865 6.00014C19.3875 6.07925 19.0681 5.97679 18.8652 5.73784C18.6612 5.49778 18.6013 5.16345 18.7135 4.87017C18.8257 4.57679 19.0825 4.36792 19.3904 4.33087C19.6972 4.29403 19.9923 4.43481 20.1618 4.68618C20.3313 4.93755 20.3431 5.2639 20.1899 5.5278C20.0367 5.7918 19.747 5.9507 19.438 5.93481C19.129 5.91892 18.8602 5.73132 18.7408 5.45165C18.6214 5.17199 18.6856 4.84928 18.9014 4.62788C19.1162 4.40647 19.4329 4.3344 19.7135 4.44358C19.993 4.55265 20.1923 4.82202 20.2183 5.12663C20.2442 5.43124 20.0921 5.72361 19.8333 5.8694C19.5745 6.01519 19.261 5.99387 19.026 5.81548C18.7911 5.63709 18.6752 5.33112 18.7214 5.03225C18.7677 4.73327 18.9678 4.48572 19.2493 4.39487C19.5307 4.30403 19.8358 4.38764 20.0424 4.60624C20.2489 4.82493 20.3164 5.1489 20.2151 5.43632C20.1138 5.72364 19.8613 5.92518 19.5709 5.95231C19.2804 5.97943 18.9994 5.82967 18.852 5.57262C18.7046 5.31556 18.7239 4.99614 18.8976 4.75797C19.0712 4.5197 19.3569 4.4021 19.6355 4.44965C19.9142 4.4972 20.1385 4.69767 20.2151 4.96838C20.2917 5.23909 20.205 5.53246 19.9975 5.70792C19.79 5.88339 19.5085 5.9121 19.2701 5.77998C19.0318 5.64785 18.89 5.37743 18.8994 5.09338C18.9088 4.80921 19.0672 4.54798 19.3134 4.43205C19.5585 4.31667 19.8428 4.36396 20.0424 4.55533C20.242 4.7467 20.3221 5.05009 20.2443 5.32979C20.1665 5.60938 19.9453 5.82136 19.6716 5.87944C19.3979 5.93752 19.119 5.82798 18.9446 5.59782C18.7703 5.36766 18.7322 5.05648 18.8473 4.79308C18.9625 4.52978 19.2034 4.35372 19.4723 4.33374C19.7401 4.31376 19.9976 4.45351 20.1392 4.69534C20.2809 4.93737 20.2767 5.24105 20.1287 5.47896C19.9808 5.71686 19.7192 5.8504 19.4529 5.82164C19.1866 5.79298 18.9607 5.60687 18.8652 5.34465C18.7697 5.08242 18.8189 4.78771 18.9975 4.57771C19.176 4.36772 19.4601 4.27692 19.7218 4.34524C19.9836 4.41355 20.1879 4.62788 20.2502 4.89563C20.3125 5.16338 20.2223 5.44509 20.0154 5.62761C19.8085 5.81013 19.5258 5.86674 19.2671 5.77205C19.0083 5.67736 18.8239 5.44676 18.7772 5.17073C18.7304 4.89469 18.8273 4.61349 19.0255 4.43215C19.2237 4.25082 19.5003 4.19472 19.745 4.28918C19.9897 4.38363 20.1619 4.61007 20.2029 4.87363C20.2439 5.13718 20.1464 5.39959 19.9501 5.56341C19.7538 5.72722 19.4842 5.7644 19.2493 5.65969C19.0145 5.55499 18.8582 5.32557 18.8403 5.06689C18.8225 4.8082 18.9461 4.56141 19.1668 4.42788C19.3875 4.29426 19.66 4.29694 19.8797 4.43514C20.0993 4.57335 20.2191 4.82391 20.197 5.08194C20.1749 5.33997 20.014 5.56849 19.7749 5.67135C19.5358 5.77432 19.2622 5.73433 19.0633 5.5712C18.8644 5.40808 18.7753 5.14935 18.8323 4.90474C18.8894 4.66014 19.0842 4.46836 19.3289 4.41113C19.5736 4.3539 19.8296 4.44257 19.9975 4.64139C20.1654 4.84022 20.2151 5.11749 20.1287 5.36929C20.0424 5.62119 19.8347 5.8104 19.5836 5.86338C19.3324 5.91626 19.0775 5.82357 18.9158 5.61982C18.7541 5.41607 18.7135 5.13592 18.8091 4.8892C18.9048 4.64227 19.1186 4.46398 19.3704 4.41774C19.6222 4.37149 19.8785 4.46399 20.0424 4.65888C20.2063 4.85367 20.2502 5.12388 20.1618 5.36241C20.0735 5.60083 19.8711 5.77679 19.6287 5.82818C19.3864 5.87945 19.1347 5.79474 18.9698 5.60037C18.8039 5.40599 18.7546 5.13661 18.8323 4.89348C18.91 4.65046 19.1059 4.46734 19.3469 4.3965C19.5879 4.32565 19.845 4.38107 20.0282 4.545C20.2114 4.70892 20.2982 4.95743 20.2502 5.19893C20.2023 5.44043 20.0289 5.63647 19.8001 5.7071C19.5713 5.77773 19.3262 5.71161 19.1548 5.53373C18.9834 5.35586 18.9108 5.09982 18.9608 4.85735C19.0108 4.61489 19.1794 4.42277 19.4066 4.35099C19.6337 4.27921 19.8766 4.34048 20.0481 4.51101C20.2195 4.68164 20.2875 4.93432 20.2374 5.17678C20.1874 5.41924 20.0251 5.61431 19.8002 5.68856C19.5752 5.76291 19.3312 5.70487 19.1548 5.53702C18.9784 5.36917 18.9014 5.12024 18.9451 4.87857C18.9888 4.63679 19.1506 4.43901 19.3698 4.36099C19.589 4.28298 19.8329 4.333 20.0092 4.4997C20.1855 4.66639 20.2639 4.91471 20.2221 5.15688C20.1804 5.39904 20.0196 5.59871 19.7999 5.6776C19.5803 5.75639 19.3357 5.70622 19.1608 5.53824C18.9859 5.37026 18.9115 5.12048 18.9585 4.88066C19.0055 4.64084 19.1703 4.44514 19.3919 4.37023C19.6134 4.29522 19.855 4.35189 20.0238 4.52513C20.1926 4.69837 20.2607 4.94878 20.2064 5.18555C20.1521 5.42232 19.9841 5.61272 19.762 5.6839C19.5399 5.75508 19.3001 5.69506 19.1367 5.52532C18.9733 5.35558 18.9089 5.10919 18.9585 4.87363C19.0081 4.63807 19.1753 4.44763 19.3966 4.37739C19.6179 4.30705 19.8553 4.36717 20.021 4.54147C20.1867 4.71576 20.2522 4.96283 20.1978 5.19541C20.1434 5.42809 19.9781 5.6161 19.7608 5.68886C19.5935 5.74048 19.4154 5.73157 19.2542 5.66242"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium">OpenAI API Key</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Connect with your own OpenAI API key for GPT-4o access.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="password"
                                placeholder="sk-..."
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                className="flex-1 font-mono"
                              />
                              <Button onClick={connectOpenAI}>Connect</Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Your API key is stored securely and never shared with third parties.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="analytics-enabled">Usage Analytics</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Allow anonymous usage data to improve AI features.
                            </p>
                          </div>
                          <Switch
                            id="analytics-enabled"
                            checked={aiSettings.analyticsEnabled}
                            onCheckedChange={value =>
                              setAiSettings({ ...aiSettings, analyticsEnabled: value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>AI Token Usage</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Current Billing Period</span>
                              <span className="font-medium">{usagePercent}% used</span>
                            </div>
                            <Progress value={usagePercent} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>0 tokens</span>
                              <span>Monthly Limit: 1,000,000 tokens</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 p-4">
                <div className="flex justify-between w-full">
                  <Button variant="outline" onClick={resetSettings} disabled={isResetting}>
                    {isResetting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset to Defaults'
                    )}
                  </Button>
                  <Button onClick={saveSettings}>
                    <Check className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Features</CardTitle>
                  <CardDescription>Overview of AI capabilities in the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Smart Reply</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI-powered suggestions for email responses based on context and previous
                      communications.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Document Analysis</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Extract key information from documents, summarize content, and identify
                      important action items.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">Contact Insights</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Generate engagement recommendations and identify relationship patterns with
                      contacts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Usage Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Data Privacy</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          AI features process data according to your privacy settings. Data is not
                          stored or used to train models unless explicitly enabled.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 space-y-2">
                    <h4 className="font-medium text-sm">Optimal AI Usage</h4>
                    <p className="text-xs text-muted-foreground">
                      For best results with AI features:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Be specific in your requests</li>
                      <li>Provide context when needed</li>
                      <li>Adjust temperature settings based on tasks</li>
                      <li>Use lower temperatures for factual tasks</li>
                      <li>Use higher temperatures for creative tasks</li>
                    </ul>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Learn More About AI Features
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
