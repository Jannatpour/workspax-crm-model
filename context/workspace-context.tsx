// /context/workspace-context.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Define the member type with enhanced role types
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

export interface WorkspaceMember {
  id: string;
  name?: string;
  email: string;
  role: WorkspaceRole;
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt?: Date;
}

// Define invitation type
export interface WorkspaceInvitation {
  id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  workspaceId: string;
  createdAt: Date;
  expiresAt: Date;
  createdBy: string;
}

// Define the workspace type with more properties
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  logo?: string | File;
  members?: WorkspaceMember[];
  createdAt?: Date;
  updatedAt?: Date;
  ownerId: string;
  pendingInvitations?: WorkspaceInvitation[];
}

// Define the workspace context properties
interface WorkspaceContextProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  fetchWorkspaces: () => Promise<Workspace[]>;
  createWorkspace: (data: Partial<Workspace>) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<boolean>;
  inviteToWorkspace: (
    workspaceId: string,
    email: string,
    role: WorkspaceRole
  ) => Promise<WorkspaceInvitation>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
  resendInvitation: (invitationId: string) => Promise<WorkspaceInvitation>;
  acceptInvitation: (token: string) => Promise<Workspace>;
  updateMemberRole: (
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole
  ) => Promise<boolean>;
  removeMember: (workspaceId: string, memberId: string) => Promise<boolean>;
  getCurrentUserRole: () => WorkspaceRole | null;
  hasPermission: (permission: string) => boolean;
  clearWorkspaceData: () => void;
}

// Permission mapping based on roles
const ROLE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  owner: [
    'workspace:update',
    'workspace:delete',
    'workspace:members:invite',
    'workspace:members:update',
    'workspace:members:remove',
    'workspace:view',
    'workspace:settings:view',
    'workspace:settings:update',
  ],
  admin: [
    'workspace:update',
    'workspace:members:invite',
    'workspace:members:update',
    'workspace:members:remove',
    'workspace:view',
    'workspace:settings:view',
    'workspace:settings:update',
  ],
  member: ['workspace:view'],
  guest: ['workspace:view'],
};

// Create context with default values
const WorkspaceContext = createContext<WorkspaceContextProps>({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,
  setCurrentWorkspace: () => {},
  fetchWorkspaces: async () => [],
  createWorkspace: async () => ({ id: '', name: '', ownerId: '' }),
  updateWorkspace: async () => ({ id: '', name: '', ownerId: '' }),
  deleteWorkspace: async () => false,
  inviteToWorkspace: async () => ({
    id: '',
    email: '',
    role: 'guest',
    token: '',
    workspaceId: '',
    createdAt: new Date(),
    expiresAt: new Date(),
    createdBy: '',
  }),
  cancelInvitation: async () => false,
  resendInvitation: async () => ({
    id: '',
    email: '',
    role: 'guest',
    token: '',
    workspaceId: '',
    createdAt: new Date(),
    expiresAt: new Date(),
    createdBy: '',
  }),
  acceptInvitation: async () => ({ id: '', name: '', ownerId: '' }),
  updateMemberRole: async () => false,
  removeMember: async () => false,
  getCurrentUserRole: () => null,
  hasPermission: () => false,
  clearWorkspaceData: () => {},
});

// Sample initial workspaces for demo purposes
const initialWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Marketing Team',
    description: 'Marketing department workspace',
    ownerId: '1',
    members: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', status: 'active' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' },
    ],
  },
  {
    id: '2',
    name: 'Development',
    description: 'Software development team',
    ownerId: '1',
    members: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'member', status: 'active' },
    ],
  },
];

// Mock current user ID for demo
const CURRENT_USER_ID = '1';

// Provider component
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(initialWorkspaces[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate a unique token
  const generateToken = () => {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  };

  // Save current workspace to localStorage when it changes
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem('currentWorkspaceId', currentWorkspace.id);
    }
  }, [currentWorkspace]);

  // Load workspace from localStorage on initial load
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
    if (savedWorkspaceId && workspaces.length > 0) {
      const savedWorkspace = workspaces.find(w => w.id === savedWorkspaceId);
      if (savedWorkspace) {
        setCurrentWorkspace(savedWorkspace);
      }
    }
  }, [workspaces]);

  // Get current user's role in the current workspace
  const getCurrentUserRole = useCallback((): WorkspaceRole | null => {
    if (!currentWorkspace || !currentWorkspace.members) return null;

    const currentMember = currentWorkspace.members.find(member => member.id === CURRENT_USER_ID);

    return currentMember ? currentMember.role : null;
  }, [currentWorkspace]);

  // Check if current user has a specific permission
  const hasPermission = useCallback(
    (permission: string): boolean => {
      const role = getCurrentUserRole();
      if (!role) return false;

      return ROLE_PERMISSIONS[role].includes(permission);
    },
    [getCurrentUserRole]
  );

  // Clear all workspace-related data when switching workspaces
  const clearWorkspaceData = useCallback(() => {
    // In a real application, you would reset all workspace-specific state here
    console.log('Clearing workspace data');
    // Example: dispatch actions to clear data in other contexts
    // clearEmailData();
    // clearContactsData();
    // etc.
  }, []);

  // Fetch workspaces
  const fetchWorkspaces = useCallback(async (): Promise<Workspace[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, you would fetch from an API
      // For this demo, we'll just return the current state
      setIsLoading(false);
      return workspaces;
    } catch (err) {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    }
  }, [workspaces]);

  // Create a new workspace
  const createWorkspace = useCallback(async (data: Partial<Workspace>): Promise<Workspace> => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a new workspace with the provided data
      const newWorkspace: Workspace = {
        id: Date.now().toString(),
        name: data.name || 'New Workspace',
        description: data.description,
        logo: data.logo,
        ownerId: CURRENT_USER_ID,
        members: [
          {
            id: CURRENT_USER_ID,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'owner',
            status: 'active',
            joinedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        pendingInvitations: [],
      };

      // Update the workspaces state
      setWorkspaces(prev => [...prev, newWorkspace]);

      // Set the newly created workspace as the current one
      setCurrentWorkspace(newWorkspace);

      setIsLoading(false);
      return newWorkspace;
    } catch (err) {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error('Failed to create workspace');
      setError(error);
      throw error;
    }
  }, []);

  // Update a workspace
  const updateWorkspace = useCallback(
    async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
      setIsLoading(true);
      setError(null);

      try {
        // Verify permission
        if (!hasPermission('workspace:update')) {
          throw new Error('You do not have permission to update this workspace');
        }

        // Find the workspace to update
        const updatedWorkspaces = workspaces.map(workspace => {
          if (workspace.id === id) {
            const updatedWorkspace = {
              ...workspace,
              ...data,
              updatedAt: new Date(),
            };

            // If this is the current workspace, update that state too
            if (currentWorkspace && currentWorkspace.id === id) {
              setCurrentWorkspace(updatedWorkspace);
            }

            return updatedWorkspace;
          }
          return workspace;
        });

        setWorkspaces(updatedWorkspaces);

        const updatedWorkspace = updatedWorkspaces.find(w => w.id === id);

        if (!updatedWorkspace) {
          throw new Error('Workspace not found');
        }

        setIsLoading(false);
        return updatedWorkspace;
      } catch (err) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error('Failed to update workspace');
        setError(error);
        throw error;
      }
    },
    [workspaces, currentWorkspace, hasPermission]
  );

  // Delete a workspace
  const deleteWorkspace = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Verify permission
        if (!hasPermission('workspace:delete')) {
          throw new Error('You do not have permission to delete this workspace');
        }

        // Filter out the workspace to delete
        const updatedWorkspaces = workspaces.filter(workspace => workspace.id !== id);

        // If we're deleting the current workspace, set the first available one as current
        if (currentWorkspace && currentWorkspace.id === id) {
          clearWorkspaceData();
          setCurrentWorkspace(updatedWorkspaces.length > 0 ? updatedWorkspaces[0] : null);
        }

        setWorkspaces(updatedWorkspaces);

        setIsLoading(false);
        return true;
      } catch (err) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error('Failed to delete workspace');
        setError(error);
        throw error;
      }
    },
    [workspaces, currentWorkspace, hasPermission, clearWorkspaceData]
  );

  // Invite a user to the workspace
  const inviteToWorkspace = useCallback(
    async (
      workspaceId: string,
      email: string,
      role: WorkspaceRole
    ): Promise<WorkspaceInvitation> => {
      setIsLoading(true);
      setError(null);

      try {
        // Verify permission
        if (!hasPermission('workspace:members:invite')) {
          throw new Error('You do not have permission to invite members');
        }

        // Create invitation token
        const token = generateToken();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // 7 days expiration

        // Create a new invitation
        const newInvitation: WorkspaceInvitation = {
          id: Date.now().toString(),
          email,
          role,
          token,
          workspaceId,
          createdAt: new Date(),
          expiresAt: expirationDate,
          createdBy: CURRENT_USER_ID,
        };

        // Find the workspace to update
        const updatedWorkspaces = workspaces.map(workspace => {
          if (workspace.id === workspaceId) {
            const updatedWorkspace = {
              ...workspace,
              pendingInvitations: [...(workspace.pendingInvitations || []), newInvitation],
              updatedAt: new Date(),
            };

            // If this is the current workspace, update that state too
            if (currentWorkspace && currentWorkspace.id === workspaceId) {
              setCurrentWorkspace(updatedWorkspace);
            }

            return updatedWorkspace;
          }
          return workspace;
        });

        setWorkspaces(updatedWorkspaces);

        // In a real app, you would send an email with the invitation link here
        console.log(`Invitation link would be sent to ${email} with token ${token}`);

        setIsLoading(false);
        return newInvitation;
      } catch (err) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error('Failed to invite user');
        setError(error);
        throw error;
      }
    },
    [workspaces, currentWorkspace, hasPermission]
  );

  // Cancel an invitation
  const cancelInvitation = useCallback(
    async (invitationId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Verify permission
        if (!hasPermission('workspace:members:invite')) {
          throw new Error('You do not have permission to cancel invitations');
        }

        if (!currentWorkspace) {
          throw new Error('No workspace selected');
        }

        // Find and remove the invitation
        const updatedWorkspaces = workspaces.map(workspace => {
          if (workspace.id === currentWorkspace.id) {
            const updatedWorkspace = {
              ...workspace,
              pendingInvitations: (workspace.pendingInvitations || []).filter(
                invitation => invitation.id !== invitationId
              ),
              updatedAt: new Date(),
            };

            setCurrentWorkspace(updatedWorkspace);
            return updatedWorkspace;
          }
          return workspace;
        });

        setWorkspaces(updatedWorkspaces);

        setIsLoading(false);
        return true;
      } catch (err) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error('Failed to cancel invitation');
        setError(error);
        throw error;
      }
    },
    [workspaces, currentWorkspace, hasPermission]
  );

  // Resend an invitation
  const resendInvitation = useCallback(
    async (invitationId: string): Promise<WorkspaceInvitation> => {
      setIsLoading(true);
      setError(null);

      try {
        // Verify permission
        if (!hasPermission('workspace:members:invite')) {
          throw new Error('You do not have permission to resend invitations');
        }

        if (!currentWorkspace) {
          throw new Error('No workspace selected');
        }

        let updatedInvitation: WorkspaceInvitation | null = null;

        // Find the invitation and update its expiration date
        const updatedWorkspaces = workspaces.map(workspace => {
          if (workspace.id === currentWorkspace.id) {
            const pendingInvitations = workspace.pendingInvitations || [];
            const invitationIndex = pendingInvitations.findIndex(
              invitation => invitation.id === invitationId
            );

            if (invitationIndex === -1) {
              return workspace;
            }

            // Update expiration date and regenerate token
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);

            const updatedInvitations = [...pendingInvitations];
            updatedInvitations[invitationIndex] = {
              ...updatedInvitations[invitationIndex],
              token: generateToken(),
              expiresAt: expirationDate,
            };

            updatedInvitation = updatedInvitations[invitationIndex];

            const updatedWorkspace = {
              ...workspace,
              pendingInvitations: updatedInvitations,
              updatedAt: new Date(),
            };

            setCurrentWorkspace(updatedWorkspace);
            return updatedWorkspace;
          }
          return workspace;
        });

        setWorkspaces(updatedWorkspaces);

        if (!updatedInvitation) {
          throw new Error('Invitation not found');
        }

        // In a real app, you would send an email with the invitation link here
        console.log(
          `Invitation would be resent to ${updatedInvitation.email} with token ${updatedInvitation.token}`
        );

        setIsLoading(false);
        return updatedInvitation;
      } catch (err) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error('Failed to resend invitation');
        setError(error);
        throw error;
      }
    },
    [workspaces, currentWorkspace, hasPermission]
  );

  // Accept an invitation
  const acceptInvitation = useCallback(
    async (token: string): Promise<Workspace> => {
      setIsLoading(true);
      setError(null);

      try {
        // Find the invitation with the token
        let foundInvitation: WorkspaceInvitation | null = null;
        let workspaceToJoin: Workspace | null = null;

        for (const workspace of workspaces) {
          const invitation = (workspace.pendingInvitations || []).find(
            inv => inv.token === token && inv.expiresAt > new Date()
          );

          if (invitation) {
            foundInvitation = invitation;
            workspaceToJoin = workspace;
            break;
          }
        }

        if (!foundInvitation || !workspaceToJoin) {
          throw new Error('Invalid or expired invitation');
        }

        // Add the user as a member to the workspace
        const newMember: WorkspaceMember = {
          id: CURRENT_USER_ID,
          name: 'John Doe', // In a real app, this would be the current user's name
          email: foundInvitation.email,
          role: foundInvitation.role,
          status: 'active',
          joinedAt: new Date(),
        };

        // Update the workspace with the new member and remove the invitation
        const updatedWorkspaces = workspaces.map(workspace => {
          if (workspace.id === workspaceToJoin!.id) {
            const updatedWorkspace = {
              ...workspace,
              members: [...(workspace.members || []), newMember],
              pendingInvitations: (workspace.pendingInvitations || []).filter(
                inv => inv.id !== foundInvitation!.id
              ),
              updatedAt: new Date(),
            };

            return updatedWorkspace;
          }
          return workspace;
        });

        setWorkspaces(updatedWorkspaces);
        const joinedWorkspace = updatedWorkspaces.find(w => w.id === workspaceToJoin!.id);

        if (!joinedWorkspace) {
          throw new Error('Workspace not found');
        }

        // Set the joined workspace as the current one
        setCurrentWorkspace(joinedWorkspace);

        setIsLoading(false);
        return joinedWorkspace;
      } catch (err) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error('Failed to accept invitation');
        setError(error);
        throw error;
      }
    },
    [workspaces]
  );

  // Update a member's role
  const updateMemberRole = useCallback(
    async (workspaceId: string, memberId: string, role: WorkspaceRole): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Verify permission
        if (!hasPermission('workspace:members:update')) {
          throw new Error('You do not have permission to update member roles');
        }

        // Don't allow changing the owner's role
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (!workspace) {
          throw new Error('Workspace not found');
        }

        if (workspace.ownerId === memberId && role !== 'owner') {
          throw new Error("Cannot change the workspace owner's role");
        }

        // Update the member's role
        const updatedWorkspaces = workspaces.map(workspace => {
          if (workspace.id === workspaceId) {
            const updatedMembers = (workspace.members || []).map(member => {
              if (member.id === memberId) {
                return { ...member, role };
              }
              return member;
            });

            const updatedWorkspace = {
              ...workspace,
              members: updatedMembers,
              updatedAt: new Date(),
            };

            // If this is the current workspace, update that state too
            if (currentWorkspace && currentWorkspace.id === workspaceId) {
              setCurrentWorkspace(updatedWorkspace);
            }

            return updatedWorkspace;
          }
          return workspace;
        });

        setWorkspaces(updatedWorkspaces);

        setIsLoading(false);
        return true;
      } catch (err) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error('Failed to update member role');
        setError(error);
        throw error;
      }
    },
    [workspaces, currentWorkspace, hasPermission]
  );

  // Remove a member from the workspace
  const removeMember = useCallback(
    async (workspaceId: string, memberId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Verify permission
        if (!hasPermission('workspace:members:remove')) {
          throw new Error('You do not have permission to remove members');
        }

        // Don't allow removing the owner
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (!workspace) {
          throw new Error('Workspace not found');
        }

        if (workspace.ownerId === memberId) {
          throw new Error('Cannot remove the workspace owner');
        }

        // Remove the member
        const updatedWorkspaces = workspaces.map(workspace => {
          if (workspace.id === workspaceId) {
            const updatedWorkspace = {
              ...workspace,
              members: (workspace.members || []).filter(member => member.id !== memberId),
              updatedAt: new Date(),
            };

            // If this is the current workspace, update that state too
            if (currentWorkspace && currentWorkspace.id === workspaceId) {
              setCurrentWorkspace(updatedWorkspace);
            }

            return updatedWorkspace;
          }
          return workspace;
        });

        setWorkspaces(updatedWorkspaces);

        setIsLoading(false);
        return true;
      } catch (err) {
        setIsLoading(false);
        const error = err instanceof Error ? err : new Error('Failed to remove member');
        setError(error);
        throw error;
      }
    },
    [workspaces, currentWorkspace, hasPermission]
  );

  // Handle workspace switching with data isolation
  const handleWorkspaceSwitch = (workspace: Workspace) => {
    // Clear any workspace-specific data before switching
    clearWorkspaceData();

    // Set the new workspace
    setCurrentWorkspace(workspace);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        error,
        setCurrentWorkspace: handleWorkspaceSwitch,
        fetchWorkspaces,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        inviteToWorkspace,
        cancelInvitation,
        resendInvitation,
        acceptInvitation,
        updateMemberRole,
        removeMember,
        getCurrentUserRole,
        hasPermission,
        clearWorkspaceData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// Custom hook to use the workspace context
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
