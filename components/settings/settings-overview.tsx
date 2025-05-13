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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight } from 'lucide-react';

export function SettingsOverview() {
  const { changeSection } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Configure your workspace settings</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>Configure your email accounts and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure SMTP/IMAP settings, email templates, signatures, and more.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => changeSection('settings-email')}>
                  Manage Email Settings <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Change theme, layout options, and display preferences.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  Customize Appearance <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teams & Permissions</CardTitle>
                <CardDescription>Manage team members and access controls</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Invite team members, set roles, and configure permissions.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  Manage Team <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>Manage your subscription and payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View usage, update payment methods, and manage your plan.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  Manage Billing <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <div className="mt-6 bg-muted/30 rounded-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">Account Settings</h3>
            <p className="text-muted-foreground">
              This tab will contain account management options.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="mt-6 bg-muted/30 rounded-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">Integrations</h3>
            <p className="text-muted-foreground">Connect with other services and apps.</p>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="mt-6 bg-muted/30 rounded-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">Notification Settings</h3>
            <p className="text-muted-foreground">
              Configure how and when you receive notifications.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
