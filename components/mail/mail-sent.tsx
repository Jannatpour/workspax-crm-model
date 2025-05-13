'use client';
import React from 'react';
import { useDashboard } from '@/context/dashboard-context';

// This is a placeholder component for mail sent view
export function MailSent() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sent Mail</h2>
      </div>

      <div className="bg-muted/30 rounded-md p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Sent Emails</h3>
        <p className="text-muted-foreground">This is where your sent emails will appear.</p>
      </div>
    </div>
  );
}
