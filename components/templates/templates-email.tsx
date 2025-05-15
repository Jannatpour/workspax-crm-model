'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

function TemplatesEmail() {
  const { changeSection } = useDashboard();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Manage your email templates</p>
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
          <Mail className="h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-semibold">Email Templates</h3>
          <p className="mb-4 mt-2 text-muted-foreground">
            This is a dedicated area for email templates. You can manage all your email templates
            from here.
          </p>
          <Button onClick={() => changeSection('templates', { action: 'create' })}>
            Create Email Template
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default TemplatesEmail;
