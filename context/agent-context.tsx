'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AgentStatus, AgentType, CapabilityType } from '@prisma/client';

// Types
export type AgentCapability = {
  id: string;
  name: string;
  description?: string;
  type: CapabilityType;
  config: Record<string, any>;
  agentId: string;
};

export type Agent = {
  id: string;
  name: string;
  description?: string;
  type: AgentType;
  status: AgentStatus;
  avatarUrl?: string;
  prompt: string;
  modelConfig: Record<string, any>;
  settings: Record<string, any>;
  capabilities: AgentCapability[];
  rating?: number;
  usageCount: number;
  userId: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AgentWithCapabilities = Agent & {
  capabilities: AgentCapability[];
};

export type AgentTeam = {
  id: string;
  name: string;
  description?: string;
  members: { agent: AgentWithCapabilities }[];
  workspaceId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AgentTeamWithMembers = AgentTeam;

export type AgentExecutionResult = {
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
};

export type ModuleAgentConfig = {
  moduleType: string;
  moduleId?: string;
  agentId?: string;
  teamId?: string;
  isActive: boolean;
  capabilities: string[];
};

// Context interface
interface AgentContextType {
  // State
  agents: Agent[];
  activeAgent: AgentWithCapabilities | null;
  activeTeam: AgentTeamWithMembers | null;
  availableAgents: AgentWithCapabilities[];
  userAgents: AgentWithCapabilities[];
  teamAgents: AgentTeamWithMembers[];
  moduleConfigs: Record<string, ModuleAgentConfig>;
  isLoading: boolean;
  actionStatus: 'idle' | 'loading' | 'success' | 'error';
  actionError: string | null;

  // Fetch actions
  fetchAgents: () => Promise<void>;
  fetchAgentById: (id: string) => Promise<Agent | null>;
  refreshAgents: () => Promise<void>;

  // CRUD operations
  createAgent: (agentData: Partial<Agent>) => Promise<AgentWithCapabilities | null>;
  updateAgent: (id: string, agentData: Partial<Agent>) => Promise<AgentWithCapabilities | null>;
  deleteAgent: (id: string) => Promise<boolean>;

  // Team operations
  createTeam: (teamData: Partial<AgentTeam>) => Promise<AgentTeamWithMembers | null>;
  updateTeam: (id: string, teamData: Partial<AgentTeam>) => Promise<AgentTeamWithMembers | null>;
  deleteTeam: (id: string) => Promise<boolean>;

  // Selection
  setActiveAgent: (agent: AgentWithCapabilities | null) => void;
  setActiveTeam: (team: AgentTeamWithMembers | null) => void;

  // Agent operations
  trainAgent: (id: string, trainingData: any) => Promise<void>;
  runAgentTask: (agentId: string, moduleType: string, taskName: string, input: any) => Promise<any>;
  executeAgentAction: (
    agentId: string,
    action: string,
    input: Record<string, any>,
    moduleType: string,
    moduleId?: string
  ) => Promise<AgentExecutionResult>;

  // Module configuration
  getModuleAgentConfig: (moduleType: string, moduleId?: string) => ModuleAgentConfig | null;
  setModuleAgentConfig: (config: ModuleAgentConfig) => void;
}

// Create context with default values
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Provider component
interface AgentProviderProps {
  children: ReactNode;
}

export function AgentProvider({ children }: AgentProviderProps) {
  // State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentWithCapabilities | null>(null);
  const [activeTeam, setActiveTeam] = useState<AgentTeamWithMembers | null>(null);
  const [availableAgents, setAvailableAgents] = useState<AgentWithCapabilities[]>([]);
  const [userAgents, setUserAgents] = useState<AgentWithCapabilities[]>([]);
  const [teamAgents, setTeamAgents] = useState<AgentTeamWithMembers[]>([]);
  const [moduleConfigs, setModuleConfigs] = useState<Record<string, ModuleAgentConfig>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const router = useRouter();

  // Generate a config key from module type and ID
  const getConfigKey = (moduleType: string, moduleId?: string) => {
    return moduleId ? `${moduleType}-${moduleId}` : moduleType;
  };

  // Refresh all agents and teams
  const refreshAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      setActionError(null);

      // Fetch agents from API
      const response = await fetch('/api/agents');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch agents');
      }

      const data = await response.json();

      setAgents(data.agents || []);
      setAvailableAgents(data.availableAgents || []);
      setUserAgents(data.userAgents || []);
      setTeamAgents(data.teamAgents || []);

      // Load default agent from user preferences if available
      if (data.defaultAgent && !activeAgent) {
        setActiveAgent(data.defaultAgent);
      }

      // Load default team from user preferences if available
      if (data.defaultTeam && !activeTeam) {
        setActiveTeam(data.defaultTeam);
      }

      return data;
    } catch (err) {
      console.error('Error loading agents:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to load agents');
      toast.error('Failed to load agents');
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [activeAgent, activeTeam]);

  // Fetch all agents (simpler version for specific cases)
  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agents');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch agents');
      }

      const data = await response.json();
      setAgents(data.agents || data); // Handle both response formats
      return data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch an agent by ID
  const fetchAgentById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/agents/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch agent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching agent ${id}:`, error);
      toast.error('Failed to load agent details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new agent
  const createAgent = useCallback(
    async (agentData: Partial<Agent>) => {
      try {
        setIsLoading(true);
        setActionStatus('loading');
        setActionError(null);

        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create agent');
        }

        const newAgent = await response.json();
        setActionStatus('success');
        toast.success('Agent created successfully');

        // Refresh all agents to update lists
        await refreshAgents();

        return newAgent;
      } catch (err) {
        console.error('Error creating agent:', err);
        setActionStatus('error');
        setActionError(err instanceof Error ? err.message : 'Failed to create agent');
        toast.error(err instanceof Error ? err.message : 'Failed to create agent');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshAgents]
  );

  // Update an existing agent
  const updateAgent = useCallback(
    async (id: string, agentData: Partial<Agent>) => {
      try {
        setIsLoading(true);
        setActionStatus('loading');
        setActionError(null);

        const response = await fetch(`/api/agents/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update agent');
        }

        const updatedAgent = await response.json();

        // Update active agent if it's the one being updated
        if (activeAgent?.id === id) {
          setActiveAgent(updatedAgent);
        }

        setActionStatus('success');
        toast.success('Agent updated successfully');

        // Update agents list
        setAgents(prev => prev.map(agent => (agent.id === id ? updatedAgent : agent)));

        // Refresh all data
        await refreshAgents();

        return updatedAgent;
      } catch (err) {
        console.error('Error updating agent:', err);
        setActionStatus('error');
        setActionError(err instanceof Error ? err.message : 'Failed to update agent');
        toast.error(err instanceof Error ? err.message : 'Failed to update agent');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeAgent, refreshAgents]
  );

  // Delete an agent
  const deleteAgent = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setActionStatus('loading');
        setActionError(null);

        const response = await fetch(`/api/agents/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete agent');
        }

        // Remove from local state
        setAgents(prev => prev.filter(agent => agent.id !== id));

        // Reset active agent if it's the one being deleted
        if (activeAgent?.id === id) {
          setActiveAgent(null);
        }

        // Remove any module configurations using this agent
        setModuleConfigs(prev => {
          const newConfigs = { ...prev };
          Object.keys(newConfigs).forEach(key => {
            if (newConfigs[key].agentId === id) {
              newConfigs[key] = {
                ...newConfigs[key],
                agentId: undefined,
                isActive: false,
              };
            }
          });
          return newConfigs;
        });

        setActionStatus('success');
        toast.success('Agent deleted successfully');

        // Refresh all data
        await refreshAgents();

        return true;
      } catch (err) {
        console.error('Error deleting agent:', err);
        setActionStatus('error');
        setActionError(err instanceof Error ? err.message : 'Failed to delete agent');
        toast.error(err instanceof Error ? err.message : 'Failed to delete agent');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [activeAgent, refreshAgents]
  );

  // Create a new team
  const createTeam = useCallback(
    async (teamData: Partial<AgentTeam>) => {
      try {
        setIsLoading(true);
        setActionStatus('loading');
        setActionError(null);

        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create team');
        }

        const newTeam = await response.json();
        setActionStatus('success');
        toast.success('Team created successfully');

        // Refresh all data
        await refreshAgents();

        return newTeam;
      } catch (err) {
        console.error('Error creating team:', err);
        setActionStatus('error');
        setActionError(err instanceof Error ? err.message : 'Failed to create team');
        toast.error(err instanceof Error ? err.message : 'Failed to create team');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshAgents]
  );

  // Update an existing team
  const updateTeam = useCallback(
    async (id: string, teamData: Partial<AgentTeam>) => {
      try {
        setIsLoading(true);
        setActionStatus('loading');
        setActionError(null);

        const response = await fetch(`/api/teams/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update team');
        }

        const updatedTeam = await response.json();

        // Update active team if it's the one being updated
        if (activeTeam?.id === id) {
          setActiveTeam(updatedTeam);
        }

        setActionStatus('success');
        toast.success('Team updated successfully');

        // Refresh all data
        await refreshAgents();

        return updatedTeam;
      } catch (err) {
        console.error('Error updating team:', err);
        setActionStatus('error');
        setActionError(err instanceof Error ? err.message : 'Failed to update team');
        toast.error(err instanceof Error ? err.message : 'Failed to update team');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [activeTeam, refreshAgents]
  );

  // Delete a team
  const deleteTeam = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setActionStatus('loading');
        setActionError(null);

        const response = await fetch(`/api/teams/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete team');
        }

        // Reset active team if it's the one being deleted
        if (activeTeam?.id === id) {
          setActiveTeam(null);
        }

        // Remove any module configurations using this team
        setModuleConfigs(prev => {
          const newConfigs = { ...prev };
          Object.keys(newConfigs).forEach(key => {
            if (newConfigs[key].teamId === id) {
              newConfigs[key] = {
                ...newConfigs[key],
                teamId: undefined,
                isActive: false,
              };
            }
          });
          return newConfigs;
        });

        setActionStatus('success');
        toast.success('Team deleted successfully');

        // Refresh all data
        await refreshAgents();

        return true;
      } catch (err) {
        console.error('Error deleting team:', err);
        setActionStatus('error');
        setActionError(err instanceof Error ? err.message : 'Failed to delete team');
        toast.error(err instanceof Error ? err.message : 'Failed to delete team');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [activeTeam, refreshAgents]
  );

  // Train an agent with new data
  const trainAgent = useCallback(
    async (id: string, trainingData: any) => {
      try {
        setIsLoading(true);
        setActionStatus('loading');
        setActionError(null);

        const response = await fetch(`/api/agents/${id}/train`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trainingData }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to train agent');
        }

        setActionStatus('success');
        toast.success('Agent training started');

        // Refresh agents to get updated training status
        await refreshAgents();
      } catch (err) {
        console.error('Error training agent:', err);
        setActionStatus('error');
        setActionError(err instanceof Error ? err.message : 'Failed to train agent');
        toast.error(err instanceof Error ? err.message : 'Failed to train agent');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshAgents]
  );

  // Run a task with an agent
  const runAgentTask = useCallback(
    async (agentId: string, moduleType: string, taskName: string, input: any) => {
      try {
        setIsLoading(true);
        setActionStatus('loading');
        setActionError(null);

        const response = await fetch(`/api/agents/${agentId}/task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleType, taskName, input }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to run agent task');
        }

        const result = await response.json();
        setActionStatus('success');

        // Increment usage count for the agent
        setAgents(prev =>
          prev.map(agent =>
            agent.id === agentId ? { ...agent, usageCount: agent.usageCount + 1 } : agent
          )
        );

        return result;
      } catch (err) {
        console.error('Error running agent task:', err);
        setActionStatus('error');
        setActionError(err instanceof Error ? err.message : 'Failed to run agent task');
        toast.error(err instanceof Error ? err.message : 'Failed to run agent task');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Execute an agent action
  const executeAgentAction = useCallback(
    async (
      agentId: string,
      action: string,
      input: Record<string, any>,
      moduleType: string,
      moduleId?: string
    ): Promise<AgentExecutionResult> => {
      try {
        setActionStatus('loading');
        setActionError(null);

        const response = await fetch('/api/agents/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId,
            action,
            input,
            moduleType,
            moduleId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to execute agent action');
        }

        const result = await response.json();
        setActionStatus('success');

        // Increment usage count for the agent
        setAgents(prev =>
          prev.map(agent =>
            agent.id === agentId ? { ...agent, usageCount: agent.usageCount + 1 } : agent
          )
        );

        return {
          success: true,
          output: result.output,
          executionTime: result.executionTime,
        };
      } catch (error: any) {
        console.error(`Error executing agent action:`, error);
        setActionStatus('error');
        setActionError(error.message || 'Failed to execute agent action');
        toast.error(error.message || 'Failed to execute agent action');
        return {
          success: false,
          error: error.message || 'Failed to execute agent action',
        };
      }
    },
    []
  );

  // Get module agent configuration
  const getModuleAgentConfig = useCallback(
    (moduleType: string, moduleId?: string): ModuleAgentConfig | null => {
      const key = getConfigKey(moduleType, moduleId);
      return moduleConfigs[key] || null;
    },
    [moduleConfigs]
  );

  // Set module agent configuration
  const setModuleAgentConfig = useCallback((config: ModuleAgentConfig) => {
    const key = getConfigKey(config.moduleType, config.moduleId);
    setModuleConfigs(prev => ({
      ...prev,
      [key]: config,
    }));
  }, []);

  // Initial fetch of agents and load configs from localStorage
  useEffect(() => {
    refreshAgents();

    // Load module configurations from local storage
    const savedConfigs = localStorage.getItem('moduleAgentConfigs');
    if (savedConfigs) {
      try {
        setModuleConfigs(JSON.parse(savedConfigs));
      } catch (e) {
        console.error('Failed to parse saved module configurations', e);
      }
    }
  }, [refreshAgents]);

  // Save module configurations to local storage
  useEffect(() => {
    if (Object.keys(moduleConfigs).length > 0) {
      localStorage.setItem('moduleAgentConfigs', JSON.stringify(moduleConfigs));
    }
  }, [moduleConfigs]);

  // Context value
  const value: AgentContextType = {
    agents,
    activeAgent,
    activeTeam,
    availableAgents,
    userAgents,
    teamAgents,
    moduleConfigs,
    isLoading,
    actionStatus,
    actionError,
    fetchAgents,
    fetchAgentById,
    refreshAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    createTeam,
    updateTeam,
    deleteTeam,
    setActiveAgent,
    setActiveTeam,
    trainAgent,
    runAgentTask,
    executeAgentAction,
    getModuleAgentConfig,
    setModuleAgentConfig,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

// Custom hook to use the agent context
export function useAgent(): AgentContextType {
  const context = useContext(AgentContext);

  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }

  return context;
}
