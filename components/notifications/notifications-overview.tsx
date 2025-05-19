'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, Calendar, AlertTriangle } from 'lucide-react';

export function NotificationsOverview() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="urgent">Urgent</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-blue-500" />
                  No new notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  You're all caught up! Check back later for new notifications.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  No lead notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>You have no new lead notifications at this time.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  No task notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>You have no new task notifications at this time.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  No event notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>You have no new event notifications at this time.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="urgent">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  No urgent notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>You have no urgent notifications at this time.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
