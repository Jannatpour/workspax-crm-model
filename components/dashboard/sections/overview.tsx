'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart4,
  Users,
  Mail,
  Calendar,
  ListTodo,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  User,
  FileText,
  Send,
  Inbox,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export function OverviewSection() {
  const { changeSection } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => changeSection('mail-compose')}>Compose Email</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-800">
                <Inbox className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Unread Emails</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">+5% </span>
              from last week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-800">
                <Send className="h-6 w-6 text-purple-700 dark:text-purple-300" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Sent Today</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">+12% </span>
              from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-800">
                <User className="h-6 w-6 text-amber-700 dark:text-amber-300" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
              <h3 className="text-2xl font-bold">1,248</h3>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">+2% </span>
              from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-800">
                <Bot className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
              </div>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">AI Agents</p>
              <h3 className="text-2xl font-bold">4</h3>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-muted-foreground font-medium">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="tasks">Tasks & Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Engagement</CardTitle>
              <CardDescription>Your email activity and response rates over time</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <div className="flex justify-center items-center h-full text-muted-foreground">
                [Email engagement chart would be displayed here]
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Growth</CardTitle>
                <CardDescription>New contacts added over time</CardDescription>
              </CardHeader>
              <CardContent className="h-60">
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  [Contact growth chart would be displayed here]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Performance</CardTitle>
                <CardDescription>Open rates, click rates, and engagement</CardDescription>
              </CardHeader>
              <CardContent className="h-60">
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  [Email performance metrics would be displayed here]
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions and system events</CardDescription>
            </CardHeader>
            <CardContent className="h-96 overflow-auto">
              <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                    <div
                      className={`rounded-full p-2 ${
                        i % 3 === 0
                          ? 'bg-blue-100 text-blue-700'
                          : i % 3 === 1
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {i % 3 === 0 ? (
                        <Mail className="h-4 w-4" />
                      ) : i % 3 === 1 ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {i % 3 === 0
                          ? 'Email sent to John Doe'
                          : i % 3 === 1
                          ? 'New contact added'
                          : 'Template created'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {i % 3 === 0
                          ? 'You sent an email regarding the project update'
                          : i % 3 === 1
                          ? 'Sarah Williams was added to your contacts'
                          : 'Created new welcome email template'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.floor(i * 2.5)} hour{i > 0 ? 's' : ''} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Tasks scheduled for today and tomorrow</CardDescription>
            </CardHeader>
            <CardContent className="h-80 overflow-auto">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 border-b pb-3 last:border-0">
                    <div className="rounded-md bg-primary/10 p-2">
                      <ListTodo className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Task {i + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        Due in {i + 1} hour{i > 0 ? 's' : ''}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Complete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Your upcoming meetings and events</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex justify-center items-center h-full text-muted-foreground">
                [Calendar view would be displayed here]
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
