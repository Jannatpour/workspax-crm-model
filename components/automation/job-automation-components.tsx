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
import { Loader2, Settings, Calendar, Clock, Database, Bell, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/sonner';

export function JobAutomationToggle() {
  const { settings, isLoading, toggleSetting } = useAutomation();
  const [isToggling, setIsToggling] = React.useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleSetting('scheduledJobsEnabled');
      toast({
        title: settings.scheduledJobsEnabled ? 'Job automation disabled' : 'Job automation enabled',
        description: settings.scheduledJobsEnabled
          ? 'Automated jobs will no longer run in the background.'
          : 'Automated jobs will now run in the background.',
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
      <Label htmlFor="job-automation">Job Automation</Label>
      <Switch
        id="job-automation"
        checked={settings.scheduledJobsEnabled}
        onCheckedChange={handleToggle}
        disabled={isToggling}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <AlertCircle className="h-4 w-4" />
            <span className="sr-only">Job automation info</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Job Automation</h4>
            <p className="text-sm text-muted-foreground">
              When enabled, scheduled tasks like data enrichment and reminders will run
              automatically in the background.
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

export function JobAutomationCard() {
  const { settings, isLoading, updateSettings } = useAutomation();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleToggleAllJobSettings = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      await updateSettings({
        scheduledJobsEnabled: enabled,
        dataEnrichmentEnabled: enabled,
        reminderJobsEnabled: enabled,
      });

      toast({
        title: enabled ? 'Job automation enabled' : 'Job automation disabled',
        description: enabled
          ? 'All job automation features have been enabled.'
          : 'All job automation features have been disabled.',
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
            <Clock className="h-5 w-5 mr-2" />
            <span>Job Automation</span>
          </CardTitle>
          <CardDescription>Configure background tasks and processes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const allJobsEnabled =
    settings.scheduledJobsEnabled && settings.dataEnrichmentEnabled && settings.reminderJobsEnabled;

  const allJobsDisabled =
    !settings.scheduledJobsEnabled &&
    !settings.dataEnrichmentEnabled &&
    !settings.reminderJobsEnabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          <span>Job Automation</span>
        </CardTitle>
        <CardDescription>Configure background tasks and processes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between bg-muted p-3 rounded-md">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="font-medium">Scheduled Jobs</span>
          </div>
          <Switch
            id="scheduled-jobs-toggle"
            checked={settings.scheduledJobsEnabled}
            onCheckedChange={checked => updateSettings({ scheduledJobsEnabled: checked })}
          />
        </div>

        <div className="pl-6 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="data-enrichment" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Data Enrichment
            </Label>
            <Switch
              id="data-enrichment"
              checked={settings.dataEnrichmentEnabled}
              onCheckedChange={checked => updateSettings({ dataEnrichmentEnabled: checked })}
              disabled={!settings.scheduledJobsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="reminder-jobs" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Reminder Jobs
            </Label>
            <Switch
              id="reminder-jobs"
              checked={settings.reminderJobsEnabled}
              onCheckedChange={checked => updateSettings({ reminderJobsEnabled: checked })}
              disabled={!settings.scheduledJobsEnabled}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => handleToggleAllJobSettings(false)}
          disabled={allJobsDisabled || isUpdating}
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Disable All
        </Button>
        <Button
          onClick={() => handleToggleAllJobSettings(true)}
          disabled={allJobsEnabled || isUpdating}
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Enable All
        </Button>
      </CardFooter>
    </Card>
  );
}
