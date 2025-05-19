'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export function WorkflowsAutomations() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workflow Automations</h1>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Empty state */}
        {true && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No automations configured</CardTitle>
              <CardDescription>
                Set up automations to streamline your workflow processes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Create your first automation</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
