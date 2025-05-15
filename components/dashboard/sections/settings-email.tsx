'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Mail,
  ArrowLeft,
  Send,
  Check,
  X,
  RefreshCw,
  Clock,
  AlertCircle,
  ThumbsUp,
  MailOpen,
  MousePointerClick,
  Settings,
  Trash2,
  Plus,
  ListTodo,
  BadgeCheck,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboard } from '@/context/dashboard-context';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

// Email Connection Settings
const EmailConnectionSettings = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [provider, setProvider] = useState('aws');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    region: 'us-east-1',
    accessKey: 'AKIA1234567890EXAMPLE',
    secretKey: '****************************************',
    from: 'contact@workspax.com',
  });

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = () => {
    // In a real app, this would save the settings to the server
    console.log('Saving email settings:', formData);
    setEditMode(false);
  };

  const handleDisconnect = () => {
    // In a real app, this would disconnect the email provider
    setIsConnected(false);
  };

  const handleConnect = () => {
    // In a real app, this would connect to the email provider
    setIsConnected(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Provider</CardTitle>
        <CardDescription>Configure your email sending provider</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Provider Status</h3>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <X className="h-3 w-3" />
                Not Connected
              </Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Email Provider</h3>
              {isConnected && !editMode ? (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Edit Settings
                </Button>
              ) : (
                isConnected &&
                editMode && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                )
              )}
            </div>

            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 border rounded-md p-4">
                  <div className="h-12 w-12 flex-shrink-0 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.7 12.4V5.3c0-.3 0-.5-.2-.7-.2-.2-.4-.2-.7-.2h-6.3c-.5-.6-1.2-.9-2-.9-.7 0-1.5.3-2 .9H1.2c-.3 0-.5 0-.7.2-.2.2-.2.4-.2.7v14.2c0 .3 0 .5.2.7.2.2.4.2.7.2h17.6c.3 0 .5 0 .7-.2.2-.2.2-.4.2-.7v-2.9c.5-.5.8-1.2.8-1.9s-.3-1.4-.8-1.9z" />
                      <path d="M20.9 2.8h-9c-1.1 0-2 .9-2 2v3.5h7c1.1 0 2 .9 2 2v6.8h2c1.1 0 2-.9 2-2v-10c0-1.2-1-2.3-2-2.3z" />
                      <path d="M12.3 10.8h3.4c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-3.4c-.3 0-.5.2-.5.5s.2.5.5.5z" />
                      <path d="M15.7 12.5h-3.4c-.3 0-.5.2-.5.5s.2.5.5.5h3.4c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">AWS SES</h4>
                    <p className="text-sm text-muted-foreground">Amazon Simple Email Service</p>
                  </div>
                  {!editMode && (
                    <Button variant="outline" size="sm" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                  )}
                </div>

                {editMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                    <div className="space-y-2">
                      <Label htmlFor="aws-region">AWS Region</Label>
                      <Select
                        value={formData.region}
                        onValueChange={v => handleChange('region', v)}
                      >
                        <SelectTrigger id="aws-region">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                          <SelectItem value="us-east-2">US East (Ohio)</SelectItem>
                          <SelectItem value="us-west-1">US West (N. California)</SelectItem>
                          <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                          <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                          <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aws-access-key">AWS Access Key</Label>
                      <Input
                        id="aws-access-key"
                        value={formData.accessKey}
                        onChange={e => handleChange('accessKey', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aws-secret-key">AWS Secret Key</Label>
                      <Input
                        id="aws-secret-key"
                        type="password"
                        value={formData.secretKey}
                        onChange={e => handleChange('secretKey', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sender-email">Sender Email</Label>
                      <Input
                        id="sender-email"
                        type="email"
                        value={formData.from}
                        onChange={e => handleChange('from', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select an email provider to send emails from your application
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setProvider('aws')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.7 12.4V5.3c0-.3 0-.5-.2-.7-.2-.2-.4-.2-.7-.2h-6.3c-.5-.6-1.2-.9-2-.9-.7 0-1.5.3-2 .9H1.2c-.3 0-.5 0-.7.2-.2.2-.2.4-.2.7v14.2c0 .3 0 .5.2.7.2.2.4.2.7.2h17.6c.3 0 .5 0 .7-.2.2-.2.2-.4.2-.7v-2.9c.5-.5.8-1.2.8-1.9s-.3-1.4-.8-1.9z" />
                          <path d="M20.9 2.8h-9c-1.1 0-2 .9-2 2v3.5h7c1.1 0 2 .9 2 2v6.8h2c1.1 0 2-.9 2-2v-10c0-1.2-1-2.3-2-2.3z" />
                          <path d="M12.3 10.8h3.4c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-3.4c-.3 0-.5.2-.5.5s.2.5.5.5z" />
                          <path d="M15.7 12.5h-3.4c-.3 0-.5.2-.5.5s.2.5.5.5h3.4c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">AWS SES</h4>
                        <p className="text-xs text-muted-foreground">Amazon Simple Email Service</p>
                      </div>
                    </div>
                    <div
                      className={`mt-4 border-2 rounded-md p-2 ${
                        provider === 'aws' ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      {provider === 'aws' && <Check className="h-4 w-4 text-primary mx-auto" />}
                    </div>
                  </div>

                  <div
                    className="border rounded-md p-4 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setProvider('mailgun')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-red-100 flex items-center justify-center text-red-600">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 6v12l10 4 10-4V6L12 2zm7 14.18l-7 2.8v-2.04l4.8-1.92-.8-2-4 1.6v-2.04l.8-.32-.8-2L8 10.94v-1.88l4-1.6-.8-2-2.8 1.12.16-.06-.8-2L6 6.24V12l-1 .4v-9l7 2.8v13.12l7-2.8V8.88l-1-.4v8.2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Mailgun</h4>
                        <p className="text-xs text-muted-foreground">Mailgun Email API</p>
                      </div>
                    </div>
                    <div
                      className={`mt-4 border-2 rounded-md p-2 ${
                        provider === 'mailgun' ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      {provider === 'mailgun' && <Check className="h-4 w-4 text-primary mx-auto" />}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleConnect}>Continue Setup</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isConnected && (
          <>
            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Test Email Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Send a test email to verify your configuration
              </p>
              <div className="flex items-center gap-2">
                <Input placeholder="Enter test email address" />
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Email Templates Settings
const EmailTemplatesSettings = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Manage your email templates</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-all group">
              <div className="h-32 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                <MailOpen className="h-12 w-12 text-blue-400 dark:text-blue-500" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Welcome Email</h3>
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Sent to new users after signup</p>
                <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Preview
                  </Button>
                </div>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-all group">
              <div className="h-32 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex items-center justify-center">
                <ThumbsUp className="h-12 w-12 text-green-400 dark:text-green-500" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Thank You</h3>
                  <Badge variant="outline" className="text-xs">
                    Custom
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Thank you email for customers</p>
                <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Preview
                  </Button>
                </div>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-all group">
              <div className="h-32 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex items-center justify-center">
                <ListTodo className="h-12 w-12 text-purple-400 dark:text-purple-500" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Follow Up</h3>
                  <Badge variant="outline" className="text-xs">
                    Custom
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Follow up after meeting</p>
                <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              View All Templates
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Email Deliverability Settings
const EmailDeliverabilitySettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Deliverability</CardTitle>
        <CardDescription>Monitor and improve your email deliverability</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-md p-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <BadgeCheck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-center">Sender Reputation</h3>
              <p className="text-xl font-bold text-green-600 mt-2">Excellent</p>
            </div>
          </div>

          <div className="border rounded-md p-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <MailOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-center">Open Rate</h3>
              <p className="text-xl font-bold text-blue-600 mt-2">24.8%</p>
            </div>
          </div>

          <div className="border rounded-md p-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <MousePointerClick className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-center">Click Rate</h3>
              <p className="text-xl font-bold text-purple-600 mt-2">3.6%</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">DKIM & SPF Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure DKIM and SPF records to improve deliverability
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between border rounded-md p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">DKIM Record</h4>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                    Pending
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Add this TXT record to your DNS settings
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>

            <div className="flex items-center justify-between border rounded-md p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">SPF Record</h4>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  SPF record is properly configured
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Bounce Management</h3>
          <p className="text-sm text-muted-foreground">Configure how bounced emails are handled</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-suppress" className="flex-1">
                Automatically suppress bounced email addresses
              </Label>
              <Switch id="auto-suppress" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="bounce-notifications" className="flex-1">
                Receive bounce notifications
              </Label>
              <Switch id="bounce-notifications" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="retry-soft-bounce" className="flex-1">
                Retry soft bounces (maximum 3 attempts)
              </Label>
              <Switch id="retry-soft-bounce" defaultChecked={true} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Email Analytics Settings
const EmailAnalyticsSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Analytics</CardTitle>
        <CardDescription>Track and analyze your email performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Email Tracking</h3>
          <p className="text-sm text-muted-foreground">Configure email tracking settings</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="track-opens" className="flex-1">
                Track email opens
              </Label>
              <Switch id="track-opens" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="track-clicks" className="flex-1">
                Track link clicks
              </Label>
              <Switch id="track-clicks" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="track-replies" className="flex-1">
                Track email replies
              </Label>
              <Switch id="track-replies" defaultChecked={true} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Analytics Reports</h3>
          <p className="text-sm text-muted-foreground">Configure analytics report delivery</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-frequency">Report Frequency</Label>
              <Select defaultValue="weekly">
                <SelectTrigger id="report-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-recipients">Report Recipients</Label>
              <Input
                id="report-recipients"
                placeholder="email@example.com"
                defaultValue="john.doe@example.com"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Data Retention</h3>
          <p className="text-sm text-muted-foreground">
            Configure how long email analytics data is retained
          </p>

          <div className="space-y-2">
            <Label htmlFor="retention-period">Retention Period</Label>
            <Select defaultValue="365">
              <SelectTrigger id="retention-period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quota and Limits Settings
const QuotaSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quotas & Limits</CardTitle>
        <CardDescription>Monitor your email sending quotas and limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Daily Sending Quota</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Used Today</span>
              <span className="text-sm font-medium">248 / 10,000 emails</span>
            </div>
            <Progress value={2.48} className="h-2" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Your account is in the sandbox
              </p>
            </div>
            <Button size="sm" variant="outline">
              Request Production Access
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Sending Rate</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Limit</span>
              <span className="text-sm font-medium">14 emails per second</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Throttling Options</h3>
          <p className="text-sm text-muted-foreground">
            Configure email sending speed to improve deliverability
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-throttling" className="flex-1">
                Enable sending throttling
              </Label>
              <Switch id="enable-throttling" defaultChecked={true} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-per-second">Maximum Emails Per Second</Label>
                <Select defaultValue="10">
                  <SelectTrigger id="max-per-second">
                    <SelectValue placeholder="Select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 emails/second</SelectItem>
                    <SelectItem value="10">10 emails/second</SelectItem>
                    <SelectItem value="14">14 emails/second (Max)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="burst-rate">Burst Rate</Label>
                <Select defaultValue="50">
                  <SelectTrigger id="burst-rate">
                    <SelectValue placeholder="Select burst rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 emails</SelectItem>
                    <SelectItem value="50">50 emails</SelectItem>
                    <SelectItem value="100">100 emails</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function SettingsEmailSection() {
  const { changeSection } = useDashboard();
  const [activeTab, setActiveTab] = useState('connection');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeSection('settings')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Email Settings</h1>
        </div>
        <Button variant="outline" onClick={() => changeSection('settings')}>
          Back to Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto mb-4">
          <TabsTrigger value="connection" className="flex-1">
            <Mail className="h-4 w-4 mr-2" />
            Connection
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="deliverability" className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Deliverability
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="quota" className="flex-1">
            <Clock className="h-4 w-4 mr-2" />
            Quota
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <EmailConnectionSettings />
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplatesSettings />
        </TabsContent>

        <TabsContent value="deliverability">
          <EmailDeliverabilitySettings />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalyticsSettings />
        </TabsContent>

        <TabsContent value="quota">
          <QuotaSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
