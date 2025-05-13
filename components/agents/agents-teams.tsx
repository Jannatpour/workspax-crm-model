'use client';
import React from 'react';
import { useDashboard } from '@/context/dashboard-context';

export function AgentsTeams() {
  const { changeSection } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Teams</h2>
          <p className="text-muted-foreground">Manage your AI agent teams</p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-md p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Agent Teams</h3>
        <p className="text-muted-foreground">
          This section will allow you to create and manage teams of AI agents that work together.
        </p>
      </div>
    </div>
  );
}
