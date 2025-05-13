'use client';
import React, { useState } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/sonner';
import { FormEvent } from 'react';

export function SettingsEmail() {
  const { changeSection } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would call your actual API to save email settings
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Email settings saved',
        description: 'Your email account has been connected successfully.',
      });

      // Navigate back to settings
      changeSection('settings');
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description: 'There was an error connecting to your email account.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Settings</h2>
          <p className="text-muted-foreground">Configure your email accounts and preferences</p>
        </div>
        <Button variant="outline" onClick={() => changeSection('settings')}>
          Back to Settings
        </Button>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="account">Email Accounts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Connect Email Account</CardTitle>
              <CardDescription>Configure your email account settings</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="provider">Email Provider</Label>
                  <Select defaultValue="gmail">
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmail">Gmail</SelectItem>
                      <SelectItem value="outlook">Outlook</SelectItem>
                      <SelectItem value="imap">Custom IMAP/SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password">Password or App Password</Label>
                  <Input id="password" type="password" placeholder="••••••••••••" />
                  <p className="text-sm text-muted-foreground">
                    For Gmail, use an app password generated in your Google Account
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="block mb-1">Advanced Settings</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="imap_server">IMAP Server</Label>
                      <Input id="imap_server" placeholder="imap.gmail.com" />
                    </div>
                    <div>
                      <Label htmlFor="imap_port">IMAP Port</Label>
                      <Input id="imap_port" placeholder="993" />
                    </div>
                    <div>
                      <Label htmlFor="smtp_server">SMTP Server</Label>
                      <Input id="smtp_server" placeholder="smtp.gmail.com" />
                    </div>
                    <div>
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input id="smtp_port" placeholder="587" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="ssl" defaultChecked />
                  <Label htmlFor="ssl">Use SSL/TLS</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Connecting...' : 'Connect Account'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage your email templates</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Email templates content */}
              <p>Template management content would go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>Configure your email preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Send read receipts</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow senders to know when you've read their emails
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Auto-download attachments</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically download attachments from trusted senders
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new emails
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
