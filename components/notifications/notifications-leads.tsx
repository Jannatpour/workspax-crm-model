'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationsLeads() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lead Notifications</h1>
        <Button variant="outline">Mark all as read</Button>
      </div>

      <div className="space-y-4">
        {/* Empty state */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Mail className="h-4 w-4 mr-2 text-blue-500" />
              No lead notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>You have no new lead notifications at this time.</CardDescription>
            <div className="mt-4">
              <Button variant="link" className="p-0 h-auto flex items-center">
                Go to Leads <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
