'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

// Import section previews
import { EmailStats } from '@/components/dashboard/email-stats';
import { RecentEmails } from '@/components/dashboard/recent-emails';
import { ContactsOverview } from '@/components/dashboard/contacts-overview';
import { CalendarView } from '@/components/dashboard/calendar-view';
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';

export function DashboardOverview() {
  const { changeSection } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your WorkspaxCRM dashboard</p>
      </div>

      {/* Email Section Preview */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Email</h3>
          <Button variant="ghost" size="sm" onClick={() => changeSection('mail-inbox')}>
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Email Activity</CardTitle>
              <CardDescription>Your email sending and response patterns</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64">
                <EmailStats />
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Emails</CardTitle>
              <CardDescription>Your most recent conversations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 overflow-auto">
                <RecentEmails limit={3} showCategories={false} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contacts Section Preview */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Contacts</h3>
          <Button variant="ghost" size="sm" onClick={() => changeSection('contacts')}>
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contacts Overview</CardTitle>
            <CardDescription>Distribution of your contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ContactsOverview showDetailedMetrics={false} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Calendar & Tasks Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendar Preview */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Calendar</h3>
            <Button variant="ghost" size="sm" onClick={() => changeSection('calendar')}>
              View Calendar <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="h-64">
                <CalendarView />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tasks Preview */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <Button variant="ghost" size="sm" onClick={() => changeSection('tasks')}>
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="h-64 overflow-auto">
                <UpcomingTasks limit={5} />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* AI Agents Preview */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">AI Agents</h3>
          <Button variant="ghost" size="sm" onClick={() => changeSection('agents')}>
            Manage Agents <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="p-6 text-center">
              <p className="text-muted-foreground">4 AI agents active and running</p>
              <Button className="mt-4" onClick={() => changeSection('agents')}>
                Create New Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
