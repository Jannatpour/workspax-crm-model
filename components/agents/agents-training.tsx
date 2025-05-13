'use client';
import React from 'react';
import { useDashboard } from '@/context/dashboard-context';

export function AgentsTraining() {
  const { changeSection } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Training</h2>
          <p className="text-muted-foreground">Train your AI agents for better performance</p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-md p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Training Center</h3>
        <p className="text-muted-foreground">
          This section will allow you to upload training data and fine-tune your AI agents.
        </p>
      </div>
    </div>
  );
}
