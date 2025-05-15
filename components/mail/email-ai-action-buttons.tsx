'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  Sparkles,
  MessageCircle,
  UserPlus,
  ListTodo,
  CalendarDays,
  Wand2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { EmailAIService } from '@/lib/services/email-ai-service';

interface EmailAIButtonProps {
  emailId: string;
  disabled?: boolean;
  onComplete?: (result?: any) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function EmailAIAnalyzeButton({
  emailId,
  disabled = false,
  onComplete,
  size = 'default',
  variant = 'outline',
}: EmailAIButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the EmailAIService
      // const result = await EmailAIService.analyzeEmail({
      //   emailId,
      //   fullText: true,
      //   processAttachments: true,
      //   detectLeads: true,
      //   extractTasks: true,
      //   extractEvents: true,
      //   generateResponse: true,
      //   userId: 'current-user-id', // Would be from auth context
      //   workspaceId: 'current-workspace-id'  // Would be from workspace context
      // });

      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = { id: 'analysis-123' };

      toast({
        title: 'Email Analyzed',
        description: 'AI has analyzed the email content and extracted insights',
        icon: <BrainCircuit className="h-4 w-4 text-purple-500" />,
      });

      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Error analyzing email:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not complete email analysis',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={handleAnalyze}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <BrainCircuit className="h-4 w-4" />
          <span>Analyze with AI</span>
        </>
      )}
    </Button>
  );
}

export function EmailAIResponseButton({
  emailId,
  disabled = false,
  onComplete,
  size = 'default',
  variant = 'outline',
}: EmailAIButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleGenerateResponse = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call the EmailAIService
      // const response = await EmailAIService.generateEmailResponse({
      //   emailId,
      //   tone: 'professional',
      //   includeGreeting: true,
      //   includeSignature: true,
      //   responseType: 'full',
      //   userId: 'current-user-id' // Would be from auth context
      // });

      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = 'Thank you for your email. I have reviewed the information you shared...';

      toast({
        title: 'Response Generated',
        description: 'AI has generated a response based on the email content',
        icon: <MessageCircle className="h-4 w-4 text-green-500" />,
      });

      if (onComplete) {
        onComplete(response);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate an email response',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={handleGenerateResponse}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4" />
          <span>Generate Response</span>
        </>
      )}
    </Button>
  );
}

export function EmailAIActions({
  emailId,
  disabled = false,
}: {
  emailId: string;
  disabled?: boolean;
}) {
  const [extractingLeads, setExtractingLeads] = React.useState(false);
  const [extractingTasks, setExtractingTasks] = React.useState(false);
  const [extractingEvents, setExtractingEvents] = React.useState(false);

  const handleExtractLeads = async () => {
    setExtractingLeads(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Leads Extracted',
        description: 'AI has identified potential leads from the email',
        icon: <UserPlus className="h-4 w-4 text-green-500" />,
      });
    } catch (error) {
      console.error('Error extracting leads:', error);
      toast({
        title: 'Extraction Failed',
        description: 'Could not extract leads from the email',
        variant: 'destructive',
      });
    } finally {
      setExtractingLeads(false);
    }
  };

  const handleExtractTasks = async () => {
    setExtractingTasks(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Tasks Extracted',
        description: 'AI has identified tasks from the email content',
        icon: <ListTodo className="h-4 w-4 text-blue-500" />,
      });
    } catch (error) {
      console.error('Error extracting tasks:', error);
      toast({
        title: 'Extraction Failed',
        description: 'Could not extract tasks from the email',
        variant: 'destructive',
      });
    } finally {
      setExtractingTasks(false);
    }
  };

  const handleExtractEvents = async () => {
    setExtractingEvents(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Events Extracted',
        description: 'AI has identified calendar events from the email',
        icon: <CalendarDays className="h-4 w-4 text-indigo-500" />,
      });
    } catch (error) {
      console.error('Error extracting events:', error);
      toast({
        title: 'Extraction Failed',
        description: 'Could not extract events from the email',
        variant: 'destructive',
      });
    } finally {
      setExtractingEvents(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || extractingLeads}
        onClick={handleExtractLeads}
        className="gap-1"
      >
        {extractingLeads ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserPlus className="h-3.5 w-3.5 text-green-500" />
        )}
        <span>Extract Leads</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={disabled || extractingTasks}
        onClick={handleExtractTasks}
        className="gap-1"
      >
        {extractingTasks ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ListTodo className="h-3.5 w-3.5 text-blue-500" />
        )}
        <span>Extract Tasks</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={disabled || extractingEvents}
        onClick={handleExtractEvents}
        className="gap-1"
      >
        {extractingEvents ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
        )}
        <span>Extract Events</span>
      </Button>
    </div>
  );
}
