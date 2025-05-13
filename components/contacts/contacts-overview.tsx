'use client';
import React from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { ContactsOverview as ContactsOverviewComponent } from '@/components/dashboard/contacts-overview';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload, Download } from 'lucide-react';

export function ContactsOverview() {
  const { changeSection } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
          <p className="text-muted-foreground">Manage your contact database</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => changeSection('contacts-import')}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={() => changeSection('contacts-export')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => changeSection('contacts-new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Contacts Overview */}
      <ContactsOverviewComponent showDetailedMetrics={true} enableAI={true} />
    </div>
  );
}
