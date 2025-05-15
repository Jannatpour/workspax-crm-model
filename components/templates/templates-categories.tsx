'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, ArrowLeft } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

function TemplatesCategories() {
  const { changeSection } = useDashboard();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Categories</h1>
          <p className="text-muted-foreground">Organize your templates by category</p>
        </div>
        <Button
          variant="outline"
          onClick={() => changeSection('templates')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Templates
        </Button>
      </div>

      <Card className="text-center py-12">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center">
          <Palette className="h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-semibold">Template Categories</h3>
          <p className="mb-4 mt-2 text-muted-foreground">
            Manage and create categories to organize your templates.
          </p>
          <Button onClick={() => changeSection('templates')}>View All Categories</Button>
        </div>
      </Card>
    </div>
  );
}

export default TemplatesCategories;
