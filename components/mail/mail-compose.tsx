'use client';
import React from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Paperclip,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  Send,
  Save,
  ChevronDown,
  Image,
  File,
  FilePlus,
  Sparkles,
  MessageCircle,
  Wand2,
  Bot,
  RefreshCw,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Briefcase,
  BookOpen,
  BrainCircuit,
  ListTodo,
  Calendar as CalendarDate,
  AlertTriangle,
  Lightbulb,
  Info,
  Activity,
  FileText,
  Eye,
  Filter,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { ModuleAgentSelector } from '@/components/automation/module-agent-selector';
import { toast } from '@/components/ui/sonner';
import { EmailAIService } from '@/lib/services/email-ai-service';

// Import automation components
import { useAutomation } from '@/context/automation-context';
import {
  EmailAIAnalyzeButton,
  EmailAIResponseButton,
  EmailAIActions,
} from '@/components/mail/email-ai-action-buttons';
import { emailAutomationService } from '@/lib/services/automation/email-automation-service';
import { AutomationStatusBar } from '@/components/automation/automation-status-bar';

// Types for AI suggestions
type AISuggestion = {
  id: string;
  type: 'subject' | 'content' | 'recipient' | 'tone';
  content: string;
  score?: number;
};

type EmailContext = {
  previousEmails?: string[];
  contactInfo?: any;
  documentReferences?: string[];
  meetingHistory?: any[];
};

type EmailIntent = {
  type: string;
  confidence: number;
  description: string;
};

type EmailLead = {
  name: string;
  company?: string;
  email: string;
  position?: string;
  detectedIn: string;
  confidence: number;
};

type EmailTask = {
  title: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
};

type EmailEvent = {
  title: string;
  startTime: string;
  location?: string;
  attendees?: number;
};

type Recipient = {
  email: string;
  type: 'to' | 'cc' | 'bcc';
};

type Attachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  preview?: string;
};

export function MailCompose() {
  const { changeSection, sectionParams } = useDashboard();
  const [isSending, setIsSending] = React.useState(false);
  const [recipients, setRecipients] = React.useState<Recipient[]>([]);
  const [currentRecipient, setCurrentRecipient] = React.useState('');
  const [currentRecipientType, setCurrentRecipientType] = React.useState<'to' | 'cc' | 'bcc'>('to');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [priority, setPriority] = React.useState('normal');
  const [isScheduled, setIsScheduled] = React.useState(false);
  const [scheduleDate, setScheduleDate] = React.useState<Date | undefined>(undefined);
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [useSignature, setUseSignature] = React.useState(true);
  const [isAutosaving, setIsAutosaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [showCc, setShowCc] = React.useState(false);
  const [showBcc, setShowBcc] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get automation settings
  const { settings, isLoading: isLoadingSettings } = useAutomation();

  // AI-related states
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = React.useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = React.useState(false);
  const [showAiPanel, setShowAiPanel] = React.useState(false);
  const [emailContext, setEmailContext] = React.useState<EmailContext>({});
  const [selectedTone, setSelectedTone] = React.useState('professional');
  const [suggestedRecipients, setSuggestedRecipients] = React.useState<string[]>([]);
  const [suggestedSubjects, setSuggestedSubjects] = React.useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = React.useState<AISuggestion[]>([]);

  // Advanced AI analysis states
  const [emailIntent, setEmailIntent] = React.useState<EmailIntent | null>(null);
  const [detectedLeads, setDetectedLeads] = React.useState<EmailLead[]>([]);
  const [detectedTasks, setDetectedTasks] = React.useState<EmailTask[]>([]);
  const [detectedEvents, setDetectedEvents] = React.useState<EmailEvent[]>([]);
  const [currentTab, setCurrentTab] = React.useState('compose');
  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);
  const [showLeadDialog, setShowLeadDialog] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<EmailLead | null>(null);
  const [showRewriteOptions, setShowRewriteOptions] = React.useState(false);
  const [isAnalyzingEmail, setIsAnalyzingEmail] = React.useState(false);
  const [emailRequiresAttention, setEmailRequiresAttention] = React.useState(false);
  const [attentionReason, setAttentionReason] = React.useState('');
  const [emailId, setEmailId] = React.useState(`temp-email-${Date.now()}`); // Temp ID for demo

  // Simulated user's signature
  const signature = `
John Doe
Senior Product Manager
Example Company, Inc.
+1 (555) 123-4567
john.doe@example.com
`;

  // Check if we're replying to an email
  React.useEffect(() => {
    if (sectionParams?.replyTo) {
      // In a real app, we would fetch the email we're replying to
      console.log('Replying to email:', sectionParams.replyTo);

      if (settings.emailAnalysisEnabled) {
        // Simulate analyzing the original email
        simulateEmailAnalysis();
      }
    }
  }, [sectionParams, settings.emailAnalysisEnabled]);

  // Function to handle the results of email analysis
  const handleAnalysisResults = (results: any) => {
    // Update the component state with analysis results
    if (results.intent) {
      setEmailIntent(results.intent);
    }

    if (results.leads && results.leads.length > 0) {
      setDetectedLeads(results.leads);
    }

    if (results.tasks && results.tasks.length > 0) {
      setDetectedTasks(results.tasks);
    }

    if (results.events && results.events.length > 0) {
      setDetectedEvents(results.events);
    }

    // Change to insights tab if there's meaningful data
    if (results.leads?.length > 0 || results.tasks?.length > 0 || results.events?.length > 0) {
      setCurrentTab('insight');
    }

    toast({
      title: 'Email Analysis Complete',
      description: 'AI has analyzed the email and extracted key information',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  // Simulate analyzing an email when replying
  const simulateEmailAnalysis = () => {
    setIsAnalyzingEmail(true);

    // This would be replaced with an actual call to the automation service
    emailAutomationService
      .processEmail(sectionParams?.replyTo || 'unknown', 'current-user-id', 'current-workspace-id')
      .then(() => {
        // Simulate API call to analyze email
        setTimeout(() => {
          // Set email context
          setEmailContext({
            previousEmails: [
              'RE: Product Roadmap Discussion',
              'Meeting Summary: Q2 Planning',
              'Partnership Opportunity Follow-up',
            ],
            contactInfo: {
              name: 'Sarah Johnson',
              company: 'Acme Corp',
              role: 'CTO',
              lastContact: '2 weeks ago',
            },
            meetingHistory: [
              { title: 'Product Demo', date: '2025-04-28' },
              { title: 'Quarterly Review', date: '2025-03-15' },
            ],
          });

          // Set intent
          setEmailIntent({
            type: 'Partnership Inquiry',
            confidence: 0.89,
            description:
              'This email appears to be an inquiry about a potential business partnership.',
          });

          // Set detected lead
          setDetectedLeads([
            {
              name: 'Sarah Johnson',
              company: 'Acme Corp',
              email: 'sarah.johnson@acmecorp.com',
              position: 'Chief Technology Officer',
              detectedIn: 'Email signature',
              confidence: 0.95,
            },
          ]);

          // Set tasks
          setDetectedTasks([
            {
              title: 'Schedule follow-up meeting to discuss partnership details',
              dueDate: '2025-05-20',
              priority: 'HIGH',
            },
            {
              title: 'Prepare partnership proposal document',
              dueDate: '2025-05-25',
              priority: 'MEDIUM',
            },
          ]);

          // Set events
          setDetectedEvents([
            {
              title: 'Partnership Discussion Call',
              startTime: '2025-05-18T14:00:00',
              location: 'Virtual (Zoom)',
              attendees: 4,
            },
          ]);

          // Set recipients
          setSuggestedRecipients(['sarah.johnson@acmecorp.com', 'tech-team@acmecorp.com']);

          // Set suggested subjects
          setSuggestedSubjects([
            'RE: Partnership Opportunity - Next Steps',
            'Partnership Proposal and Meeting Request',
            'Follow-up on our Partnership Discussion',
          ]);

          // If urgent, mark for attention
          if (Math.random() > 0.7) {
            setEmailRequiresAttention(true);
            setAttentionReason(
              'High priority partnership opportunity requiring immediate response'
            );
          }

          setIsAnalyzingEmail(false);

          toast({
            title: 'Email Analysis Complete',
            description: 'AI has analyzed the email and extracted key information',
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          });
        }, 2000);
      })
      .catch(error => {
        console.error('Error analyzing email:', error);
        setIsAnalyzingEmail(false);

        toast({
          title: 'Analysis Failed',
          description: 'There was an error analyzing the email',
          variant: 'destructive',
        });
      });
  };

  // Handle AI agent selection
  const handleAgentSelect = (agentId: string | null, teamId: string | null) => {
    // Check if AI assist is enabled before proceeding
    if (!settings.emailAnalysisEnabled) {
      toast({
        title: 'AI Assistant Disabled',
        description: 'Enable AI email processing in settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    setSelectedAgent(agentId);
    setSelectedTeam(teamId);

    toast({
      title: 'AI Assistant Connected',
      description: 'Your AI assistant is ready to help with your email',
      icon: <Bot className="h-4 w-4 text-green-500" />,
    });

    // Simulate loading context
    setTimeout(() => {
      setEmailContext({
        previousEmails: [
          'RE: Quarterly Review Meeting - March 2025',
          'Product Roadmap Updates - April 2025',
          'Follow-up on Customer Feedback Implementation',
        ],
        contactInfo: {
          company: 'Acme Corp',
          role: 'CTO',
          lastContact: '2 weeks ago',
        },
        meetingHistory: [
          { title: 'Product Demo', date: '2025-04-28' },
          { title: 'Quarterly Review', date: '2025-03-15' },
        ],
      });

      // Simulate generating initial suggestions
      generateSuggestions();
    }, 1500);
  };

  // Handle AI task execution
  const handleExecuteTask = (taskType: string) => {
    // Check if AI feature is enabled
    if (!settings.emailAnalysisEnabled) {
      toast({
        title: 'AI Assistant Disabled',
        description: 'Enable AI email processing in settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    switch (taskType) {
      case 'Generate Email':
        generateFullEmail();
        break;
      case 'Suggest Subject Lines':
        generateSubjectSuggestions();
        break;
      case 'Suggest Recipients':
        generateRecipientSuggestions();
        break;
      case 'Improve Writing':
        improveWriting();
        break;
      case 'Analyze Intent':
        analyzeEmailIntent();
        break;
      case 'Extract Tasks':
        extractTasksFromEmail();
        break;
      case 'Detect Leads':
        detectLeadsInEmail();
        break;
      case 'Extract Events':
        extractEventsFromEmail();
        break;
      default:
        toast({
          title: 'Running Task',
          description: `Executing ${taskType}...`,
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });
    }
  };

  // Generate AI suggestions for email components
  const generateSuggestions = () => {
    // Check if email analysis is enabled
    if (!settings.emailAnalysisEnabled) return;

    const suggestions: AISuggestion[] = [
      {
        id: '1',
        type: 'subject',
        content: 'Follow-up on our recent product discussion',
      },
      {
        id: '2',
        type: 'subject',
        content: 'Next steps for the Q2 roadmap implementation',
      },
      {
        id: '3',
        type: 'content',
        content:
          'I hope this email finds you well. I wanted to follow up on our conversation about the product roadmap and provide some additional information as requested.',
      },
      {
        id: '4',
        type: 'recipient',
        content: 'sarah.johnson@acmecorp.com',
      },
      {
        id: '5',
        type: 'recipient',
        content: 'tech-team@acmecorp.com',
      },
    ];

    setAiSuggestions(suggestions);

    // Also set suggested recipients and subjects for the quick-add UI
    setSuggestedRecipients([
      'sarah.johnson@acmecorp.com',
      'tech-team@acmecorp.com',
      'david.smith@acmecorp.com',
    ]);
    setSuggestedSubjects([
      'Follow-up on our recent product discussion',
      'Next steps for the Q2 roadmap implementation',
      'Product roadmap clarification',
    ]);
  };

  // Generate a full email draft
  const generateFullEmail = () => {
    // Check if AI is enabled
    if (!settings.emailAnalysisEnabled) {
      toast({
        title: 'AI Feature Disabled',
        description: 'Enable AI email processing in settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingContent(true);

    // This would use the email automation service in a real implementation
    emailAutomationService
      .generateResponse(emailId, 'current-user-id', 'current-workspace-id')
      .then(response => {
        if (response) {
          setSubject('Product Roadmap Follow-up and Next Steps');
          setMessage(response);
        } else {
          toast({
            title: 'Generation Failed',
            description: 'Could not generate email content',
            variant: 'destructive',
          });
        }
        setIsGeneratingContent(false);
      })
      .catch(error => {
        console.error('Error generating email:', error);
        setIsGeneratingContent(false);

        toast({
          title: 'Generation Failed',
          description: 'There was an error generating email content',
          variant: 'destructive',
        });
      });

    // Simulate AI generation time
    setTimeout(() => {
      const generatedSubject = 'Product Roadmap Follow-up and Next Steps';
      const generatedContent = `Hi Sarah,

I hope this email finds you well. I wanted to follow up on our discussion about the product roadmap from our meeting last week.

As we discussed, we're planning to launch the following features in Q2:
1. Enhanced user authentication system
2. Improved dashboard analytics
3. Mobile app integration with the CRM

Our team has already started working on the authentication system, and we're on track to deliver it by mid-quarter. I've attached the latest specifications document for your reference.

Could we schedule a brief call next week to go over the implementation details? I'm available on Monday or Tuesday afternoon.

Let me know what works best for you.

Thanks,`;

      setSubject(generatedSubject);
      setMessage(generatedContent);
      setIsGeneratingContent(false);

      toast({
        title: 'Email Generated',
        description: 'AI has drafted an email based on your context',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    }, 2000);
  };

  // Generate subject line suggestions
  const generateSubjectSuggestions = () => {
    // Check if AI is enabled
    if (!settings.emailAnalysisEnabled) return;

    setIsGeneratingContent(true);

    // Simulate AI generation time
    setTimeout(() => {
      setSuggestedSubjects([
        'Product Roadmap Follow-up and Next Steps',
        'Action Required: Q2 Feature Implementation Timeline',
        'Updates on Our Product Development Discussion',
        'Continuing Our Product Strategy Conversation',
      ]);

      setIsGeneratingContent(false);
      toast({
        title: 'Subjects Generated',
        description: 'New subject line suggestions are available',
        icon: <MessageCircle className="h-4 w-4 text-green-500" />,
      });
    }, 1500);
  };

  // Generate recipient suggestions
  const generateRecipientSuggestions = () => {
    // Check if AI is enabled
    if (!settings.emailAnalysisEnabled) return;

    setIsGeneratingContent(true);

    // Simulate AI generation time
    setTimeout(() => {
      setSuggestedRecipients([
        'sarah.johnson@acmecorp.com',
        'tech-team@acmecorp.com',
        'david.smith@acmecorp.com',
        'product@yourcompany.com',
        'mike.wilson@acmecorp.com',
      ]);

      setIsGeneratingContent(false);

      toast({
        title: 'Recipients Suggested',
        description: 'AI has suggested relevant recipients based on context',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    }, 1500);
  };

  // Improve existing writing
  const improveWriting = () => {
    // Check if AI is enabled
    if (!settings.emailAnalysisEnabled) {
      toast({
        title: 'AI Feature Disabled',
        description: 'Enable AI email processing in settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Empty Content',
        description: 'Please write some content first before improving',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingContent(true);

    // In a real implementation, this would use the email automation service
    emailAutomationService
      .generateResponse(emailId, 'current-user-id', 'current-workspace-id')
      .then(response => {
        if (response) {
          setMessage(response);
        } else {
          toast({
            title: 'Improvement Failed',
            description: 'Could not improve email content',
            variant: 'destructive',
          });
        }
        setIsGeneratingContent(false);
      })
      .catch(error => {
        console.error('Error improving content:', error);
        setIsGeneratingContent(false);

        toast({
          title: 'Improvement Failed',
          description: 'There was an error improving your content',
          variant: 'destructive',
        });
      });

    // Simulate AI improvement
    setTimeout(() => {
      const improvedMessage = message
        .replace(/I think/g, 'I believe')
        .replace(/maybe/g, 'potentially')
        .replace(/good/g, 'excellent')
        .replace(/problem/g, 'challenge');

      // If the message is very short, replace it with something more substantial
      const enhancedMessage =
        message.length < 50
          ? `I hope this email finds you well.\n\n${improvedMessage}\n\nLooking forward to your thoughts on this matter.\n\nBest regards,`
          : improvedMessage;

      setMessage(enhancedMessage);
      setIsGeneratingContent(false);

      toast({
        title: 'Writing Improved',
        description: 'Your email has been enhanced for clarity and professionalism',
        icon: <Wand2 className="h-4 w-4 text-green-500" />,
      });
    }, 2000);
  };

  // Analyze email intent
  const analyzeEmailIntent = () => {
    // Check if AI is enabled
    if (!settings.emailAnalysisEnabled) {
      toast({
        title: 'AI Feature Disabled',
        description: 'Enable AI email processing in settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Empty Content',
        description: 'Please write some content first before analyzing intent',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingContent(true);

    // Simulate AI intent analysis
    setTimeout(() => {
      const intents = [
        'Partnership Request',
        'Sales Inquiry',
        'Support Request',
        'Information Request',
        'Follow-up',
        'Introduction',
      ];

      const randomIntent = intents[Math.floor(Math.random() * intents.length)];

      setEmailIntent({
        type: randomIntent,
        confidence: 0.75 + Math.random() * 0.2,
        description: `This email appears to be a ${randomIntent.toLowerCase()}.`,
      });

      setIsGeneratingContent(false);
      setCurrentTab('insight');

      toast({
        title: 'Intent Analyzed',
        description: `Email intent detected: ${randomIntent}`,
        icon: <BrainCircuit className="h-4 w-4 text-purple-500" />,
      });
    }, 1500);
  };

  // Extract tasks from email
  const extractTasksFromEmail = () => {
    // Check if AI and task extraction are enabled
    if (!settings.emailAnalysisEnabled || !settings.taskExtractionEnabled) {
      toast({
        title: 'Feature Disabled',
        description: 'Enable task extraction in automation settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Empty Content',
        description: 'Please write some content first before extracting tasks',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingContent(true);

    // Simulate AI task extraction
    setTimeout(() => {
      setDetectedTasks([
        {
          title: 'Send product specifications document',
          dueDate: '2025-05-22',
          priority: 'MEDIUM',
        },
        {
          title: 'Schedule follow-up meeting about roadmap',
          dueDate: '2025-05-18',
          priority: 'HIGH',
        },
      ]);

      setIsGeneratingContent(false);
      setCurrentTab('insight');

      toast({
        title: 'Tasks Extracted',
        description: '2 tasks have been identified in your email',
        icon: <ListTodo className="h-4 w-4 text-blue-500" />,
      });
    }, 1500);
  };

  // Detect leads in email
  const detectLeadsInEmail = () => {
    // Check if AI and lead detection are enabled
    if (!settings.emailAnalysisEnabled || !settings.leadDetectionEnabled) {
      toast({
        title: 'Feature Disabled',
        description: 'Enable lead detection in automation settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Empty Content',
        description: 'Please write some content first before detecting leads',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingContent(true);

    // Simulate AI lead detection
    setTimeout(() => {
      setDetectedLeads([
        {
          name: 'Alex Thompson',
          company: 'TechSolutions Inc.',
          email: 'alex.thompson@techsolutions.com',
          position: 'Product Manager',
          detectedIn: 'Email signature',
          confidence: 0.92,
        },
      ]);

      setIsGeneratingContent(false);
      setCurrentTab('insight');

      toast({
        title: 'Lead Detected',
        description: '1 potential lead has been identified',
        icon: <UserPlus className="h-4 w-4 text-green-500" />,
      });
    }, 1500);
  };

  // Extract events from email
  const extractEventsFromEmail = () => {
    // Check if AI and event detection are enabled
    if (!settings.emailAnalysisEnabled || !settings.eventDetectionEnabled) {
      toast({
        title: 'Feature Disabled',
        description: 'Enable event detection in automation settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Empty Content',
        description: 'Please write some content first before extracting events',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingContent(true);

    // Simulate AI event extraction
    setTimeout(() => {
      setDetectedEvents([
        {
          title: 'Product Roadmap Discussion',
          startTime: '2025-05-20T15:00:00',
          location: 'Virtual Meeting',
          attendees: 5,
        },
      ]);

      setIsGeneratingContent(false);
      setCurrentTab('insight');

      toast({
        title: 'Event Extracted',
        description: '1 event has been identified in your email',
        icon: <CalendarDate className="h-4 w-4 text-indigo-500" />,
      });
    }, 1500);
  };

  // Create lead from email analysis
  const handleCreateLead = () => {
    if (!selectedLead) return;

    // Check if lead detection is enabled
    if (!settings.leadDetectionEnabled) {
      toast({
        title: 'Feature Disabled',
        description: 'Enable lead detection in automation settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingContent(true);

    // Simulate API call to create lead
    setTimeout(() => {
      setIsGeneratingContent(false);
      setShowLeadDialog(false);

      toast({
        title: 'Lead Created',
        description: `New lead created: ${selectedLead.name} from ${
          selectedLead.company || 'Unknown'
        }`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    }, 1000);
  };

  // Handle adding a task to the system
  const handleAddTask = (task: EmailTask) => {
    toast({
      title: 'Task Added',
      description: `"${task.title}" has been added to your tasks`,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  // Handle adding an event to the calendar
  const handleAddEvent = (event: EmailEvent) => {
    toast({
      title: 'Event Added',
      description: `"${event.title}" has been added to your calendar`,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  const handleAddRecipient = () => {
    if (
      currentRecipient &&
      !recipients.some(r => r.email === currentRecipient && r.type === currentRecipientType)
    ) {
      setRecipients([...recipients, { email: currentRecipient, type: currentRecipientType }]);
      setCurrentRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string, type: 'to' | 'cc' | 'bcc') => {
    setRecipients(recipients.filter(r => !(r.email === email && r.type === type)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        // Generate a unique ID
        const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Determine file size
        const size =
          file.size < 1024
            ? `${file.size} B`
            : file.size < 1048576
            ? `${(file.size / 1024).toFixed(1)} KB`
            : `${(file.size / 1048576).toFixed(1)} MB`;

        // Create preview for images
        let preview: string | undefined = undefined;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        }

        setAttachments(prev => [
          ...prev,
          {
            id,
            name: file.name,
            size,
            type: file.type,
            preview,
          },
        ]);
      });
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    // Revoke object URL if it's an image preview
    const attachment = attachments.find(a => a.id === id);
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }

    setAttachments(attachments.filter(a => a.id !== id));
  };

  const simulateAutoSave = React.useCallback(() => {
    if (subject || message || recipients.length > 0) {
      setIsAutosaving(true);
      setTimeout(() => {
        setIsAutosaving(false);
        setLastSaved(new Date());
      }, 1000);
    }
  }, [subject, message, recipients]);

  // Auto-save every 30 seconds if there are changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      simulateAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [simulateAutoSave]);

  const handleSaveAsDraft = () => {
    simulateAutoSave();
    toast({
      title: 'Draft Saved',
      description: 'Your email has been saved as a draft',
      icon: <Save className="h-4 w-4" />,
    });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Go back to inbox
    setIsSending(false);

    toast({
      title: 'Email Sent',
      description: 'Your email has been sent successfully',
      icon: <Send className="h-4 w-4 text-green-500" />,
    });

    changeSection('mail-inbox');
  };

  const handleDiscard = () => {
    // Confirm before discarding if there's content
    if (subject || message || recipients.length > 0 || attachments.length > 0) {
      if (window.confirm('Are you sure you want to discard this email?')) {
        changeSection('mail-inbox');
      }
    } else {
      changeSection('mail-inbox');
    }
  };

  const filteredRecipients = (type: 'to' | 'cc' | 'bcc') => {
    return recipients.filter(r => r.type === type);
  };

  const handleToggleSignature = () => {
    setUseSignature(!useSignature);
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    switch (suggestion.type) {
      case 'subject':
        setSubject(suggestion.content);
        break;
      case 'content':
        // Append the suggested content to the current message
        setMessage(prevMessage => {
          if (!prevMessage.trim()) return suggestion.content;
          return `${prevMessage}\n\n${suggestion.content}`;
        });
        break;
      case 'recipient':
        if (!recipients.some(r => r.email === suggestion.content)) {
          setRecipients([...recipients, { email: suggestion.content, type: 'to' }]);
        }
        break;
    }

    // Remove the suggestion after using it
    setAiSuggestions(aiSuggestions.filter(s => s.id !== suggestion.id));

    toast({
      title: 'Suggestion Applied',
      description: `The ${suggestion.type} suggestion has been applied`,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  // Handle rewriting email with different tone
  const handleRewriteWithTone = (tone: string) => {
    // Check if AI is enabled
    if (!settings.emailAnalysisEnabled) {
      toast({
        title: 'AI Feature Disabled',
        description: 'Enable AI email processing in settings to use this feature',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Empty Content',
        description: 'Please write some content first before rewriting',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingContent(true);
    setSelectedTone(tone);

    // Simulate AI rewriting
    setTimeout(() => {
      let rewrittenMessage = message;

      switch (tone) {
        case 'professional':
          rewrittenMessage = `I hope this email finds you well.\n\nI wanted to follow up on our recent discussion regarding the product roadmap. Our team has made significant progress on the items we discussed, and I believe we're on track to meet our quarterly objectives.\n\nPlease let me know if you have any questions or would like to schedule a call to discuss further details.\n\nBest regards,`;
          break;
        case 'friendly':
          rewrittenMessage = `Hey there!\n\nJust wanted to touch base about our product roadmap chat from last week. We've been making some great progress, and things are looking good for hitting our targets this quarter!\n\nLet me know if you want to hop on a quick call to chat through anything. Always happy to discuss!\n\nCheers,`;
          break;
        case 'formal':
          rewrittenMessage = `Dear Ms. Johnson,\n\nI am writing to provide a status update regarding our previously discussed product roadmap. Our development team has made substantial progress on the outlined deliverables, and we anticipate successful completion by the end of the quarter.\n\nShould you require any clarification or wish to schedule a formal review meeting, please do not hesitate to contact me.\n\nYours sincerely,`;
          break;
        case 'persuasive':
          rewrittenMessage = `I wanted to highlight the exceptional progress our team has made on the product roadmap we discussed.\n\nThe enhancements we're implementing will significantly improve user experience while reducing operational costs. Early testing shows a 35% improvement in system performance.\n\nI believe these results demonstrate the value of our approach. Would you be available this week for a brief demonstration of these impressive improvements?\n\nLooking forward to your response,`;
          break;
      }

      setMessage(rewrittenMessage);
      setIsGeneratingContent(false);
      setShowRewriteOptions(false);

      toast({
        title: 'Email Rewritten',
        description: `Your email has been rewritten with a ${tone} tone`,
        icon: <Wand2 className="h-4 w-4 text-indigo-500" />,
      });
    }, 2000);
  };

  // Determine if AI features should be shown based on settings
  const showAIFeatures = settings.emailAnalysisEnabled;

  return (
    <div className="p-6 space-y-6">
      {/* Show the automation status bar at the top */}
      <AutomationStatusBar />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Compose Email</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            {isAutosaving ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Saving...
              </span>
            ) : lastSaved ? (
              <span>Last saved at {format(lastSaved, 'h:mm a')}</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main content area with email form and AI panel */}
      <div className={`grid ${showAIFeatures ? 'grid-cols-3 gap-6' : 'grid-cols-1'}`}>
        {/* Email Composition Card */}
        <Card className={showAIFeatures ? 'col-span-2' : 'col-span-1'}>
          <CardHeader className="pb-3">
            <Tabs
              defaultValue="compose"
              value={currentTab}
              onValueChange={setCurrentTab}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-2">
                <TabsList>
                  <TabsTrigger value="compose" className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Compose</span>
                  </TabsTrigger>
                  <TabsTrigger value="insight" className="flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>Insights</span>
                    {(detectedLeads.length > 0 ||
                      detectedTasks.length > 0 ||
                      detectedEvents.length > 0) && (
                      <Badge
                        variant="outline"
                        className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {detectedLeads.length + detectedTasks.length + detectedEvents.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {emailRequiresAttention && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Attention Required</span>
                  </Badge>
                )}
              </div>
            </Tabs>
          </CardHeader>

          <TabsContent value="compose" className="m-0">
            <form onSubmit={handleSendEmail}>
              <CardContent className="space-y-4">
                {/* TO Recipients */}
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md">
                    {filteredRecipients('to').map((recipient, index) => (
                      <div
                        key={`to-${index}`}
                        className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                      >
                        <span>{recipient.email}</span>
                        <button
                          type="button"
                          className="ml-1 text-primary/70 hover:text-primary"
                          onClick={() => handleRemoveRecipient(recipient.email, 'to')}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <Input
                      id="to"
                      value={currentRecipientType === 'to' ? currentRecipient : ''}
                      onChange={e => {
                        setCurrentRecipient(e.target.value);
                        setCurrentRecipientType('to');
                      }}
                      onKeyDown={handleKeyDown}
                      onBlur={() => {
                        if (currentRecipientType === 'to') handleAddRecipient();
                      }}
                      className="flex-1 min-w-[150px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Enter email addresses..."
                    />
                  </div>

                  {/* AI-Suggested Recipients */}
                  {showAIFeatures && suggestedRecipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Suggested:</span>
                      {suggestedRecipients.slice(0, 3).map((email, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
                          onClick={() => {
                            if (!recipients.some(r => r.email === email)) {
                              setRecipients([...recipients, { email, type: 'to' }]);
                              // Remove from suggestions
                              setSuggestedRecipients(suggestedRecipients.filter(r => r !== email));
                            }
                          }}
                        >
                          <Sparkles className="h-3 w-3 text-primary/70" />
                          {email}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* CC Recipients */}
                {showCc && (
                  <div className="space-y-2">
                    <Label htmlFor="cc">CC</Label>
                    <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md">
                      {filteredRecipients('cc').map((recipient, index) => (
                        <div
                          key={`cc-${index}`}
                          className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                        >
                          <span>{recipient.email}</span>
                          <button
                            type="button"
                            className="ml-1 text-primary/70 hover:text-primary"
                            onClick={() => handleRemoveRecipient(recipient.email, 'cc')}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <Input
                        id="cc"
                        value={currentRecipientType === 'cc' ? currentRecipient : ''}
                        onChange={e => {
                          setCurrentRecipient(e.target.value);
                          setCurrentRecipientType('cc');
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                          if (currentRecipientType === 'cc') handleAddRecipient();
                        }}
                        className="flex-1 min-w-[150px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="CC email addresses..."
                      />
                    </div>
                  </div>
                )}

                {/* BCC Recipients */}
                {showBcc && (
                  <div className="space-y-2">
                    <Label htmlFor="bcc">BCC</Label>
                    <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md">
                      {filteredRecipients('bcc').map((recipient, index) => (
                        <div
                          key={`bcc-${index}`}
                          className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                        >
                          <span>{recipient.email}</span>
                          <button
                            type="button"
                            className="ml-1 text-primary/70 hover:text-primary"
                            onClick={() => handleRemoveRecipient(recipient.email, 'bcc')}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <Input
                        id="bcc"
                        value={currentRecipientType === 'bcc' ? currentRecipient : ''}
                        onChange={e => {
                          setCurrentRecipient(e.target.value);
                          setCurrentRecipientType('bcc');
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                          if (currentRecipientType === 'bcc') handleAddRecipient();
                        }}
                        className="flex-1 min-w-[150px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="BCC email addresses..."
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter subject..."
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />

                  {/* AI-Suggested Subject Lines */}
                  {showAIFeatures && suggestedSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Suggested:</span>
                      {suggestedSubjects.slice(0, 2).map((subj, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
                          onClick={() => {
                            setSubject(subj);
                            // Remove from suggestions
                            setSuggestedSubjects(suggestedSubjects.filter(s => s !== subj));
                          }}
                        >
                          <Sparkles className="h-3 w-3 text-primary/70" />
                          {subj.length > 40 ? subj.substring(0, 40) + '...' : subj}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced with AI Action buttons from automation components */}
                {settings.emailAnalysisEnabled && !isLoadingSettings && (
                  <div className="flex flex-wrap gap-2">
                    <EmailAIActions
                      emailId={emailId}
                      userId="current-user-id"
                      workspaceId="current-workspace-id"
                    />

                    {/* Additional AI options */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={improveWriting}
                      disabled={
                        isGeneratingContent || !message.trim() || !settings.emailAnalysisEnabled
                      }
                      className="flex items-center gap-1"
                    >
                      <Wand2 className="h-3 w-3 text-primary" />
                      Improve Writing
                    </Button>

                    <Popover open={showRewriteOptions} onOpenChange={setShowRewriteOptions}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            isGeneratingContent || !message.trim() || !settings.emailAnalysisEnabled
                          }
                          className="flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3 text-primary" />
                          <span>Change Tone</span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-0" align="start">
                        <div className="p-2 border-b">
                          <p className="text-sm font-medium">Select Tone</p>
                        </div>
                        <div className="p-0">
                          {['professional', 'friendly', 'formal', 'persuasive'].map(tone => (
                            <Button
                              key={tone}
                              variant="ghost"
                              className="w-full justify-start rounded-none text-sm capitalize"
                              onClick={() => handleRewriteWithTone(tone)}
                            >
                              <span>{tone}</span>
                              {selectedTone === tone && (
                                <CheckCircle className="h-3 w-3 ml-auto text-green-500" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Advanced Options Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="flex items-center gap-1 ml-auto"
                    >
                      {showAdvancedOptions ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <Settings className="h-3 w-3" />
                      )}
                      {!showAdvancedOptions && <span>More Options</span>}
                    </Button>
                  </div>
                )}

                {/* Additional AI Options */}
                {showAIFeatures && showAdvancedOptions && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={analyzeEmailIntent}
                      disabled={
                        isGeneratingContent || !message.trim() || !settings.emailAnalysisEnabled
                      }
                      className="flex items-center gap-1"
                    >
                      <BrainCircuit className="h-3 w-3 text-purple-500" />
                      Analyze Intent
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={extractTasksFromEmail}
                      disabled={
                        isGeneratingContent || !message.trim() || !settings.taskExtractionEnabled
                      }
                      className="flex items-center gap-1"
                    >
                      <ListTodo className="h-3 w-3 text-blue-500" />
                      Extract Tasks
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={detectLeadsInEmail}
                      disabled={
                        isGeneratingContent || !message.trim() || !settings.leadDetectionEnabled
                      }
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="h-3 w-3 text-green-500" />
                      Detect Leads
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={extractEventsFromEmail}
                      disabled={
                        isGeneratingContent || !message.trim() || !settings.eventDetectionEnabled
                      }
                      className="flex items-center gap-1"
                    >
                      <CalendarDate className="h-3 w-3 text-indigo-500" />
                      Extract Events
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <div className="relative">
                    <Textarea
                      id="message"
                      placeholder={
                        showAIFeatures
                          ? 'Write your message or use AI to generate content...'
                          : 'Write your message here...'
                      }
                      className="min-h-[200px]"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />

                    {/* AI generation overlay */}
                    {isGeneratingContent && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="text-sm font-medium">Generating content...</span>
                        </div>
                      </div>
                    )}

                    {/* Email analysis overlay */}
                    {isAnalyzingEmail && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                        <div className="flex flex-col items-center gap-2">
                          <BrainCircuit className="h-8 w-8 animate-pulse text-purple-500" />
                          <span className="text-sm font-medium">Analyzing email context...</span>
                          <span className="text-xs text-muted-foreground">
                            Extracting information to help your response
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {useSignature && (
                    <div className="mt-2 pt-2 border-t text-sm text-muted-foreground whitespace-pre-line">
                      --
                      {signature}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="use-signature" className="text-sm cursor-pointer">
                      Include signature
                    </Label>
                    <Switch
                      id="use-signature"
                      checked={useSignature}
                      onCheckedChange={handleToggleSignature}
                    />
                  </div>
                </div>

                {/* Scheduled Sending */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="schedule-email"
                    checked={isScheduled}
                    onCheckedChange={setIsScheduled}
                  />
                  <Label htmlFor="schedule-email">Schedule for later</Label>

                  {isScheduled && (
                    <div className="flex items-center ml-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-8 gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={scheduleDate}
                            onSelect={setScheduleDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Select>
                        <SelectTrigger className="h-8 ml-2 w-24">
                          <SelectValue placeholder="Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0900">9:00 AM</SelectItem>
                          <SelectItem value="1000">10:00 AM</SelectItem>
                          <SelectItem value="1100">11:00 AM</SelectItem>
                          <SelectItem value="1200">12:00 PM</SelectItem>
                          <SelectItem value="1300">1:00 PM</SelectItem>
                          <SelectItem value="1400">2:00 PM</SelectItem>
                          <SelectItem value="1500">3:00 PM</SelectItem>
                          <SelectItem value="1600">4:00 PM</SelectItem>
                          <SelectItem value="1700">5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Attachments {attachments.length > 0 && `(${attachments.length})`}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FilePlus className="h-4 w-4 mr-2" />
                            Add Files
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Maximum file size: 25MB</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAddAttachment}
                      className="hidden"
                      multiple
                    />
                  </div>

                  {attachments.length > 0 && (
                    <ScrollArea className="h-40 w-full rounded-md border">
                      <div className="p-4 grid grid-cols-2 gap-4">
                        {attachments.map(attachment => (
                          <div
                            key={attachment.id}
                            className="flex items-start space-x-3 p-2 border rounded-md"
                          >
                            <div className="h-12 w-12 flex-shrink-0 rounded-md border overflow-hidden flex items-center justify-center bg-muted">
                              {attachment.preview ? (
                                <img
                                  src={attachment.preview}
                                  alt={attachment.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <File className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{attachment.size}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveAttachment(attachment.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="ghost" onClick={handleDiscard}>
                  Discard
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleSaveAsDraft}>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button type="submit" disabled={isSending} className="gap-2">
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : isScheduled ? (
                      <>
                        <Clock className="h-4 w-4" />
                        Schedule
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="insight" className="m-0">
            <CardContent className="space-y-6">
              {emailRequiresAttention && (
                <div className="p-3 border border-destructive/50 bg-destructive/10 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h3 className="font-medium">Attention Required</h3>
                  </div>
                  <p className="text-sm">{attentionReason}</p>
                </div>
              )}

              {emailIntent && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-purple-500" />
                    Detected Intent
                  </h3>
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-purple-500/10">
                        {emailIntent.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(emailIntent.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{emailIntent.description}</p>
                  </div>
                </div>
              )}

              {detectedLeads.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-green-500" />
                    Detected Leads
                  </h3>
                  {detectedLeads.map((lead, idx) => (
                    <div key={idx} className="rounded-md border p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.company}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(lead.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div className="text-sm grid grid-cols-2 gap-2">
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{lead.email}</span>
                        </p>
                        {lead.position && (
                          <p className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            <span>{lead.position}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowLeadDialog(true);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleCreateLead()}
                          disabled={!settings.leadDetectionEnabled}
                        >
                          Create Lead
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detectedTasks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-blue-500" />
                    Detected Tasks
                  </h3>
                  {detectedTasks.map((task, idx) => (
                    <div key={idx} className="rounded-md border p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{task.title}</p>
                        <Badge
                          variant={
                            task.priority === 'URGENT'
                              ? 'destructive'
                              : task.priority === 'HIGH'
                              ? 'destructive'
                              : task.priority === 'MEDIUM'
                              ? 'default'
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.dueDate && (
                        <p className="text-sm flex items-center gap-1 text-muted-foreground">
                          <CalendarDate className="h-3 w-3" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </p>
                      )}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleAddTask(task)}
                          disabled={!settings.taskExtractionEnabled}
                        >
                          Add Task
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detectedEvents.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <CalendarDate className="h-4 w-4 text-indigo-500" />
                    Detected Events
                  </h3>
                  {detectedEvents.map((event, idx) => (
                    <div key={idx} className="rounded-md border p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{event.title}</p>
                        {event.attendees && event.attendees > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {event.attendees} attendees
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm grid grid-cols-2 gap-2">
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(event.startTime).toLocaleString()}</span>
                        </p>
                        {event.location && (
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => handleAddEvent(event)}
                          disabled={!settings.eventDetectionEnabled}
                        >
                          Add to Calendar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!emailIntent &&
                detectedLeads.length === 0 &&
                detectedTasks.length === 0 &&
                detectedEvents.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">No insights yet</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                      Write or generate your email content, then use the AI tools to analyze it and
                      extract insights.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab('compose')}
                    >
                      Return to Compose
                    </Button>
                  </div>
                )}
            </CardContent>

            <CardFooter className="justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentTab('compose')}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View Email
              </Button>
            </CardFooter>
          </TabsContent>
        </Card>

        {/* AI Assistance Panel - only show if AI is enabled */}
        {showAIFeatures && (
          <div className="col-span-1 space-y-4">
            {/* Agent Selector */}
            <ModuleAgentSelector
              moduleType="email"
              onAgentSelect={handleAgentSelect}
              onExecuteTask={handleExecuteTask}
              workspaceId="workspace-1" // Would come from context in a real app
            />

            {/* Email Context Card */}
            {emailContext && Object.keys(emailContext).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Email Context</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        toast({
                          title: 'Context Refreshed',
                          description: 'Email context has been updated with latest information',
                          icon: <RefreshCw className="h-4 w-4" />,
                        });
                      }}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {emailContext.previousEmails && emailContext.previousEmails.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Previous Conversations
                      </p>
                      <ul className="space-y-1">
                        {emailContext.previousEmails.map((email, idx) => (
                          <li key={idx} className="text-xs truncate">
                            {email}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {emailContext.contactInfo && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Contact Details
                      </p>
                      <div className="text-xs">
                        {emailContext.contactInfo.name && (
                          <p>Name: {emailContext.contactInfo.name}</p>
                        )}
                        <p>Company: {emailContext.contactInfo.company}</p>
                        <p>Role: {emailContext.contactInfo.role}</p>
                        <p>Last Contact: {emailContext.contactInfo.lastContact}</p>
                      </div>
                    </div>
                  )}

                  {emailContext.meetingHistory && emailContext.meetingHistory.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Recent Meetings
                      </p>
                      <ul className="space-y-1">
                        {emailContext.meetingHistory.map((meeting, idx) => (
                          <li key={idx} className="text-xs">
                            {meeting.title} ({new Date(meeting.date).toLocaleDateString()})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Suggestions Card */}
            {aiSuggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiSuggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      className="border rounded-md p-3 text-sm space-y-2 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleApplySuggestion(suggestion)}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs line-clamp-3">{suggestion.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs w-full justify-center"
                        onClick={e => {
                          e.stopPropagation();
                          handleApplySuggestion(suggestion);
                        }}
                      >
                        Apply suggestion
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Email Analytics Card (conditionally shown) */}
            {emailIntent && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Email Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Intent</span>
                    <Badge variant="outline" className="bg-purple-500/10">
                      {emailIntent.type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Leads</span>
                    <Badge variant="outline" className="bg-green-500/10">
                      {detectedLeads.length}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Tasks</span>
                    <Badge variant="outline" className="bg-blue-500/10">
                      {detectedTasks.length}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Events</span>
                    <Badge variant="outline" className="bg-indigo-500/10">
                      {detectedEvents.length}
                    </Badge>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setCurrentTab('insight')}
                  >
                    View All Insights
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Review and edit the detected lead information before creating
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Name</Label>
                <Input
                  id="lead-name"
                  value={selectedLead.name}
                  onChange={() => {}} // Would be implemented in a real app
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-company">Company</Label>
                <Input
                  id="lead-company"
                  value={selectedLead.company || ''}
                  onChange={() => {}} // Would be implemented in a real app
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-email">Email</Label>
                <Input
                  id="lead-email"
                  value={selectedLead.email}
                  onChange={() => {}} // Would be implemented in a real app
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-position">Position</Label>
                <Input
                  id="lead-position"
                  value={selectedLead.position || ''}
                  onChange={() => {}} // Would be implemented in a real app
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-source">Detected In</Label>
                <Input id="lead-source" value={selectedLead.detectedIn} disabled />
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="lead-confidence" className="flex-1">
                  AI Confidence
                </Label>
                <Badge variant="outline" className="text-xs">
                  {Math.round(selectedLead.confidence * 100)}%
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLead} disabled={!settings.leadDetectionEnabled}>
              Create Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// This would be added to the component but was missed in the provided code
function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
