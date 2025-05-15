'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// Define the member type
export interface WorkspaceMember {
  id: string;
  name?: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  avatar?: string;
}

// Define the workspace type
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  logo?: string | File;
  members?: WorkspaceMember[];
  createdAt?: Date;
  updatedAt?: Date;
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
  inviteToWorkspace: (workspaceId: string, email: string, role: string) => Promise<boolean>;
}

// Create context with default values
const WorkspaceContext = createContext<WorkspaceContextProps>({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,
  setCurrentWorkspace: () => {},
  fetchWorkspaces: async () => [],
  createWorkspace: async () => ({ id: '', name: '' }),
  updateWorkspace: async () => ({ id: '', name: '' }),
  deleteWorkspace: async () => false,
  inviteToWorkspace: async () => false,
});

// Sample initial workspaces for demo purposes
const initialWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Marketing Team',
    description: 'Marketing department workspace',
    members: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
    ],
  },
  {
    id: '2',
    name: 'Development',
    description: 'Software development team',
    members: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'member' },
    ],
  },
];

// Provider component
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(initialWorkspaces[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

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
        members: [{ id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' }],
        createdAt: new Date(),
        updatedAt: new Date(),
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
    [workspaces, currentWorkspace]
  );

  // Delete a workspace
  const deleteWorkspace = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Filter out the workspace to delete
        const updatedWorkspaces = workspaces.filter(workspace => workspace.id !== id);

        // If we're deleting the current workspace, set the first available one as current
        if (currentWorkspace && currentWorkspace.id === id) {
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
    [workspaces, currentWorkspace]
  );

  // Invite a user to the workspace
  const inviteToWorkspace = useCallback(
    async (workspaceId: string, email: string, role: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Find the workspace to update
        const updatedWorkspaces = workspaces.map(workspace => {
          if (workspace.id === workspaceId) {
            // Create a new member
            const newMember: WorkspaceMember = {
              id: Date.now().toString(),
              email,
              role: role as 'admin' | 'member' | 'guest',
            };

            const updatedWorkspace = {
              ...workspace,
              members: [...(workspace.members || []), newMember],
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
        const error = err instanceof Error ? err : new Error('Failed to invite user');
        setError(error);
        throw error;
      }
    },
    [workspaces, currentWorkspace]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        error,
        setCurrentWorkspace,
        fetchWorkspaces,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        inviteToWorkspace,
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
