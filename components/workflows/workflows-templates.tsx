'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export function WorkflowsTemplates() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workflow Templates</h1>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Empty state */}
        {true && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No workflow templates</CardTitle>
              <CardDescription>
                Create reusable workflow templates to standardize your processes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">Create your first template</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
