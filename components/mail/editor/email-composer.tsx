import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Paperclip,
  X,
  Send,
  Wand2,
  Save,
  Clock,
  Calendar as CalendarIcon,
  Flag,
  ChevronDown,
  Sparkles,
  FileText,
  AlignJustify,
  ArrowLeft,
  Settings,
  BarChart,
  CheckCircle2,
  AlertCircle,
  Info,
  Lock,
  Undo,
  Loader2,
  ExternalLink,
  Search,
  Star,
  Copy,
  Languages,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import RichTextEditor from './rich-text-editor';
import RecipientAutocomplete from './recipient-autocomplete';

import EmailAnalysisPanel from './email-analysis-panel';
import { useAiSuggestions } from '@/hooks/use-ai-suggestions';
import useAutosave from '@/hooks/use-autosave';
import useKeyboardShortcuts from '@/hooks/use-keyboard-shortcuts';
import useRecipientSuggestions from '@/hooks/use-recipient-suggestions';
import useAnalytics from '@/hooks/use-analytics';
import usePermissions from '@/hooks/use-permissions';

// --------------------------
// Type Definitions
// --------------------------

/**
 * Maximum file size (10MB)
 * @constant
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed file types for attachments
 * @constant
 */
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
];

/**
 * Email validation regex (RFC 5322)
 * @constant
 */
const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Available email tones
 * @constant
 */
const EMAIL_TONES = {
  professional: 'Professional',
  friendly: 'Friendly',
  formal: 'Formal',
  casual: 'Casual',
  persuasive: 'Persuasive',
  concise: 'Concise',
} as const;

/**
 * Available email priorities
 * @constant
 */
const EMAIL_PRIORITIES = {
  high: 'High',
  normal: 'Normal',
  low: 'Low',
} as const;

/**
 * Type for a file with upload progress
 * @interface
 */
interface FileWithProgress extends File {
  id: string;
  progress: number;
  error?: string;
}

/**
 * Type for email signature
 * @interface
 */
interface EmailSignature {
  id: string;
  name: string;
  content: string;
  isDefault?: boolean;
}

/**
 * Type for email template
 * @interface
 */
interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  content: string;
  category?: string;
  tags?: string[];
  lastUsed?: Date;
}

/**
 * Type for recipient information
 * @interface
 */
interface Recipient {
  email: string;
  name?: string;
  avatarUrl?: string;
  department?: string;
  recent?: boolean;
}

/**
 * Type for email analysis result
 * @interface
 */
interface EmailAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  tone: string;
  readability: {
    score: number;
    level: 'easy' | 'medium' | 'difficult';
  };
  statistics: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    estimatedReadTime: number;
  };
  suggestions: Array<{
    type: 'improvement' | 'warning' | 'info';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  keywords: string[];
  summary: string;
}

// Helper functions for validation
/**
 * Validate a list of comma-separated email addresses
 * @param value - Comma-separated email list
 * @returns boolean indicating if all emails are valid
 */
const validateEmails = (value: string): boolean => {
  if (!value) return true;
  const emails = value.split(',').map(email => email.trim());
  return emails.every(email => EMAIL_REGEX.test(email));
};

/**
 * Validate a file against size and type constraints
 * @param file - The file to validate
 * @returns boolean indicating if file is valid
 */
const validateFile = (file: File): boolean => {
  if (file.size > MAX_FILE_SIZE) {
    return false;
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return false;
  }
  return true;
};

/**
 * Generate a unique ID
 * @returns A unique string ID
 */
const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted file size string
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Validation schema
const formSchema = z.object({
  to: z
    .string()
    .min(1, 'At least one recipient is required')
    .refine(validateEmails, 'One or more email addresses are invalid'),
  cc: z
    .string()
    .optional()
    .refine(value => !value || validateEmails(value), 'One or more CC email addresses are invalid'),
  bcc: z
    .string()
    .optional()
    .refine(
      value => !value || validateEmails(value),
      'One or more BCC email addresses are invalid'
    ),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  template: z.string().optional(),
  signature: z.string().optional(),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
  scheduled: z.boolean().default(false),
  scheduledDate: z.date().optional().nullable(),
  requestReadReceipt: z.boolean().default(false),
  saveAsDraft: z.boolean().default(false),
  confidential: z.boolean().default(false),
  tone: z
    .enum(['professional', 'friendly', 'formal', 'casual', 'persuasive', 'concise'])
    .default('professional'),
  followUpReminder: z.boolean().default(false),
  followUpDate: z.date().optional().nullable(),
  language: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Props for the EmailComposer component
 * @interface
 */
interface EmailComposerProps {
  /** Information about the email being replied to */
  replyTo?: {
    id: string;
    subject: string;
    from: string;
    to: string[];
    body?: string;
    threadId?: string;
    timestamp?: Date;
    attachments?: Array<{
      id: string;
      name: string;
      size: number;
      type: string;
      url: string;
    }>;
  };
  /** ID of the contact this email is being sent to */
  contactId?: string;
  /** Initial draft values */
  initialDraft?: Partial<FormValues>;
  /** Callback function when email is sent */
  onSend?: (data: FormValues & { attachments: File[] }) => Promise<boolean>;
  /** Callback function when email composition is canceled */
  onCancel?: () => void;
  /** Callback function when email is saved as draft */
  onSave?: (data: FormValues & { attachments: File[] }) => Promise<boolean>;
  /** Callback function to analyze email content */
  onAnalyze?: (data: FormValues) => Promise<EmailAnalysis>;
  /** Function to load available email signatures */
  loadSignatures?: () => Promise<EmailSignature[]>;
  /** Function to load available email templates */
  loadTemplates?: () => Promise<EmailTemplate[]>;
  /** Function to load recipient suggestions */
  loadRecipients?: (query: string) => Promise<Recipient[]>;
  /** Whether the email is in read-only mode */
  readOnly?: boolean;
  /** Callback when email is scheduled */
  onSchedule?: (data: FormValues & { attachments: File[] }) => Promise<boolean>;
  /** Default language for spellcheck */
  defaultLanguage?: string;
  /** Whether to show the analysis panel by default */
  showAnalysisPanel?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Maximum number of allowed attachments */
  maxAttachments?: number;
  /** Maximum total size of all attachments (in bytes) */
  maxTotalAttachmentSize?: number;
  /** Whether to enable AI suggestions */
  enableAiSuggestions?: boolean;
  /** Whether to show template selector */
  showTemplateSelector?: boolean;
}

/**
 * EmailComposer Component
 *
 * A fully-featured email composition component with support for:
 * - Recipients management (To, CC, BCC) with autocomplete
 * - Rich text editing
 * - File attachments
 * - Email templates and signatures
 * - Email scheduling
 * - AI-powered assistance
 * - Email analysis
 * - Draft auto-saving
 */
export default function EmailComposer({
  replyTo,
  contactId,
  initialDraft,
  onSend,
  onCancel,
  onSave,
  onAnalyze,
  loadSignatures,
  loadTemplates,
  loadRecipients,
  readOnly = false,
  onSchedule,
  defaultLanguage = 'en',
  showAnalysisPanel = false,
  className = '',
  maxAttachments = 10,
  maxTotalAttachmentSize = 25 * 1024 * 1024, // 25MB
  enableAiSuggestions = true,
  showTemplateSelector = true,
}: EmailComposerProps) {
  // --------------------------
  // State
  // --------------------------
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedSignature, setSelectedSignature] = useState<string>('');
  const [attachments, setAttachments] = useState<FileWithProgress[]>([]);
  const [activeTab, setActiveTab] = useState<string>('compose');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(showAnalysisPanel);
  const [analysisData, setAnalysisData] = useState<EmailAnalysis | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [signatureContent, setSignatureContent] = useState<string>('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [draftStatus, setDraftStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoadingSignatures, setIsLoadingSignatures] = useState<boolean>(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
  const [showConfidentialOptions, setShowConfidentialOptions] = useState<boolean>(false);
  const [showFollowUpOptions, setShowFollowUpOptions] = useState<boolean>(false);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<boolean>(true);
  const [replyMode] = useState<boolean>(!!replyTo);
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  cons = useMemo<Array<{ id: string; timestamp: Date; preview: string }>>(
    () => [],
    () => [],
    []
  );
  const [showKeyboardShortcutsDialog, setShowKeyboardShortcutsDialog] = useState<boolean>(false);

  // --------------------------
  // Refs
  // --------------------------
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --------------------------
  // Hooks
  // --------------------------
  // const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const { hasPermission } = usePermissions();

  // AI suggestions hook
  const {
    generateSubject,
    generateBody,
    improveTone,
    fixGrammar,
    makeMoreConcise,
    makeMoreDetailed,
    translateContent,
    suggestKeywords,
    improveFormatting,
    isGenerating,
  } = useAiSuggestions();

  // Recipients suggestion hook
  const {
    suggestions: recipientSuggestions,
    loading: suggestionsLoading,
    search: searchRecipients,
    recentRecipients,
  } = useRecipientSuggestions(loadRecipients);

  // --------------------------
  // Form setup
  // --------------------------
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: initialDraft?.to || (replyTo ? replyTo.from : ''),
      cc: initialDraft?.cc || '',
      bcc: initialDraft?.bcc || '',
      subject: initialDraft?.subject || (replyTo ? `Re: ${replyTo.subject}` : ''),
      body: initialDraft?.body || '',
      template: initialDraft?.template || '',
      signature: initialDraft?.signature || '',
      priority: initialDraft?.priority || 'normal',
      scheduled: initialDraft?.scheduled || false,
      scheduledDate: initialDraft?.scheduledDate || null,
      requestReadReceipt: initialDraft?.requestReadReceipt || false,
      saveAsDraft: initialDraft?.saveAsDraft || false,
      tone: initialDraft?.tone || 'professional',
      confidential: initialDraft?.confidential || false,
      followUpReminder: initialDraft?.followUpReminder || false,
      followUpDate: initialDraft?.followUpDate || null,
      language: initialDraft?.language || defaultLanguage,
    },
    mode: 'onChange',
  });

  // --------------------------
  // Form watch fields
  // --------------------------
  const watchBody = form.watch('body');
  const watchTo = form.watch('to');
  const watchCc = form.watch('cc');
  const watchBcc = form.watch('bcc');
  const watchSubject = form.watch('subject');
  const watchScheduled = form.watch('scheduled');
  const watchScheduledDate = form.watch('scheduledDate');
  const watchPriority = form.watch('priority');
  const watchTone = form.watch('tone');
  const watchConfidential = form.watch('confidential');
  const watchFollowUpReminder = form.watch('followUpReminder');
  const watchFollowUpDate = form.watch('followUpDate');

  // --------------------------
  // Derived state
  // --------------------------

  // Total size of all attachments
  const totalAttachmentsSize = useMemo(() => {
    return attachments.reduce((total, file) => total + file.size, 0);
  }, [attachments]);

  // Check if max attachment size is reached
  const isMaxAttachmentSizeReached = useMemo(() => {
    return totalAttachmentsSize >= maxTotalAttachmentSize;
  }, [totalAttachmentsSize, maxTotalAttachmentSize]);

  // Check if max attachment count is reached
  const isMaxAttachmentCountReached = useMemo(() => {
    return attachments.length >= maxAttachments;
  }, [attachments.length, maxAttachments]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const formState = form.formState;
    const hasRequiredFields = !!watchTo && !!watchSubject && !!watchBody;
    const hasValidScheduleDate = !watchScheduled || (watchScheduled && !!watchScheduledDate);
    const hasValidFollowUpDate =
      !watchFollowUpReminder || (watchFollowUpReminder && !!watchFollowUpDate);

    return (
      Object.keys(formState.errors).length === 0 &&
      hasRequiredFields &&
      hasValidScheduleDate &&
      hasValidFollowUpDate
    );
  }, [
    form.formState,
    watchTo,
    watchSubject,
    watchBody,
    watchScheduled,
    watchScheduledDate,
    watchFollowUpReminder,
    watchFollowUpDate,
  ]);

  // Filter templates based on search query
  useEffect(() => {
    if (!templateSearchQuery.trim()) {
      setFilteredTemplates(templates);
      return;
    }

    const query = templateSearchQuery.toLowerCase();
    const filtered = templates.filter(
      template =>
        template.name.toLowerCase().includes(query) ||
        (template.description && template.description.toLowerCase().includes(query)) ||
        (template.tags && template.tags.some(tag => tag.toLowerCase().includes(query)))
    );

    setFilteredTemplates(filtered);
  }, [templateSearchQuery, templates]);

  // --------------------------
  // Callbacks
  // --------------------------

  // Setup autosave
  const autoSave = useCallback(async () => {
    if (!autoSaveEnabled || readOnly) return false;

    try {
      setDraftStatus('saving');
      const formData = form.getValues();
      setUnsavedChanges(false);

      if (onSave) {
        const success = await onSave({
          ...formData,
          attachments: attachments as unknown as File[],
        });

        if (success) {
          setDraftStatus('saved');
          setLastSaved(new Date());
          return true;
        } else {
          throw new Error('Failed to save draft');
        }
      } else {
        // Mock successful API call for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
        setDraftStatus('saved');
        setLastSaved(new Date());
        return true;
      }
    } catch (error) {
      console.error('Error auto-saving:', error);
      setDraftStatus('error');
      return false;
    }
  }, [form, attachments, onSave, autoSaveEnabled, readOnly]);

  // Initialize autosave (15 second interval)
  useAutosave(autoSave, 15000);

  // Handle form values change (for unsaved changes tracking)
  useEffect(() => {
    const subscription = form.watch(() => {
      setUnsavedChanges(true);

      // Clear previous timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for autosave after changes (3 seconds of inactivity)
      if (autoSaveEnabled && !readOnly) {
        autoSaveTimerRef.current = setTimeout(() => {
          autoSave();
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, autoSave, autoSaveEnabled, readOnly]);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    'Ctrl+Enter': e => {
      e.preventDefault();
      if (!readOnly && isFormValid) {
        form.handleSubmit(onSubmit)();
      }
    },
    'Ctrl+s': e => {
      e.preventDefault();
      if (!readOnly) {
        saveDraft();
      }
    },
    Escape: e => {
      e.preventDefault();
      if (confirmSend) {
        setConfirmSend(false);
      } else if (showAnalysis) {
        setShowAnalysis(false);
      } else if (onCancel && unsavedChanges) {
        setConfirmCancel(true);
      } else if (onCancel) {
        onCancel();
      }
    },
    'Ctrl+Alt+A': e => {
      e.preventDefault();
      if (!readOnly && !isMaxAttachmentCountReached && !isMaxAttachmentSizeReached) {
        fileInputRef.current?.click();
      }
    },
    'Alt+F': e => {
      e.preventDefault();
      if (!readOnly) {
        form.setValue('followUpReminder', !watchFollowUpReminder);
        setShowFollowUpOptions(!showFollowUpOptions);
      }
    },
    'Alt+C': e => {
      e.preventDefault();
      if (!readOnly) {
        form.setValue('confidential', !watchConfidential);
      }
    },
    'Alt+S': e => {
      e.preventDefault();
      if (!readOnly) {
        form.setValue('scheduled', !watchScheduled);
      }
    },
    'Shift+?': e => {
      e.preventDefault();
      setShowKeyboardShortcutsDialog(true);
    },
  });

  // Show warning when leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);

  // Load signatures
  useEffect(() => {
    const fetchSignatures = async () => {
      if (loadSignatures) {
        try {
          setIsLoadingSignatures(true);
          const result = await loadSignatures();
          setSignatures(result);

          // Set default signature if available
          const defaultSig = result.find(sig => sig.isDefault);
          if (defaultSig && !selectedSignature && !initialDraft?.signature) {
            setSelectedSignature(defaultSig.id);
          } else if (initialDraft?.signature) {
            setSelectedSignature(initialDraft.signature);
          }
        } catch (error) {
          console.error('Error loading signatures:', error);
          toast({
            title: 'Error loading signatures',
            description: 'Failed to load your email signatures.',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingSignatures(false);
        }
      }
    };

    fetchSignatures();
  }, [loadSignatures, initialDraft?.signature, selectedSignature, toast]);

  // Load templates
  useEffect(() => {
    const fetchTemplates = async () => {
      if (loadTemplates) {
        try {
          setIsLoadingTemplates(true);
          const result = await loadTemplates();
          setTemplates(result);
          setFilteredTemplates(result);

          // Load favorite templates from local storage
          const storedFavorites = localStorage.getItem('favoriteEmailTemplates');
          if (storedFavorites) {
            setFavoriteTemplates(JSON.parse(storedFavorites));
          }
        } catch (error) {
          console.error('Error loading templates:', error);
          toast({
            title: 'Error loading templates',
            description: 'Failed to load email templates.',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingTemplates(false);
        }
      }
    };

    fetchTemplates();
  }, [loadTemplates, toast]);

  // Update signature content when signature changes
  useEffect(() => {
    if (selectedSignature) {
      const signature = signatures.find(sig => sig.id === selectedSignature);
      if (signature) {
        setSignatureContent(signature.content);
        form.setValue('signature', selectedSignature);
      }
    } else {
      setSignatureContent('');
      form.setValue('signature', '');
    }
  }, [selectedSignature, signatures, form]);

  // Handle template selection
  useEffect(() => {
    const applyTemplate = async () => {
      if (selectedTemplate) {
        try {
          // Find the selected template
          const template = templates.find(t => t.id === selectedTemplate);

          if (template) {
            // Update the form with template data
            form.setValue('template', selectedTemplate);
            form.setValue('subject', template.subject);
            form.setValue('body', template.content);

            // Track template usage
            trackEvent('email_template_applied', {
              template_id: selectedTemplate,
              template_name: template.name,
            });

            // Show confirmation toast
            toast({
              title: 'Template applied',
              description: `The "${template.name}" template has been applied to your email.`,
            });
          }
        } catch (error) {
          console.error('Error applying template:', error);
          toast({
            title: 'Error',
            description: 'Failed to apply the selected template.',
            variant: 'destructive',
          });
        }
      }
    };

    applyTemplate();
  }, [selectedTemplate, templates, form, toast, trackEvent]);

  // Toggle favorite template
  const toggleFavoriteTemplate = useCallback((templateId: string) => {
    setFavoriteTemplates(prev => {
      const isFavorite = prev.includes(templateId);
      const newFavorites = isFavorite
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId];

      // Store in local storage
      localStorage.setItem('favoriteEmailTemplates', JSON.stringify(newFavorites));

      return newFavorites;
    });
  }, []);

  // --------------------------
  // File Handling Functions
  // --------------------------

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && !readOnly) {
        const newFiles = Array.from(e.target.files);

        // Check if adding these files would exceed the maximum
        if (attachments.length + newFiles.length > maxAttachments) {
          toast({
            title: 'Too many attachments',
            description: `You can only attach up to ${maxAttachments} files.`,
            variant: 'destructive',
          });
          return;
        }

        // Calculate total size including new files
        const totalSize = totalAttachmentsSize + newFiles.reduce((sum, file) => sum + file.size, 0);

        if (totalSize > maxTotalAttachmentSize) {
          toast({
            title: 'Attachment size limit exceeded',
            description: `Total attachments cannot exceed ${formatFileSize(
              maxTotalAttachmentSize
            )}.`,
            variant: 'destructive',
          });
          return;
        }

        // Validate files
        const invalidFiles: string[] = [];
        const validFiles: FileWithProgress[] = [];

        newFiles.forEach(file => {
          if (!validateFile(file)) {
            invalidFiles.push(file.name);
          } else {
            // Create FileWithProgress object
            const fileWithProgress = file as FileWithProgress;
            fileWithProgress.id = generateUniqueId();
            fileWithProgress.progress = 0;
            validFiles.push(fileWithProgress);

            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 20;
              if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
              }

              setAttachments(current =>
                current.map(f =>
                  f.id === fileWithProgress.id ? { ...f, progress: Math.round(progress) } : f
                )
              );
            }, 200);
          }
        });

        if (invalidFiles.length > 0) {
          toast({
            title: 'Invalid files',
            description: `The following files are invalid: ${invalidFiles.join(', ')}`,
            variant: 'destructive',
          });
        }

        if (validFiles.length > 0) {
          setAttachments(prev => [...prev, ...validFiles]);
          setUnsavedChanges(true);

          // Track attachment added
          trackEvent('email_attachment_added', {
            file_count: validFiles.length,
            file_types: validFiles.map(f => f.type),
            total_size: validFiles.reduce((sum, f) => sum + f.size, 0),
          });
        }

        // Reset the file input
        if (e.target) {
          e.target.value = '';
        }
      }
    },
    [
      attachments.length,
      maxAttachments,
      readOnly,
      toast,
      totalAttachmentsSize,
      maxTotalAttachmentSize,
      trackEvent,
    ]
  );

  // Remove attachment
  const removeAttachment = useCallback(
    (id: string) => {
      if (readOnly) return;

      setAttachments(prev => prev.filter(file => file.id !== id));
      setUnsavedChanges(true);

      // Track attachment removed
      trackEvent('email_attachment_removed');
    },
    [readOnly, trackEvent]
  );

  // --------------------------
  // Email Actions
  // --------------------------

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (readOnly) return;

    try {
      setIsSubmitting(true);

      // Check if the email should be scheduled
      if (values.scheduled && !values.scheduledDate) {
        toast({
          title: 'Scheduling error',
          description: 'Please select a date and time for scheduling.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Check if follow-up is enabled but date is missing
      if (values.followUpReminder && !values.followUpDate) {
        toast({
          title: 'Follow-up reminder error',
          description: 'Please select a date and time for the follow-up reminder.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Show confirmation dialog if not already confirmed
      if (!confirmSend) {
        setConfirmSend(true);
        setIsSubmitting(false);
        return;
      }

      // Format data for API
      const formData = {
        ...values,
        attachments: attachments as unknown as File[],
      };

      // If email is scheduled, use the onSchedule callback if available
      if (values.scheduled && onSchedule) {
        const success = await onSchedule(formData);

        if (success) {
          toast({
            title: 'Email scheduled',
            description: `Your email has been scheduled for ${formatDate(values.scheduledDate)}.`,
          });

          // Track scheduled email
          trackEvent('email_scheduled', {
            scheduled_date: values.scheduledDate?.toISOString(),
            has_attachments: attachments.length > 0,
          });

          // Reset form if successful
          if (onCancel) {
            onCancel();
          } else {
            form.reset();
            setAttachments([]);
            setConfirmSend(false);
            setUnsavedChanges(false);
          }

          return;
        } else {
          throw new Error('Failed to schedule email');
        }
      }

      // Otherwise, send email via provided callback
      if (onSend) {
        const success = await onSend(formData);

        if (success) {
          toast({
            title: 'Email sent',
            description: 'Your email has been sent successfully.',
          });

          // Track sent email
          trackEvent('email_sent', {
            has_attachments: attachments.length > 0,
            priority: values.priority,
            confidential: values.confidential,
          });

          // Reset form if successful
          if (onCancel) {
            onCancel();
          } else {
            form.reset();
            setAttachments([]);
            setConfirmSend(false);
            setUnsavedChanges(false);
          }
        } else {
          throw new Error('Failed to send email');
        }
      } else {
        // Mock successful API call for demonstration
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
          title: values.scheduled ? 'Email scheduled' : 'Email sent',
          description: values.scheduled
            ? `Your email has been scheduled for ${formatDate(values.scheduledDate)}.`
            : 'Your email has been sent successfully.',
        });

        // Track mock email sent
        trackEvent(values.scheduled ? 'email_scheduled' : 'email_sent', {
          has_attachments: attachments.length > 0,
          priority: values.priority,
          confidential: values.confidential,
        });

        // Reset form if successful
        if (onCancel) {
          onCancel();
        } else {
          form.reset();
          setAttachments([]);
          setConfirmSend(false);
          setUnsavedChanges(false);
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving draft
  const saveDraft = useCallback(async () => {
    if (readOnly) return;

    try {
      setIsSaving(true);
      setDraftStatus('saving');
      const values = form.getValues();

      // Save draft via provided callback
      if (onSave) {
        const success = await onSave({ ...values, attachments: attachments as unknown as File[] });

        if (success) {
          setDraftStatus('saved');
          setLastSaved(new Date());
          setUnsavedChanges(false);

          toast({
            title: 'Draft saved',
            description: 'Your draft has been saved.',
          });

          // Track draft saved
          trackEvent('email_draft_saved');
        } else {
          throw new Error('Failed to save draft');
        }
      } else {
        // Mock successful API call for demonstration
        await new Promise(resolve => setTimeout(resolve, 500));
        setDraftStatus('saved');
        setLastSaved(new Date());
        setUnsavedChanges(false);

        toast({
          title: 'Draft saved',
          description: 'Your draft has been saved.',
        });

        // Track mock draft saved
        trackEvent('email_draft_saved');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setDraftStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [form, attachments, onSave, readOnly, toast, trackEvent]);

  // Handle email analysis
  const handleAnalyzeEmail = useCallback(async () => {
    if (!watchBody || !onAnalyze) return;

    try {
      setIsAnalyzing(true);
      const values = form.getValues();

      // Analyze email via provided callback
      const analysis = await onAnalyze(values);

      if (analysis) {
        setAnalysisData(analysis);
        setShowAnalysis(true);

        toast({
          title: 'Email analyzed',
          description: 'AI has analyzed your email content.',
        });

        // Track email analyzed
        trackEvent('email_analyzed', {
          word_count: analysis.statistics.wordCount,
          sentiment: analysis.sentiment,
        });
      } else {
        throw new Error('Failed to analyze email');
      }
    } catch (error) {
      console.error('Error analyzing email:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [watchBody, onAnalyze, form, toast, trackEvent]);

  // --------------------------
  // AI Functions
  // --------------------------

  // Handle AI suggestion for subject
  const handleGenerateSubject = useCallback(async () => {
    if (readOnly || !watchBody || !enableAiSuggestions) return;

    try {
      const body = watchBody;
      const result = await generateSubject(body, replyTo?.threadId);

      if (result.success) {
        form.setValue('subject', result.subject);
        setUnsavedChanges(true);

        toast({
          title: 'Subject generated',
          description: 'AI has suggested a subject based on your email content.',
        });

        // Track subject generated
        trackEvent('ai_subject_generated');
      } else {
        throw new Error(result.error || 'Failed to generate subject');
      }
    } catch (error) {
      console.error('Error generating subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate subject. Please try again.',
        variant: 'destructive',
      });
    }
  }, [
    readOnly,
    watchBody,
    enableAiSuggestions,
    generateSubject,
    replyTo?.threadId,
    form,
    toast,
    trackEvent,
  ]);

  // Handle AI suggestion for body
  const handleGenerateBody = useCallback(async () => {
    if (readOnly || !watchSubject || !enableAiSuggestions) return;

    try {
      const subject = watchSubject;
      const result = await generateBody(subject, replyTo?.id, watchTone);

      if (result.success) {
        form.setValue('body', result.body);
        setUnsavedChanges(true);

        toast({
          title: 'Email body generated',
          description: 'AI has generated an email body based on your subject.',
        });

        // Track body generated
        trackEvent('ai_body_generated', {
          tone: watchTone,
        });
      } else {
        throw new Error(result.error || 'Failed to generate email body');
      }
    } catch (error) {
      console.error('Error generating email body:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate email body. Please try again.',
        variant: 'destructive',
      });
    }
  }, [
    readOnly,
    watchSubject,
    enableAiSuggestions,
    generateBody,
    replyTo?.id,
    watchTone,
    form,
    toast,
    trackEvent,
  ]);

  // Handle AI tone adjustment
  const handleAdjustTone = useCallback(async () => {
    if (readOnly || !watchBody || !enableAiSuggestions) return;

    try {
      const body = watchBody;
      const result = await improveTone(body, watchTone);

      if (result.success) {
        form.setValue('body', result.body);
        setUnsavedChanges(true);

        toast({
          title: 'Tone adjusted',
          description: `Your email has been adjusted to a ${watchTone} tone.`,
        });

        // Track tone adjusted
        trackEvent('ai_tone_adjusted', {
          tone: watchTone,
        });
      } else {
        throw new Error(result.error || 'Failed to adjust tone');
      }
    } catch (error) {
      console.error('Error adjusting tone:', error);
      toast({
        title: 'Error',
        description: 'Failed to adjust tone. Please try again.',
        variant: 'destructive',
      });
    }
  }, [readOnly, watchBody, enableAiSuggestions, improveTone, watchTone, form, toast, trackEvent]);

  // Handle AI grammar fixing
  const handleFixGrammar = useCallback(async () => {
    if (readOnly || !watchBody || !enableAiSuggestions) return;

    try {
      const body = watchBody;
      const result = await fixGrammar(body);

      if (result.success) {
        form.setValue('body', result.body);
        setUnsavedChanges(true);

        toast({
          title: 'Grammar fixed',
          description: 'AI has fixed grammar issues in your email.',
        });

        // Track grammar fixed
        trackEvent('ai_grammar_fixed');
      } else {
        throw new Error(result.error || 'Failed to fix grammar');
      }
    } catch (error) {
      console.error('Error fixing grammar:', error);
      toast({
        title: 'Error',
        description: 'Failed to fix grammar. Please try again.',
        variant: 'destructive',
      });
    }
  }, [readOnly, watchBody, enableAiSuggestions, fixGrammar, form, toast, trackEvent]);

  // Handle AI making email more concise
  const handleMakeConcise = useCallback(async () => {
    if (readOnly || !watchBody || !enableAiSuggestions) return;

    try {
      const body = watchBody;
      const result = await makeMoreConcise(body);

      if (result.success) {
        form.setValue('body', result.body);
        setUnsavedChanges(true);

        toast({
          title: 'Email shortened',
          description: 'AI has made your email more concise.',
        });

        // Track made concise
        trackEvent('ai_made_concise');
      } else {
        throw new Error(result.error || 'Failed to make email concise');
      }
    } catch (error) {
      console.error('Error making email concise:', error);
      toast({
        title: 'Error',
        description: 'Failed to make email concise. Please try again.',
        variant: 'destructive',
      });
    }
  }, [readOnly, watchBody, enableAiSuggestions, makeMoreConcise, form, toast, trackEvent]);

  // Handle AI making email more detailed
  const handleMakeDetailed = useCallback(async () => {
    if (readOnly || !watchBody || !enableAiSuggestions) return;

    try {
      const body = watchBody;
      const result = await makeMoreDetailed(body);

      if (result.success) {
        form.setValue('body', result.body);
        setUnsavedChanges(true);

        toast({
          title: 'Email expanded',
          description: 'AI has added more details to your email.',
        });

        // Track made detailed
        trackEvent('ai_made_detailed');
      } else {
        throw new Error(result.error || 'Failed to add details to email');
      }
    } catch (error) {
      console.error('Error adding details to email:', error);
      toast({
        title: 'Error',
        description: 'Failed to add details to email. Please try again.',
        variant: 'destructive',
      });
    }
  }, [readOnly, watchBody, enableAiSuggestions, makeMoreDetailed, form, toast, trackEvent]);

  // Handle AI improving formatting
  const handleImproveFormatting = useCallback(async () => {
    if (readOnly || !watchBody || !enableAiSuggestions) return;

    try {
      const body = watchBody;
      const result = await improveFormatting(body);

      if (result.success) {
        form.setValue('body', result.body);
        setUnsavedChanges(true);

        toast({
          title: 'Formatting improved',
          description: 'AI has improved the formatting of your email.',
        });

        // Track formatting improved
        trackEvent('ai_formatting_improved');
      } else {
        throw new Error(result.error || 'Failed to improve formatting');
      }
    } catch (error) {
      console.error('Error improving formatting:', error);
      toast({
        title: 'Error',
        description: 'Failed to improve formatting. Please try again.',
        variant: 'destructive',
      });
    }
  }, [readOnly, watchBody, enableAiSuggestions, improveFormatting, form, toast, trackEvent]);

  // Handle AI translation
  const handleTranslateContent = useCallback(
    async (targetLanguage: string) => {
      if (readOnly || !watchBody || !enableAiSuggestions) return;

      try {
        const body = watchBody;
        const result = await translateContent(body, targetLanguage);

        if (result.success) {
          form.setValue('body', result.body);
          setUnsavedChanges(true);

          // If there's a subject, translate it too
          if (watchSubject) {
            const subjectResult = await translateContent(watchSubject, targetLanguage);
            if (subjectResult.success) {
              form.setValue('subject', subjectResult.body);
            }
          }

          setSelectedLanguage(targetLanguage);

          toast({
            title: 'Email translated',
            description: `Your email has been translated to ${targetLanguage}.`,
          });

          // Track translation
          trackEvent('ai_translation', {
            target_language: targetLanguage,
          });
        } else {
          throw new Error(result.error || 'Failed to translate email');
        }
      } catch (error) {
        console.error('Error translating email:', error);
        toast({
          title: 'Error',
          description: 'Failed to translate email. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [
      readOnly,
      watchBody,
      watchSubject,
      enableAiSuggestions,
      translateContent,
      form,
      toast,
      trackEvent,
    ]
  );

  // Handle restoring previous version
  const handleRestorePreviousVersion = useCallback(
    async (versionId: string) => {
      if (readOnly) return;

      try {
        setIsRestoring(true);

        // In a real implementation, fetch the version from an API
        // For this example, we'll simulate it
        await new Promise(resolve => setTimeout(resolve, 800));

        // Dummy previous version content
        const previousVersionContent = `Dear recipient,

This is a previous version of the email content.
It was saved on ${new Date().toLocaleString()}.

Thank you,
The sender`;

        form.setValue('body', previousVersionContent);
        setUnsavedChanges(true);

        toast({
          title: 'Previous version restored',
          description: 'A previous version of your email has been restored.',
        });

        // Track version restored
        trackEvent('email_version_restored', {
          version_id: versionId,
        });
      } catch (error) {
        console.error('Error restoring previous version:', error);
        toast({
          title: 'Error',
          description: 'Failed to restore previous version. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsRestoring(false);
      }
    },
    [readOnly, form, toast, trackEvent]
  );

  // --------------------------
  // UI Helper Functions
  // --------------------------

  // Get priority color based on EMAIL_PRIORITIES keys
  const getPriorityColor = (priority: keyof typeof EMAIL_PRIORITIES | string): string => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'low':
        return 'text-blue-500';
      default: // 'normal'
        return 'text-gray-500';
    }
  };

  // Get tone badge variant
  const getToneBadgeVariant = (
    tone: string
  ): 'default' | 'outline' | 'secondary' | 'destructive' => {
    switch (tone) {
      case 'professional':
        return 'default';
      case 'friendly':
        return 'secondary';
      case 'formal':
        return 'outline';
      case 'casual':
        return 'secondary';
      case 'persuasive':
        return 'secondary';
      case 'concise':
        return 'default';
      default:
        return 'default';
    }
  };

  // Format recipient for display
  const formatRecipient = (email: string): string => {
    if (!email) return '';

    // Clean up extra spaces and ensure proper comma formatting
    return email
      .split(',')
      .map(e => e.trim())
      .filter(e => e)
      .join(', ');
  };

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not specified';
    return format(date, 'PPp');
  };

  // --------------------------
  // Component Rendering
  // --------------------------

  // Render keyboard shortcuts dialog
  const renderKeyboardShortcutsDialog = () => (
    <Dialog open={showKeyboardShortcutsDialog} onOpenChange={setShowKeyboardShortcutsDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to work more efficiently.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm font-medium">Ctrl + Enter</div>
          <div className="text-sm">Send email</div>

          <div className="text-sm font-medium">Ctrl + S</div>
          <div className="text-sm">Save draft</div>

          <div className="text-sm font-medium">Esc</div>
          <div className="text-sm">Cancel / Close modal</div>

          <div className="text-sm font-medium">Ctrl + Alt + A</div>
          <div className="text-sm">Add attachment</div>

          <div className="text-sm font-medium">Alt + F</div>
          <div className="text-sm">Toggle follow-up reminder</div>

          <div className="text-sm font-medium">Alt + C</div>
          <div className="text-sm">Toggle confidential mode</div>

          <div className="text-sm font-medium">Alt + S</div>
          <div className="text-sm">Toggle scheduling</div>

          <div className="text-sm font-medium">Shift + ?</div>
          <div className="text-sm">Show keyboard shortcuts</div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowKeyboardShortcutsDialog(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render confirm cancel dialog
  const renderConfirmCancelDialog = () => (
    <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discard unsaved changes?</DialogTitle>
          <DialogDescription>
            You have unsaved changes that will be lost if you exit now.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmCancel(false)}>
            Continue editing
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setConfirmCancel(false);
              if (onCancel) onCancel();
            }}
          >
            Discard changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render confirm send dialog
  const renderConfirmSendDialog = () => (
    <Dialog open={confirmSend} onOpenChange={setConfirmSend}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm {watchScheduled ? 'Schedule' : 'Send'}</DialogTitle>
          <DialogDescription>
            Are you sure you want to {watchScheduled ? 'schedule' : 'send'} this email?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <div className="grid grid-cols-4 gap-1">
            <div className="font-medium">To:</div>
            <div className="col-span-3 break-words">{formatRecipient(watchTo)}</div>
          </div>

          {watchCc && (
            <div className="grid grid-cols-4 gap-1">
              <div className="font-medium">Cc:</div>
              <div className="col-span-3 break-words">{formatRecipient(watchCc)}</div>
            </div>
          )}

          {watchBcc && (
            <div className="grid grid-cols-4 gap-1">
              <div className="font-medium">Bcc:</div>
              <div className="col-span-3 break-words">{formatRecipient(watchBcc)}</div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-1">
            <div className="font-medium">Subject:</div>
            <div className="col-span-3 font-medium">{watchSubject}</div>
          </div>

          {attachments.length > 0 && (
            <div className="grid grid-cols-4 gap-1">
              <div className="font-medium">Attachments:</div>
              <div className="col-span-3">
                {attachments.length} file(s) ({formatFileSize(totalAttachmentsSize)})
              </div>
            </div>
          )}

          {watchScheduled && watchScheduledDate && (
            <div className="grid grid-cols-4 gap-1">
              <div className="font-medium">Scheduled:</div>
              <div className="col-span-3">{formatDate(watchScheduledDate)}</div>
            </div>
          )}

          {watchConfidential && (
            <div className="grid grid-cols-4 gap-1">
              <div className="font-medium">Mode:</div>
              <div className="col-span-3 flex items-center">
                <Lock className="h-4 w-4 mr-1 text-amber-500" />
                <span>Confidential</span>
              </div>
            </div>
          )}

          {watchPriority !== 'normal' && (
            <div className="grid grid-cols-4 gap-1">
              <div className="font-medium">Priority:</div>
              <div className="col-span-3 flex items-center">
                <Flag className={`h-4 w-4 mr-1 ${getPriorityColor(watchPriority)}`} />
                <span className="capitalize">{watchPriority}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmSend(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmSend(false);
              form.handleSubmit(onSubmit)();
            }}
          >
            {watchScheduled ? 'Schedule' : 'Send'} Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render template selector tab
  const renderTemplateSelector = () => {
    if (!showTemplateSelector) return null;

    return (
      <TabsContent value="template" className="mt-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Email Templates</CardTitle>
            <CardDescription>Choose a template to quickly create your email</CardDescription>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={templateSearchQuery}
                onChange={e => setTemplateSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTemplates ? (
              <div className="space-y-3">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : filteredTemplates.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className="flex items-start space-x-4 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded flex items-center justify-center bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{template.name}</h4>
                          <div className="flex items-center space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => toggleFavoriteTemplate(template.id)}
                                  >
                                    <Star
                                      className={cn(
                                        'h-4 w-4',
                                        favoriteTemplates.includes(template.id)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-muted-foreground'
                                      )}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {favoriteTemplates.includes(template.id)
                                    ? 'Remove from favorites'
                                    : 'Add to favorites'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      // Copy to clipboard
                                      navigator.clipboard.writeText(template.content);
                                      toast({
                                        title: 'Copied to clipboard',
                                        description: 'Template content copied to clipboard',
                                      });
                                    }}
                                  >
                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy template content</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description || 'No description available'}
                        </p>
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="pt-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={readOnly}
                            onClick={() => {
                              setSelectedTemplate(template.id);
                              setActiveTab('compose');
                            }}
                          >
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollBar />
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No templates found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {templateSearchQuery
                    ? `No templates matching "${templateSearchQuery}"`
                    : 'No templates are available'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    );
  };

  // Render AI suggestions dropdown
  const renderAiSuggestionsDropdown = () => {
    if (!enableAiSuggestions || readOnly) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isGenerating}
            className="relative"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Assist
            <ChevronDown className="h-4 w-4 ml-1" />
            {isGenerating && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleGenerateBody} disabled={!watchSubject || isGenerating}>
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGenerateSubject} disabled={!watchBody || isGenerating}>
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Subject
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAdjustTone} disabled={!watchBody || isGenerating}>
            <span className="h-4 w-4 mr-2">🎭</span>
            Adjust to {watchTone} Tone
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFixGrammar} disabled={!watchBody || isGenerating}>
            <span className="h-4 w-4 mr-2">✓</span>
            Fix Grammar & Spelling
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMakeConcise} disabled={!watchBody || isGenerating}>
            <span className="h-4 w-4 mr-2">📏</span>
            Make More Concise
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMakeDetailed} disabled={!watchBody || isGenerating}>
            <span className="h-4 w-4 mr-2">📝</span>
            Add More Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImproveFormatting} disabled={!watchBody || isGenerating}>
            <span className="h-4 w-4 mr-2">📄</span>
            Improve Formatting
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            <div className="flex items-center">
              <Languages className="h-4 w-4 mr-2" />
              Translate
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleTranslateContent('en')}
            disabled={!watchBody || isGenerating}
          >
            <span className="h-4 w-4 mr-2">🇺🇸</span>
            English
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleTranslateContent('es')}
            disabled={!watchBody || isGenerating}
          >
            <span className="h-4 w-4 mr-2">🇪🇸</span>
            Spanish
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleTranslateContent('fr')}
            disabled={!watchBody || isGenerating}
          >
            <span className="h-4 w-4 mr-2">🇫🇷</span>
            French
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleTranslateContent('de')}
            disabled={!watchBody || isGenerating}
          >
            <span className="h-4 w-4 mr-2">🇩🇪</span>
            German
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleTranslateContent('ja')}
            disabled={!watchBody || isGenerating}
          >
            <span className="h-4 w-4 mr-2">🇯🇵</span>
            Japanese
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Render email compose form
  const renderEmailForm = () => (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex justify-between items-center">
              <span>{replyMode ? 'Reply to Email' : 'New Email'}</span>
              <div className="flex items-center space-x-2">
                {!readOnly && (
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue>
                              <div className="flex items-center">
                                <Flag className={`h-4 w-4 mr-2 ${getPriorityColor(field.value)}`} />
                                <span className="capitalize">{field.value} Priority</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">
                              <div className="flex items-center">
                                <Flag className="h-4 w-4 mr-2 text-red-500" />
                                <span>{EMAIL_PRIORITIES.high} Priority</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="normal">
                              <div className="flex items-center">
                                <Flag className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{EMAIL_PRIORITIES.normal} Priority</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="low">
                              <div className="flex items-center">
                                <Flag className="h-4 w-4 mr-2 text-blue-500" />
                                <span>{EMAIL_PRIORITIES.low} Priority</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}

                {!readOnly && (
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={value => {
                            field.onChange(value);
                            if (watchBody.trim().length > 0 && enableAiSuggestions) {
                              handleAdjustTone();
                            }
                          }}
                          disabled={readOnly || !enableAiSuggestions}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue>
                              <Badge variant={getToneBadgeVariant(field.value)}>
                                <span className="capitalize">{field.value} Tone</span>
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(EMAIL_TONES).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                <Badge variant={getToneBadgeVariant(value)}>{label} Tone</Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="w-14 shrink-0">To</FormLabel>
                    <FormControl>
                      <RecipientAutocomplete
                        value={field.value}
                        onChange={value => {
                          field.onChange(value);
                          setUnsavedChanges(true);
                        }}
                        onSearch={searchRecipients}
                        suggestions={recipientSuggestions}
                        loading={suggestionsLoading}
                        placeholder="recipient@example.com"
                        disabled={readOnly}
                        recentRecipients={recentRecipients}
                      />
                    </FormControl>
                  </div>
                  <div className="pl-14">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="cc"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel className="w-14 shrink-0">Cc</FormLabel>
                      <FormControl>
                        <RecipientAutocomplete
                          value={field.value}
                          onChange={value => {
                            field.onChange(value);
                            setUnsavedChanges(true);
                          }}
                          onSearch={searchRecipients}
                          suggestions={recipientSuggestions}
                          loading={suggestionsLoading}
                          placeholder="cc@example.com"
                          disabled={readOnly}
                          recentRecipients={recentRecipients}
                        />
                      </FormControl>
                    </div>
                    <div className="pl-14">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bcc"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel className="w-14 shrink-0">Bcc</FormLabel>
                      <FormControl>
                        <RecipientAutocomplete
                          value={field.value}
                          onChange={value => {
                            field.onChange(value);
                            setUnsavedChanges(true);
                          }}
                          onSearch={searchRecipients}
                          suggestions={recipientSuggestions}
                          loading={suggestionsLoading}
                          placeholder="bcc@example.com"
                          disabled={readOnly}
                          recentRecipients={recentRecipients}
                        />
                      </FormControl>
                    </div>
                    <div className="pl-14">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center">
                      <FormLabel className="w-14 shrink-0">Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email subject"
                          {...field}
                          onChange={e => {
                            field.onChange(e);
                            setUnsavedChanges(true);
                          }}
                          disabled={readOnly}
                        />
                      </FormControl>
                    </div>
                    <div className="pl-14">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {enableAiSuggestions && !readOnly && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateSubject}
                        disabled={isGenerating || !watchBody}
                        className="mt-0"
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Generate Subject from Body</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {!readOnly && (
              <div className="flex flex-wrap gap-2">
                {/* Scheduling Options */}
                <FormField
                  control={form.control}
                  name="scheduled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">Schedule for later</FormLabel>
                    </FormItem>
                  )}
                />

                {/* Confidential Email */}
                <FormField
                  control={form.control}
                  name="confidential"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={checked => {
                            field.onChange(checked);
                            if (checked) {
                              setShowConfidentialOptions(true);
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Confidential
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {/* Read Receipt */}
                <FormField
                  control={form.control}
                  name="requestReadReceipt"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">Request read receipt</FormLabel>
                    </FormItem>
                  )}
                />

                {/* Follow-up Reminder */}
                <FormField
                  control={form.control}
                  name="followUpReminder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={checked => {
                            field.onChange(checked);
                            if (checked) {
                              setShowFollowUpOptions(true);
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">Set follow-up reminder</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Date Selection for Scheduling */}
            {watchScheduled && (
              <div className="pl-6 border-l-2 border-primary/20 space-y-2">
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm">Schedule Date & Time</FormLabel>
                        <FormDescription className="text-xs">
                          Email will be sent at the specified date and time
                        </FormDescription>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Select date & time</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={date => date < new Date()}
                          />
                          <div className="p-3 border-t border-border">
                            <Select
                              value={field.value ? format(field.value, 'HH:mm') : '12:00'}
                              onValueChange={time => {
                                const [hours, minutes] = time.split(':').map(Number);
                                const date = field.value || new Date();
                                date.setHours(hours);
                                date.setMinutes(minutes);
                                field.onChange(date);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                  <React.Fragment key={hour}>
                                    <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                                      {`${hour.toString().padStart(2, '0')}:00`}
                                    </SelectItem>
                                    <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                                      {`${hour.toString().padStart(2, '0')}:30`}
                                    </SelectItem>
                                  </React.Fragment>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Follow-up Reminder Options */}
            {watchFollowUpReminder && (
              <div className="pl-6 border-l-2 border-amber-300/50 space-y-2">
                <FormField
                  control={form.control}
                  name="followUpDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2">
                      <div className="space-y-1">
                        <FormLabel className="text-sm">Follow-up Date</FormLabel>
                        <FormDescription className="text-xs">
                          You&#39;ll receive a reminder to follow up on this email
                        </FormDescription>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Select date & time</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={date => date < new Date()}
                          />
                          <div className="p-3 border-t border-border">
                            <Select
                              value={field.value ? format(field.value, 'HH:mm') : '12:00'}
                              onValueChange={time => {
                                const [hours, minutes] = time.split(':').map(Number);
                                const date = field.value || new Date();
                                date.setHours(hours);
                                date.setMinutes(minutes);
                                field.onChange(date);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                  <React.Fragment key={hour}>
                                    <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                                      {`${hour.toString().padStart(2, '0')}:00`}
                                    </SelectItem>
                                    <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                                      {`${hour.toString().padStart(2, '0')}:30`}
                                    </SelectItem>
                                  </React.Fragment>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Confidential Email Options */}
            {watchConfidential && showConfidentialOptions && (
              <div className="p-4 rounded-md bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 text-amber-500 mr-2" />
                    <h4 className="font-medium text-sm">Confidential Mode</h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowConfidentialOptions(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recipients won&#39;t be able to forward, copy, print, or download this email. You
                  can set an expiration date if needed.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Switch id="prevent-forwarding" defaultChecked />
                    <Label htmlFor="prevent-forwarding" className="text-xs">
                      Prevent forwarding
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="disable-download" defaultChecked />
                    <Label htmlFor="disable-download" className="text-xs">
                      Disable download
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="expire-email" />
                    <Label htmlFor="expire-email" className="text-xs">
                      Set expiration date
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Message</FormLabel>
                    <div className="flex items-center space-x-2">
                      {/* Language selector */}
                      <Select
                        value={selectedLanguage}
                        onValueChange={setSelectedLanguage}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue>
                            <div className="flex items-center">
                              <Languages className="h-4 w-4 mr-2" />
                              {selectedLanguage === 'en'
                                ? 'English'
                                : selectedLanguage === 'es'
                                ? 'Spanish'
                                : selectedLanguage === 'fr'
                                ? 'French'
                                : selectedLanguage === 'de'
                                ? 'German'
                                : selectedLanguage === 'ja'
                                ? 'Japanese'
                                : selectedLanguage}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="en">
                            <div className="flex items-center">
                              <span className="mr-2">🇺🇸</span>
                              English
                            </div>
                          </SelectItem>
                          <SelectItem value="es">
                            <div className="flex items-center">
                              <span className="mr-2">🇪🇸</span>
                              Spanish
                            </div>
                          </SelectItem>
                          <SelectItem value="fr">
                            <div className="flex items-center">
                              <span className="mr-2">🇫🇷</span>
                              French
                            </div>
                          </SelectItem>
                          <SelectItem value="de">
                            <div className="flex items-center">
                              <span className="mr-2">🇩🇪</span>
                              German
                            </div>
                          </SelectItem>
                          <SelectItem value="ja">
                            <div className="flex items-center">
                              <span className="mr-2">🇯🇵</span>
                              Japanese
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Spell check toggle */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant={spellCheckEnabled ? 'default' : 'outline'}
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSpellCheckEnabled(!spellCheckEnabled)}
                              disabled={readOnly}
                            >
                              <span className="text-xs font-bold">
                                {spellCheckEnabled ? 'ABC' : 'abc'}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {spellCheckEnabled ? 'Disable' : 'Enable'} spell check
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* AI Suggestions dropdown */}
                      {renderAiSuggestionsDropdown()}
                    </div>
                  </div>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={value => {
                        field.onChange(value);
                        setUnsavedChanges(true);
                      }}
                      readOnly={readOnly}
                      minHeight="300px"
                      placeholder="Compose your email..."
                      signatureContent={signatureContent}
                      spellCheck={spellCheckEnabled}
                      language={selectedLanguage}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FormLabel>Attachments</FormLabel>
                  {!readOnly && !isMaxAttachmentCountReached && !isMaxAttachmentSizeReached && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" variant="ghost" size="sm" asChild className="ml-2">
                            <label>
                              <Paperclip className="h-4 w-4" />
                              <span className="sr-only">Attach files</span>
                              <Input
                                type="file"
                                className="hidden"
                                multiple
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                accept={ALLOWED_FILE_TYPES.join(',')}
                              />
                            </label>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach Files (Ctrl+Alt+A)</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {attachments.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {attachments.length} {attachments.length === 1 ? 'file' : 'files'} (
                    {formatFileSize(totalAttachmentsSize)})
                  </div>
                )}
              </div>

              <FormDescription className="text-xs flex items-center">
                <Info className="h-3 w-3 mr-1 text-muted-foreground" />
                Max {maxAttachments} files, {formatFileSize(maxTotalAttachmentSize)} total. Allowed
                types: images, documents, PDFs, and archives.
              </FormDescription>

              {(isMaxAttachmentCountReached || isMaxAttachmentSizeReached) && (
                <div className="mt-2 text-xs flex items-center text-destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {isMaxAttachmentCountReached
                    ? `Maximum of ${maxAttachments} attachments reached.`
                    : `Maximum attachment size of ${formatFileSize(
                        maxTotalAttachmentSize
                      )} reached.`}
                </div>
              )}

              {attachments.length > 0 && (
                <div className="mt-2">
                  <ScrollArea className="h-auto max-h-40">
                    <div className="space-y-2 pr-3">
                      {attachments.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-muted p-2 rounded"
                        >
                          <div className="flex flex-col flex-1 mr-2">
                            <span className="text-sm truncate max-w-[300px] font-medium">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                            {file.progress < 100 && (
                              <Progress value={file.progress} className="h-1 mt-1" />
                            )}
                            {file.error && (
                              <span className="text-xs text-destructive mt-1">{file.error}</span>
                            )}
                          </div>
                          {!readOnly && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAttachment(file.id)}
                              disabled={file.progress < 100 && file.progress > 0}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <ScrollBar />
                  </ScrollArea>
                </div>
              )}

              {replyTo?.attachments && replyTo.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center">
                    <FormLabel className="text-sm">Original Attachments</FormLabel>
                    <Badge variant="outline" className="ml-2">
                      {replyTo.attachments.length}
                    </Badge>
                  </div>
                  <div className="pl-4 border-l-2 border-muted space-y-2">
                    {replyTo.attachments.map(attachment => (
                      <div
                        key={attachment.id}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <Paperclip className="h-3 w-3 mr-1" />
                        <span className="truncate">{attachment.name}</span>
                        <span className="ml-1 text-xs">({formatFileSize(attachment.size)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div className="flex items-center space-x-2">
              {/* Email signature selector */}
              {!readOnly && (
                <div className="flex items-center">
                  <Select
                    value={selectedSignature}
                    onValueChange={setSelectedSignature}
                    disabled={readOnly || isLoadingSignatures}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Signature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No signature</SelectItem>
                      {isLoadingSignatures ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        signatures.map(sig => (
                          <SelectItem key={sig.id} value={sig.id}>
                            {sig.name} {sig.isDefault && '(Default)'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Draft status indicator */}
              {draftStatus && (
                <div className="flex items-center">
                  {draftStatus === 'saved' && lastSaved && (
                    <Badge variant="outline" className="gap-1 bg-green-50">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        Saved {lastSaved ? formatDate(lastSaved).split(',')[1] : ''}
                      </span>
                    </Badge>
                  )}

                  {draftStatus === 'saving' && (
                    <Badge variant="outline" className="gap-1">
                      <span className="h-3 w-3 mr-0.5">
                        <span className="animate-pulse">⋯</span>
                      </span>
                      <span className="text-xs">Saving...</span>
                    </Badge>
                  )}

                  {draftStatus === 'error' && (
                    <Badge variant="outline" className="gap-1 bg-red-50">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-600">Save failed</span>
                    </Badge>
                  )}
                </div>
              )}

              {/* Keyboard shortcuts */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowKeyboardShortcutsDialog(true)}
                    >
                      <span className="text-xs font-medium">?</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Keyboard shortcuts</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex justify-end space-x-2">
              {!readOnly && (
                <>
                  <Button type="button" variant="outline" onClick={saveDraft} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (unsavedChanges) {
                        setConfirmCancel(true);
                      } else if (onCancel) {
                        onCancel();
                      }
                    }}
                  >
                    Cancel
                  </Button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="submit" disabled={isSubmitting || !isFormValid}>
                          {watchScheduled ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              {isSubmitting ? 'Scheduling...' : 'Schedule'}
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              {isSubmitting ? 'Sending...' : 'Send'}
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send Email (Ctrl+Enter)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}

              {readOnly && (
                <Button type="button" onClick={onCancel}>
                  Close
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );

  // --------------------------
  // Main Render
  // --------------------------
  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="compose">
              <FileText className="h-4 w-4 mr-2" />
              Compose
            </TabsTrigger>
            {showTemplateSelector && (
              <TabsTrigger value="template">
                <AlignJustify className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex items-center space-x-2">
            {showAnalysis && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAnalysis(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Email
              </Button>
            )}

            {onAnalyze && !showAnalysis && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAnalyzeEmail}
                disabled={isAnalyzing || readOnly || !watchBody}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart className="h-4 w-4 mr-2" />
                    Analyze Email
                  </>
                )}
              </Button>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Email Settings</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          form.setValue('requestReadReceipt', !form.getValues().requestReadReceipt)
                        }
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>Request Read Receipt</span>
                          <Checkbox
                            checked={form.getValues().requestReadReceipt}
                            onCheckedChange={() => {}}
                            disabled={readOnly}
                          />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <div className="flex items-center justify-between w-full">
                          <span>Auto-Save Draft</span>
                          <Switch
                            checked={autoSaveEnabled}
                            onCheckedChange={setAutoSaveEnabled}
                            disabled={readOnly}
                          />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSpellCheckEnabled(!spellCheckEnabled)}>
                        <div className="flex items-center justify-between w-full">
                          <span>Spell Check</span>
                          <Switch
                            checked={spellCheckEnabled}
                            onCheckedChange={setSpellCheckEnabled}
                            disabled={readOnly}
                          />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Version History</DropdownMenuLabel>
                      {previousVersions.length > 0 ? (
                        previousVersions.map(version => (
                          <DropdownMenuItem
                            key={version.id}
                            disabled={readOnly || isRestoring}
                            onClick={() => handleRestorePreviousVersion(version.id)}
                          >
                            <div className="flex items-center">
                              <Undo className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div className="flex flex-col">
                                <span className="text-xs">{formatDate(version.timestamp)}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                                  {version.preview}
                                </span>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          No previous versions
                        </div>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Email Signature</DropdownMenuLabel>
                      <div className="px-2 py-1.5">
                        <Select
                          value={selectedSignature}
                          onValueChange={setSelectedSignature}
                          disabled={readOnly}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select signature" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No signature</SelectItem>
                            {signatures.map(sig => (
                              <SelectItem key={sig.id} value={sig.id}>
                                {sig.name} {sig.isDefault && '(Default)'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {hasPermission('manage_signatures') && (
                        <DropdownMenuItem asChild>
                          <a
                            href="/settings/signatures"
                            className="flex items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            <span>Manage Signatures</span>
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>Email Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!readOnly && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={saveDraft}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save Draft (Ctrl+S)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {showAnalysis ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <EmailAnalysisPanel
                  data={analysisData}
                  onClose={() => setShowAnalysis(false)}
                  onApplySuggestions={updatedContent => {
                    if (!readOnly) {
                      form.setValue('body', updatedContent);
                      setUnsavedChanges(true);
                      setShowAnalysis(false);

                      toast({
                        title: 'Suggestions applied',
                        description: 'The AI suggestions have been applied to your email.',
                      });
                    }
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="email-composer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="compose" className="mt-0">
                  {renderEmailForm()}
                </TabsContent>

                {renderTemplateSelector()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>

      {/* Dialogs */}
      {renderConfirmSendDialog()}
      {renderConfirmCancelDialog()}
      {renderKeyboardShortcutsDialog()}
    </div>
  );
}
