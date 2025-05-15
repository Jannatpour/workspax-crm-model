'use client';

import React from 'react';
import { useAutomation } from '@/context/automation-context';
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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail,
  UserPlus,
  Calendar,
  ListTodo,
  Clock,
  Database,
  Bell,
  RefreshCw,
  Save,
  AlertTriangle,
} from 'lucide-react';

export default function AutomationSettings() {
  const { settings, isLoading, error, updateSettings } = useAutomation();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const [localSettings, setLocalSettings] = React.useState(settings);

  // Update local settings when the context settings load or change
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggle = (setting: keyof typeof settings) => {
    const newSettings = {
      ...localSettings,
      [setting]: !localSettings[setting],
    };
    setLocalSettings(newSettings);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      setIsDirty(false);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setIsDirty(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8">Automation Settings</h1>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Automation Settings</h1>
        <div className="flex space-x-2">
          {isDirty && (
            <>
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="email" className="mb-6">
        <TabsList className="grid grid-cols-3 w-full md:w-[600px]">
          <TabsTrigger value="email">Email Automation</TabsTrigger>
          <TabsTrigger value="jobs">Job Automation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Automation Settings</CardTitle>
              <CardDescription>Configure how AI analyzes and processes your emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    <Label htmlFor="emailAnalysisEnabled" className="font-medium">
                      Email Analysis
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI will analyze incoming and outgoing emails for insights
                  </p>
                </div>
                <Switch
                  id="emailAnalysisEnabled"
                  checked={localSettings.emailAnalysisEnabled}
                  onCheckedChange={() => handleToggle('emailAnalysisEnabled')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <Label htmlFor="leadDetectionEnabled" className="font-medium">
                      Lead Detection
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect and create leads from email conversations
                  </p>
                </div>
                <Switch
                  id="leadDetectionEnabled"
                  checked={localSettings.leadDetectionEnabled}
                  onCheckedChange={() => handleToggle('leadDetectionEnabled')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <ListTodo className="mr-2 h-4 w-4" />
                    <Label htmlFor="taskExtractionEnabled" className="font-medium">
                      Task Extraction
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Extract tasks and to-dos from emails automatically
                  </p>
                </div>
                <Switch
                  id="taskExtractionEnabled"
                  checked={localSettings.taskExtractionEnabled}
                  onCheckedChange={() => handleToggle('taskExtractionEnabled')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <Label htmlFor="eventDetectionEnabled" className="font-medium">
                      Event Detection
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detect meetings and events from emails and add to calendar
                  </p>
                </div>
                <Switch
                  id="eventDetectionEnabled"
                  checked={localSettings.eventDetectionEnabled}
                  onCheckedChange={() => handleToggle('eventDetectionEnabled')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    <Label htmlFor="responseGenEnabled" className="font-medium">
                      Response Generation
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate AI-powered email responses for you to review
                  </p>
                </div>
                <Switch
                  id="responseGenEnabled"
                  checked={localSettings.responseGenEnabled}
                  onCheckedChange={() => handleToggle('responseGenEnabled')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job Automation Settings</CardTitle>
              <CardDescription>Configure automated background tasks and processes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <Label htmlFor="scheduledJobsEnabled" className="font-medium">
                      Scheduled Jobs
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow system to run scheduled tasks and processes
                  </p>
                </div>
                <Switch
                  id="scheduledJobsEnabled"
                  checked={localSettings.scheduledJobsEnabled}
                  onCheckedChange={() => handleToggle('scheduledJobsEnabled')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <Database className="mr-2 h-4 w-4" />
                    <Label htmlFor="dataEnrichmentEnabled" className="font-medium">
                      Data Enrichment
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically enrich contact and company data
                  </p>
                </div>
                <Switch
                  id="dataEnrichmentEnabled"
                  checked={localSettings.dataEnrichmentEnabled}
                  onCheckedChange={() => handleToggle('dataEnrichmentEnabled')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    <Label htmlFor="reminderJobsEnabled" className="font-medium">
                      Reminder Jobs
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Process and deliver scheduled reminders and follow-ups
                  </p>
                </div>
                <Switch
                  id="reminderJobsEnabled"
                  checked={localSettings.reminderJobsEnabled}
                  onCheckedChange={() => handleToggle('reminderJobsEnabled')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications about automated activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    <Label htmlFor="notificationsEnabled" className="font-medium">
                      Automation Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about AI actions and automations
                  </p>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={localSettings.notificationsEnabled}
                  onCheckedChange={() => handleToggle('notificationsEnabled')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
