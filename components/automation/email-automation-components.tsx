'use client';

import React from 'react';
import { useAutomation } from '@/context/automation-context';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Loader2, Settings, Mail, Bot, Lightbulb, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/sonner';

export function EmailAutomationToggle() {
  const { settings, isLoading, toggleSetting } = useAutomation();
  const [isToggling, setIsToggling] = React.useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleSetting('emailAnalysisEnabled');
      toast({
        title: settings.emailAnalysisEnabled
          ? 'Email automation disabled'
          : 'Email automation enabled',
        description: settings.emailAnalysisEnabled
          ? 'Emails will no longer be automatically analyzed.'
          : 'Your emails will now be automatically analyzed.',
      });
    } catch (error) {
      toast({
        title: 'Error updating settings',
        description: 'There was a problem updating your automation settings.',
        variant: 'destructive',
      });
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="email-automation">Email AI</Label>
      <Switch
        id="email-automation"
        checked={settings.emailAnalysisEnabled}
        onCheckedChange={handleToggle}
        disabled={isToggling}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <AlertCircle className="h-4 w-4" />
            <span className="sr-only">Email automation info</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Email Automation</h4>
            <p className="text-sm text-muted-foreground">
              When enabled, your emails will be analyzed by AI to extract insights, detect leads,
              and suggest responses.
            </p>
            <Separator />
            <Link
              href="/settings/automation"
              className="text-sm text-blue-600 hover:underline flex items-center"
            >
              <Settings className="h-3 w-3 mr-1" /> Configure automation settings
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function EmailAutomationCard() {
  const { settings, isLoading, updateSettings } = useAutomation();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleToggleAllEmailSettings = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      await updateSettings({
        emailAnalysisEnabled: enabled,
        leadDetectionEnabled: enabled,
        taskExtractionEnabled: enabled,
        eventDetectionEnabled: enabled,
        responseGenEnabled: enabled,
      });

      toast({
        title: enabled ? 'Email automation enabled' : 'Email automation disabled',
        description: enabled
          ? 'All email automation features have been enabled.'
          : 'All email automation features have been disabled.',
      });
    } catch (error) {
      toast({
        title: 'Error updating settings',
        description: 'There was a problem updating your automation settings.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            <span>Email Automation</span>
          </CardTitle>
          <CardDescription>Configure AI-powered email processing</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const allEmailEnabled =
    settings.emailAnalysisEnabled &&
    settings.leadDetectionEnabled &&
    settings.taskExtractionEnabled &&
    settings.eventDetectionEnabled &&
    settings.responseGenEnabled;

  const allEmailDisabled =
    !settings.emailAnalysisEnabled &&
    !settings.leadDetectionEnabled &&
    !settings.taskExtractionEnabled &&
    !settings.eventDetectionEnabled &&
    !settings.responseGenEnabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          <span>Email Automation</span>
        </CardTitle>
        <CardDescription>Configure AI-powered email processing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between bg-muted p-3 rounded-md">
          <div className="flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            <span className="font-medium">AI Email Processing</span>
          </div>
          <Switch
            id="email-ai-toggle"
            checked={settings.emailAnalysisEnabled}
            onCheckedChange={checked => updateSettings({ emailAnalysisEnabled: checked })}
          />
        </div>

        <div className="pl-6 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="lead-detection" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Lead Detection
            </Label>
            <Switch
              id="lead-detection"
              checked={settings.leadDetectionEnabled}
              onCheckedChange={checked => updateSettings({ leadDetectionEnabled: checked })}
              disabled={!settings.emailAnalysisEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="task-extraction" className="flex items-center">
              <ListTodo className="h-4 w-4 mr-2" />
              Task Extraction
            </Label>
            <Switch
              id="task-extraction"
              checked={settings.taskExtractionEnabled}
              onCheckedChange={checked => updateSettings({ taskExtractionEnabled: checked })}
              disabled={!settings.emailAnalysisEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="response-generation" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Response Generation
            </Label>
            <Switch
              id="response-generation"
              checked={settings.responseGenEnabled}
              onCheckedChange={checked => updateSettings({ responseGenEnabled: checked })}
              disabled={!settings.emailAnalysisEnabled}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => handleToggleAllEmailSettings(false)}
          disabled={allEmailDisabled || isUpdating}
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Disable All
        </Button>
        <Button
          onClick={() => handleToggleAllEmailSettings(true)}
          disabled={allEmailEnabled || isUpdating}
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Enable All
        </Button>
      </CardFooter>
    </Card>
  );
}

import { UserPlus, ListTodo, MessageSquare } from 'lucide-react';
