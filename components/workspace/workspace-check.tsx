// /components/workspace/workspace-check.tsx
'use client';

import { useWorkspace } from '@/context/workspace-context';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AcceptInvitation } from '@/components/workspace/invitation/accept-invitation';
import { useRouter, useSearchParams } from 'next/navigation';

export function WorkspaceCheck({ children }: { children: React.ReactNode }) {
  const { workspaces, isLoading, error, createWorkspace, acceptInvitation } = useWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for invitation token in URL
  useEffect(() => {
    const token = searchParams.get('invite');
    if (token) {
      setInviteToken(token);

      // Remove the token from the URL after reading it (for security)
      router.replace(window.location.pathname);
    }
  }, [searchParams, router]);

  // Accept invitation if token is present
  useEffect(() => {
    if (inviteToken) {
      const acceptInviteAsync = async () => {
        try {
          await acceptInvitation(inviteToken);
          setInviteToken(null);
        } catch (err) {
          setInviteError(err instanceof Error ? err.message : 'Failed to accept invitation');
        }
      };

      acceptInviteAsync();
    }
  }, [inviteToken, acceptInvitation]);

  // Check if we need to show the create workspace dialog
  useEffect(() => {
    if (!isLoading && workspaces.length === 0 && !error && !inviteToken) {
      setShowCreate(true);
    }
  }, [isLoading, workspaces, error, inviteToken]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      await createWorkspace({ name: workspaceName });
      setShowCreate(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // If there's an error with an invitation, show it
  if (inviteError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Invitation Error</h2>
          <p className="mb-4 text-muted-foreground">{inviteError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // If there's an error, display it
  if (error && !showCreate) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Something went wrong</h2>
          <p className="mb-4 text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // If we're processing an invitation, show a processing state
  if (inviteToken) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Accepting invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Your Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                  required
                />
              </div>
              {createError && <p className="text-sm text-destructive">{createError}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Render AcceptInvitation component when needed */}
      <AcceptInvitation />
    </>
  );
}
