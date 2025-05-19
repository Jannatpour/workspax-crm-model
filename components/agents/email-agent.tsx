'use client';

import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, Check, X, RefreshCw, BrainCircuit, Sparkle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgent } from '@/context/agent-context';
import { usePromptBuilder } from '@/lib/hooks/use-prompt-builder';

interface EmailAgentProps {
  email?: {
    id: string;
    subject: string;
    body: string;
    sender: string;
    receivedAt: string;
  };
  onSuggestionSelect?: (suggestion: EmailSuggestion) => void;
  onAnalysisComplete?: (analysis: EmailAnalysis) => void;
  variant?: 'sidebar' | 'panel' | 'modal';
  className?: string;
}

export interface EmailAnalysis {
  id: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  intents: string[];
  entities: {
    people: string[];
    organizations: string[];
    dates: string[];
    locations: string[];
    topics: string[];
  };
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
  responseNeeded: boolean;
  category: string;
  language: string;
  confidenceScore: number;
}

export interface EmailSuggestion {
  id: string;
  type: 'reply' | 'forward' | 'task' | 'meeting' | 'note';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

export function EmailAgent({
  email,
  onSuggestionSelect,
  onAnalysisComplete,
  variant = 'sidebar',
  className = '',
}: EmailAgentProps) {
  const {
    activeAgent: currentAgent,
    executeAgentAction,
    getModuleAgentConfig: getModuleConfig,
    isLoading: isAgentProcessing,
  } = useAgent();

  const { buildTaskPrompt } = usePromptBuilder();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState('analysis');
  const [error, setError] = useState<string | null>(null);

  // Get email module configuration
  const emailConfig = getModuleConfig('email');

  // Default settings if not provided
  const emailSettings = {
    autoAnalyze: true,
    autoSuggest: true,
    suggestionTypes: ['reply', 'task'],
    maxSuggestions: 3,
    ...emailConfig?.settings,
  };

  const isAgentEnabled = emailConfig?.isActive && currentAgent !== null;

  // Analyze email when it changes or when explicitly triggered
  useEffect(() => {
    if (email && isAgentEnabled && emailSettings.autoAnalyze) {
      analyzeEmail();
    }
  }, [email, isAgentEnabled]);

  // Function to analyze the email
  const analyzeEmail = async () => {
    if (!email || !isAgentEnabled) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      // Build the email analysis prompt
      const prompt = buildTaskPrompt('email_analysis', {
        subject: email.subject,
        body: email.body,
        sender: email.sender,
        date: email.receivedAt,
      });

      // Execute the email analysis action
      const result = await executeAgentAction(
        currentAgent?.id || '',
        'analyze_email',
        {
          emailId: email.id,
          prompt,
          includeEntities: true,
          includeSentiment: true,
          extractActionItems: true,
        },
        'email'
      ).then(res => res.output as EmailAnalysis);

      setAnalysis(result);
      onAnalysisComplete?.(result);

      // Also generate suggestions based on the analysis
      if (emailSettings.autoSuggest) {
        generateSuggestions(result);
      }
    } catch (err: any) {
      console.error('Error analyzing email:', err);
      setError(err.message || 'Failed to analyze email');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate response suggestions based on the analysis
  const generateSuggestions = async (emailAnalysis: EmailAnalysis) => {
    if (!email || !isAgentEnabled) return;

    try {
      // Execute the suggestion generation action
      const result = await executeAgentAction(
        currentAgent?.id || '',
        'generate_suggestions',
        {
          emailId: email.id,
          analysis: emailAnalysis,
          suggestionTypes: emailSettings.suggestionTypes,
          maxSuggestions: emailSettings.maxSuggestions,
        },
        'email'
      ).then(res => res.output as EmailSuggestion[]);

      setSuggestions(result);
    } catch (err: any) {
      console.error('Error generating suggestions:', err);
      setError(err.message || 'Failed to generate suggestions');
    }
  };

  // Handle selecting a suggestion
  const handleSuggestionSelect = (suggestion: EmailSuggestion) => {
    onSuggestionSelect?.(suggestion);
  };

  // Determine component size based on variant
  const sizeClass =
    variant === 'sidebar' ? 'max-w-xs' : variant === 'panel' ? 'max-w-md' : 'max-w-2xl';

  // If no email is selected or agent is disabled
  if (!email || !isAgentEnabled) {
    return (
      <Card className={`${sizeClass} ${className}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            Email Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            {!email ? 'Select an email to analyze' : 'Email assistant is disabled'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${sizeClass} ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            <span>{currentAgent?.name || 'Email Assistant'}</span>
            {isAnalyzing && <RefreshCw className="h-3 w-3 animate-spin ml-1" />}
          </CardTitle>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={analyzeEmail}
                  disabled={isAnalyzing || isAgentProcessing}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Analyze Email</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <CardDescription className="text-xs truncate">{email.subject}</CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-2 pt-2">
          {error && (
            <div className="bg-destructive/10 p-2 rounded-md flex items-center gap-2 text-xs">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span>{error}</span>
            </div>
          )}

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing email...</p>
            </div>
          ) : analysis ? (
            <CardContent className="px-2 py-0">
              <div className="space-y-3">
                {/* Summary */}
                <div>
                  <h4 className="text-xs font-medium mb-1">Summary</h4>
                  <p className="text-sm">{analysis.summary}</p>
                </div>

                {/* Sentiment & Priority */}
                <div className="flex items-center gap-2">
                  <div>
                    <h4 className="text-xs font-medium mb-1">Sentiment</h4>
                    <Badge
                      variant="outline"
                      className={`
                        ${analysis.sentiment === 'positive' ? 'bg-green-500/10 text-green-700' : ''}
                        ${analysis.sentiment === 'negative' ? 'bg-red-500/10 text-red-700' : ''}
                        ${analysis.sentiment === 'neutral' ? 'bg-blue-500/10 text-blue-700' : ''}
                        ${analysis.sentiment === 'mixed' ? 'bg-amber-500/10 text-amber-700' : ''}
                      `}
                    >
                      {analysis.sentiment}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium mb-1">Priority</h4>
                    <Badge
                      variant="outline"
                      className={`
                        ${analysis.priority === 'high' ? 'bg-red-500/10 text-red-700' : ''}
                        ${analysis.priority === 'medium' ? 'bg-amber-500/10 text-amber-700' : ''}
                        ${analysis.priority === 'low' ? 'bg-green-500/10 text-green-700' : ''}
                      `}
                    >
                      {analysis.priority}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium mb-1">Response</h4>
                    <div className="flex items-center">
                      {analysis.responseNeeded ? (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                          Needed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-700">
                          Optional
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Intent & Category */}
                <div>
                  <h4 className="text-xs font-medium mb-1">Intent</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.intents.map((intent, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {intent}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Items */}
                {analysis.actionItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">Action Items</h4>
                    <ul className="text-sm space-y-1">
                      {analysis.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-3 w-3 mt-1 text-green-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Entities */}
                <div>
                  <h4 className="text-xs font-medium mb-1">Key Entities</h4>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    {analysis.entities.people.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">People:</span>{' '}
                        {analysis.entities.people.join(', ')}
                      </div>
                    )}
                    {analysis.entities.organizations.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Orgs:</span>{' '}
                        {analysis.entities.organizations.join(', ')}
                      </div>
                    )}
                    {analysis.entities.dates.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Dates:</span>{' '}
                        {analysis.entities.dates.join(', ')}
                      </div>
                    )}
                    {analysis.entities.topics.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Topics:</span>{' '}
                        {analysis.entities.topics.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Mail className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">Click analyze to process this email</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={analyzeEmail}
                disabled={isAnalyzing}
              >
                Analyze Email
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-2 pt-2">
          {suggestions.length > 0 ? (
            <CardContent className="px-2 py-0">
              <div className="space-y-3">
                {suggestions.map(suggestion => (
                  <Card key={suggestion.id} className="overflow-hidden">
                    <CardHeader className="py-2 px-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`
                              ${suggestion.type === 'reply' ? 'bg-blue-500/10 text-blue-700' : ''}
                              ${
                                suggestion.type === 'task' ? 'bg-purple-500/10 text-purple-700' : ''
                              }
                              ${
                                suggestion.type === 'meeting'
                                  ? 'bg-amber-500/10 text-amber-700'
                                  : ''
                              }
                              ${suggestion.type === 'note' ? 'bg-gray-500/10 text-gray-700' : ''}
                              ${
                                suggestion.type === 'forward'
                                  ? 'bg-green-500/10 text-green-700'
                                  : ''
                              }
                            `}
                          >
                            {suggestion.type}
                          </Badge>
                          <span className="text-xs font-medium">{suggestion.title}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`
                            ${suggestion.priority === 'high' ? 'bg-red-500/10 text-red-700' : ''}
                            ${
                              suggestion.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-700'
                                : ''
                            }
                            ${suggestion.priority === 'low' ? 'bg-green-500/10 text-green-700' : ''}
                          `}
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="py-2 px-3">
                      <p className="text-xs whitespace-pre-line line-clamp-3">
                        {suggestion.content}
                      </p>
                    </CardContent>

                    <CardFooter className="py-1 px-3 bg-secondary/20 flex justify-between">
                      <div className="flex items-center">
                        <Sparkle className="h-3 w-3 text-amber-500 mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        Use
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Sparkle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                {analysis
                  ? 'No suggestions available yet'
                  : 'Analyze the email first to get suggestions'}
              </p>
              {analysis && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => generateSuggestions(analysis)}
                  disabled={isAgentProcessing}
                >
                  Generate Suggestions
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CardFooter className="px-3 py-2 text-xs text-muted-foreground border-t">
        <div className="flex justify-between w-full items-center">
          <span>Powered by {currentAgent?.name || 'AI'}</span>
          <Badge variant="outline" className="text-[10px] font-normal">
            {currentAgent?.modelType || 'AI'}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
