'use client';
import React from 'react';
import { EmailStats } from '@/components/dashboard/email-stats';
import { RecentEmails } from '@/components/dashboard/recent-emails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export function MailInbox() {
  const { changeSection } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email</h2>
          <p className="text-muted-foreground">Manage your email communications</p>
        </div>
        <Button onClick={() => changeSection('mail-compose')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Compose Email
        </Button>
      </div>

      {/* Email dashboard content */}
      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="overview" onClick={() => changeSection('mail-inbox')}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="inbox" onClick={() => changeSection('mail-inbox')}>
            Inbox
          </TabsTrigger>
          <TabsTrigger value="sent" onClick={() => changeSection('mail-sent')}>
            Sent
          </TabsTrigger>
          <TabsTrigger value="drafts" onClick={() => changeSection('mail-drafts')}>
            Drafts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Email Stats */}
          <EmailStats showDetailedMetrics={true} defaultPeriod="30d" />

          {/* Recent Emails */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Recent Emails</h3>
            <RecentEmails
              limit={10}
              showCategories={true}
              autoRefresh={true}
              showActions={true}
              groupByTimePeriod={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="inbox">
          <RecentEmails initialFilters={{ category: 'primary' }} limit={50} showActions={true} />
        </TabsContent>

        <TabsContent value="sent">
          {/* Sent emails content */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Sent Emails</h3>
            {/* Content for sent emails */}
          </div>
        </TabsContent>

        <TabsContent value="drafts">
          {/* Drafts content */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Draft Emails</h3>
            {/* Content for draft emails */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
