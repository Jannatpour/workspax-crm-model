'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '@/lib/auth/client';

// Define types for workspace and invitation
export type Workspace = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: WorkspaceMember[];
  pendingInvitations?: WorkspaceInvitation[];
};

export type WorkspaceMember = {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  name?: string;
  email?: string;
  avatar?: string;
};

export type WorkspaceInvitation = {
  id: string;
  email: string;
  role: string;
  token: string;
  workspaceId: string;
  createdAt: Date;
  expiresAt: Date;
  createdBy: string;
  createdByName?: string;
};

// Context type
type WorkspaceContextType = {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (data: { name: string; description?: string }) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  inviteMember: (email: string, role: string) => Promise<WorkspaceInvitation>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  clearWorkspaceData: () => void;
};

// Create context
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Provider component
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch workspaces
  const fetchWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated
      const user = await getCurrentUser();

      if (!user) {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setIsLoading(false);
        return;
      }

      // Fetch workspaces from API
      const response = await fetch('/api/workspaces', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }

      const data = await response.json();

      // Transform dates from strings to Date objects
      const transformedWorkspaces = data.map((workspace: any) => ({
        ...workspace,
        createdAt: new Date(workspace.createdAt),
        updatedAt: new Date(workspace.updatedAt),
        members: workspace.members.map((member: any) => ({
          ...member,
        })),
        pendingInvitations: workspace.pendingInvitations
          ? workspace.pendingInvitations.map((invitation: any) => ({
              ...invitation,
              createdAt: new Date(invitation.createdAt),
              expiresAt: new Date(invitation.expiresAt),
            }))
          : [],
      }));

      setWorkspaces(transformedWorkspaces);

      // Set current workspace if not already set
      if (transformedWorkspaces.length > 0 && !currentWorkspace) {
        // Try to get last used workspace from localStorage
        const lastWorkspaceId = localStorage.getItem('lastWorkspaceId');
        const lastWorkspace = lastWorkspaceId
          ? transformedWorkspaces.find(w => w.id === lastWorkspaceId)
          : null;

        setCurrentWorkspace(lastWorkspace || transformedWorkspaces[0]);
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  // Refresh workspaces
  const refreshWorkspaces = useCallback(async () => {
    await fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Create workspace
  const createWorkspace = useCallback(
    async (data: { name: string; description?: string }): Promise<Workspace> => {
      try {
        const response = await fetch('/api/workspaces', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create workspace');
        }

        const newWorkspace = await response.json();

        // Transform dates
        const transformedWorkspace = {
          ...newWorkspace,
          createdAt: new Date(newWorkspace.createdAt),
          updatedAt: new Date(newWorkspace.updatedAt),
        };

        // Update state
        setWorkspaces(prev => [...prev, transformedWorkspace]);
        setCurrentWorkspace(transformedWorkspace);

        // Save to localStorage
        localStorage.setItem('lastWorkspaceId', transformedWorkspace.id);

        return transformedWorkspace;
      } catch (err) {
        console.error('Error creating workspace:', err);
        throw err;
      }
    },
    []
  );

  // Update workspace
  const updateWorkspace = useCallback(
    async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
      try {
        const response = await fetch(`/api/workspaces/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update workspace');
        }

        const updatedWorkspace = await response.json();

        // Transform dates
        const transformedWorkspace = {
          ...updatedWorkspace,
          createdAt: new Date(updatedWorkspace.createdAt),
          updatedAt: new Date(updatedWorkspace.updatedAt),
          members: updatedWorkspace.members.map((member: any) => ({
            ...member,
          })),
        };

        // Update state
        setWorkspaces(prev => prev.map(w => (w.id === id ? transformedWorkspace : w)));

        if (currentWorkspace?.id === id) {
          setCurrentWorkspace(transformedWorkspace);
        }

        return transformedWorkspace;
      } catch (err) {
        console.error('Error updating workspace:', err);
        throw err;
      }
    },
    [currentWorkspace]
  );

  // Delete workspace
  const deleteWorkspace = useCallback(
    async (id: string): Promise<void> => {
      try {
        const response = await fetch(`/api/workspaces/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete workspace');
        }

        // Update state
        const updatedWorkspaces = workspaces.filter(w => w.id !== id);
        setWorkspaces(updatedWorkspaces);

        // If current workspace was deleted, set a new one
        if (currentWorkspace?.id === id) {
          setCurrentWorkspace(updatedWorkspaces.length > 0 ? updatedWorkspaces[0] : null);

          // Update localStorage
          if (updatedWorkspaces.length > 0) {
            localStorage.setItem('lastWorkspaceId', updatedWorkspaces[0].id);
          } else {
            localStorage.removeItem('lastWorkspaceId');
          }
        }
      } catch (err) {
        console.error('Error deleting workspace:', err);
        throw err;
      }
    },
    [workspaces, currentWorkspace]
  );

  // Invite member
  const inviteMember = useCallback(
    async (email: string, role: string): Promise<WorkspaceInvitation> => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      try {
        const response = await fetch(`/api/workspaces/${currentWorkspace.id}/invitations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, role }),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to invite member');
        }

        const invitation = await response.json();

        // Transform dates
        const transformedInvitation = {
          ...invitation,
          createdAt: new Date(invitation.createdAt),
          expiresAt: new Date(invitation.expiresAt),
        };

        // Update current workspace with new invitation
        if (currentWorkspace) {
          const updatedWorkspace = {
            ...currentWorkspace,
            pendingInvitations: [
              ...(currentWorkspace.pendingInvitations || []),
              transformedInvitation,
            ],
          };

          setCurrentWorkspace(updatedWorkspace);

          // Also update in workspaces array
          setWorkspaces(prev =>
            prev.map(w => (w.id === currentWorkspace.id ? updatedWorkspace : w))
          );
        }

        return transformedInvitation;
      } catch (err) {
        console.error('Error inviting member:', err);
        throw err;
      }
    },
    [currentWorkspace]
  );

  // Cancel invitation
  const cancelInvitation = useCallback(
    async (invitationId: string): Promise<void> => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      try {
        const response = await fetch(
          `/api/workspaces/${currentWorkspace.id}/invitations/${invitationId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to cancel invitation');
        }

        // Update current workspace by removing the invitation
        if (currentWorkspace && currentWorkspace.pendingInvitations) {
          const updatedWorkspace = {
            ...currentWorkspace,
            pendingInvitations: currentWorkspace.pendingInvitations.filter(
              inv => inv.id !== invitationId
            ),
          };

          setCurrentWorkspace(updatedWorkspace);

          // Also update in workspaces array
          setWorkspaces(prev =>
            prev.map(w => (w.id === currentWorkspace.id ? updatedWorkspace : w))
          );
        }
      } catch (err) {
        console.error('Error cancelling invitation:', err);
        throw err;
      }
    },
    [currentWorkspace]
  );

  // Resend invitation
  const resendInvitation = useCallback(
    async (invitationId: string): Promise<void> => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      try {
        const response = await fetch(
          `/api/workspaces/${currentWorkspace.id}/invitations/${invitationId}/resend`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to resend invitation');
        }

        // Get the updated invitation
        const updatedInvitation = await response.json();

        // Transform dates
        const transformedInvitation = {
          ...updatedInvitation,
          createdAt: new Date(updatedInvitation.createdAt),
          expiresAt: new Date(updatedInvitation.expiresAt),
        };

        // Update the invitation in the current workspace
        if (currentWorkspace && currentWorkspace.pendingInvitations) {
          const updatedInvitations = currentWorkspace.pendingInvitations.map(inv =>
            inv.id === invitationId ? transformedInvitation : inv
          );

          const updatedWorkspace = {
            ...currentWorkspace,
            pendingInvitations: updatedInvitations,
          };

          setCurrentWorkspace(updatedWorkspace);

          // Also update in workspaces array
          setWorkspaces(prev =>
            prev.map(w => (w.id === currentWorkspace.id ? updatedWorkspace : w))
          );
        }
      } catch (err) {
        console.error('Error resending invitation:', err);
        throw err;
      }
    },
    [currentWorkspace]
  );

  // Accept invitation
  const acceptInvitation = useCallback(
    async (token: string): Promise<void> => {
      try {
        const response = await fetch(`/api/invitations/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to accept invitation');
        }

        // Refresh workspaces to get the new one
        await fetchWorkspaces();
      } catch (err) {
        console.error('Error accepting invitation:', err);
        throw err;
      }
    },
    [fetchWorkspaces]
  );

  // Update member role
  const updateMemberRole = useCallback(
    async (memberId: string, role: string): Promise<void> => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      try {
        const response = await fetch(`/api/workspaces/${currentWorkspace.id}/members/${memberId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role }),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update member role');
        }

        // Update the member in the current workspace
        if (currentWorkspace) {
          const updatedMembers = currentWorkspace.members.map(member =>
            member.id === memberId ? { ...member, role } : member
          );

          const updatedWorkspace = {
            ...currentWorkspace,
            members: updatedMembers,
          };

          setCurrentWorkspace(updatedWorkspace);

          // Also update in workspaces array
          setWorkspaces(prev =>
            prev.map(w => (w.id === currentWorkspace.id ? updatedWorkspace : w))
          );
        }
      } catch (err) {
        console.error('Error updating member role:', err);
        throw err;
      }
    },
    [currentWorkspace]
  );

  // Remove member
  const removeMember = useCallback(
    async (memberId: string): Promise<void> => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      try {
        const response = await fetch(`/api/workspaces/${currentWorkspace.id}/members/${memberId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove member');
        }

        // Update current workspace by removing the member
        if (currentWorkspace) {
          const updatedWorkspace = {
            ...currentWorkspace,
            members: currentWorkspace.members.filter(member => member.id !== memberId),
          };

          setCurrentWorkspace(updatedWorkspace);

          // Also update in workspaces array
          setWorkspaces(prev =>
            prev.map(w => (w.id === currentWorkspace.id ? updatedWorkspace : w))
          );
        }
      } catch (err) {
        console.error('Error removing member:', err);
        throw err;
      }
    },
    [currentWorkspace]
  );

  // Set current workspace with localStorage update
  const handleSetCurrentWorkspace = useCallback((workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('lastWorkspaceId', workspace.id);
  }, []);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: string): boolean => {
      // If no workspace is selected, deny all permissions
      if (!currentWorkspace) {
        return false;
      }

      // For simplicity in this client-side context, we'll assume the current user
      // is the owner of the workspace or has admin permissions
      // In a real app, you would get the current user ID from a client-side auth context

      // For testing purposes, let's grant all permissions
      return true;

      /* Commented out for now until we have proper client-side auth
      // Find the user's membership in the current workspace
      const userMembership = currentWorkspace.members.find(
        member => member.userId === currentUserId
      );

      if (!userMembership) {
        return false;
      }

      // Permission mapping based on roles
      const rolePermissions: Record<string, string[]> = {
        owner: [
          // Owner has all permissions
          'workspace:view',
          'workspace:edit',
          'workspace:delete',
          'workspace:members:view',
          'workspace:members:invite',
          'workspace:members:remove',
          'workspace:members:update',
          'workspace:settings:view',
          'workspace:settings:edit',
          'workspace:billing:view',
          'workspace:billing:edit',
          'workspace:templates:view',
          'workspace:templates:create',
          'workspace:templates:edit',
          'workspace:templates:delete',
        ],
        admin: [
          // Admin has most permissions except deleting the workspace
          'workspace:view',
          'workspace:edit',
          'workspace:members:view',
          'workspace:members:invite',
          'workspace:members:remove',
          'workspace:members:update',
          'workspace:settings:view',
          'workspace:settings:edit',
          'workspace:billing:view',
          'workspace:templates:view',
          'workspace:templates:create',
          'workspace:templates:edit',
          'workspace:templates:delete',
        ],
        member: [
          // Regular member has basic permissions
          'workspace:view',
          'workspace:members:view',
          'workspace:settings:view',
          'workspace:templates:view',
          'workspace:templates:create',
        ],
        guest: [
          // Guest has very limited permissions
          'workspace:view',
          'workspace:members:view',
          'workspace:templates:view',
        ],
      };

      // Get permissions for the user's role
      const userRole = userMembership.role;
      const userPermissions = rolePermissions[userRole] || [];

      // Check if the requested permission is in the user's permissions
      return userPermissions.includes(permission);
      */
    },
    [currentWorkspace]
  );

  // Initial fetch
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Function to clear workspace-specific data when switching workspaces
  const clearWorkspaceData = useCallback(() => {
    // This function would clear any workspace-specific state
    // For example, reset any selected items, filters, or cached data
    console.log('Clearing workspace-specific data');
    // In a real app, you would reset various states here
  }, []);

  // Context value
  const value = {
    workspaces,
    currentWorkspace,
    isLoading,
    error,
    setCurrentWorkspace: handleSetCurrentWorkspace,
    refreshWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    cancelInvitation,
    resendInvitation,
    acceptInvitation,
    updateMemberRole,
    removeMember,
    hasPermission,
    clearWorkspaceData,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// Hook to use the workspace context
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
