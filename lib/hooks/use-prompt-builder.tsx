'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

// Core Types
export type PromptVariableType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export type PromptVariable = {
  name: string;
  description: string;
  type: PromptVariableType;
  required: boolean;
  default?: any;
};

export type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: PromptVariable[];
  category: string;
  tags: string[];
  capabilities: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PromptTemplateMap = Record<string, PromptTemplate>;

export type CapabilityPromptMap = {
  [key: string]: {
    systemPrompt: string;
    examples: { input: any; output: any }[];
  };
};

export type AgentConfiguration = {
  id: string;
  name: string;
  systemPrompt?: string;
  capabilities: {
    key: string;
    name: string;
    isEnabled: boolean;
  }[];
};

/**
 * Hook for building dynamic agent prompts with both local and API capabilities
 */
export function usePromptBuilder() {
  // State
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [localTemplates, setLocalTemplates] = useState<PromptTemplateMap>({});
  const [capabilityPrompts, setCapabilityPrompts] = useState<CapabilityPromptMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Combine API and local templates
  const allTemplates = useMemo(() => {
    const apiTemplatesMap: PromptTemplateMap = templates.reduce((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {} as PromptTemplateMap);

    return { ...apiTemplatesMap, ...localTemplates };
  }, [templates, localTemplates]);

  // Initialize by loading data from localStorage
  useEffect(() => {
    try {
      // Load local templates
      const savedTemplates = localStorage.getItem('customPromptTemplates');
      if (savedTemplates) {
        setLocalTemplates(JSON.parse(savedTemplates));
      }

      // Load capability prompts
      const savedCapabilityPrompts = localStorage.getItem('capabilityPrompts');
      if (savedCapabilityPrompts) {
        setCapabilityPrompts(JSON.parse(savedCapabilityPrompts));
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }, []);

  // API Template Methods

  // Fetch templates from API
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/agents/prompt-templates');

      if (!response.ok) {
        throw new Error('Failed to fetch prompt templates');
      }

      const data = await response.json();
      setTemplates(data.templates);
      return data.templates;
    } catch (err: any) {
      console.error('Error fetching prompt templates:', err);
      setError(err.message || 'Failed to load prompt templates');
      toast.error('Failed to load prompt templates');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save template to API
  const saveApiTemplate = useCallback(
    async (template: Partial<PromptTemplate>): Promise<PromptTemplate | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const isUpdate = Boolean(template.id);
        const url = isUpdate
          ? `/api/agents/prompt-templates/${template.id}`
          : '/api/agents/prompt-templates';

        const response = await fetch(url, {
          method: isUpdate ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(template),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${isUpdate ? 'update' : 'save'} prompt template`);
        }

        const savedTemplate = await response.json();

        // Update local state
        setTemplates(prev => {
          if (isUpdate) {
            return prev.map(t => (t.id === savedTemplate.id ? savedTemplate : t));
          } else {
            return [...prev, savedTemplate];
          }
        });

        toast.success(`Template ${isUpdate ? 'updated' : 'created'} successfully`);
        return savedTemplate;
      } catch (err: any) {
        console.error('Error saving prompt template:', err);
        setError(err.message || 'Failed to save prompt template');
        toast.error(err.message || 'Failed to save prompt template');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete template from API
  const deleteApiTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/agents/prompt-templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt template');
      }

      // Update local state
      setTemplates(prev => prev.filter(t => t.id !== id));

      toast.success('Template deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting prompt template:', err);
      setError(err.message || 'Failed to delete prompt template');
      toast.error(err.message || 'Failed to delete prompt template');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Local Template Methods

  // Save template to localStorage
  const saveLocalTemplate = useCallback((template: PromptTemplate): PromptTemplate => {
    setLocalTemplates(prev => ({
      ...prev,
      [template.id]: template,
    }));

    // Save to localStorage
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('customPromptTemplates') || '{}');
      savedTemplates[template.id] = template;
      localStorage.setItem('customPromptTemplates', JSON.stringify(savedTemplates));
    } catch (e) {
      console.error('Failed to save custom template to localStorage', e);
      toast.error('Failed to save template locally');
    }

    return template;
  }, []);

  // Delete template from localStorage
  const deleteLocalTemplate = useCallback(
    (id: string): boolean => {
      if (!localTemplates[id]) {
        console.warn('Template not found in local storage:', id);
        return false;
      }

      setLocalTemplates(prev => {
        const newTemplates = { ...prev };
        delete newTemplates[id];
        return newTemplates;
      });

      // Update localStorage
      try {
        const savedTemplates = JSON.parse(localStorage.getItem('customPromptTemplates') || '{}');
        delete savedTemplates[id];
        localStorage.setItem('customPromptTemplates', JSON.stringify(savedTemplates));
      } catch (e) {
        console.error('Failed to update localStorage after template deletion', e);
        toast.error('Failed to delete template from local storage');
        return false;
      }

      return true;
    },
    [localTemplates]
  );

  // Capability Prompt Methods

  // Get prompt for a specific capability
  const getCapabilityPrompt = useCallback(
    (capability: string): string => {
      return capabilityPrompts[capability]?.systemPrompt || '';
    },
    [capabilityPrompts]
  );

  // Set prompt for a specific capability
  const setCapabilityPrompt = useCallback(
    (capability: string, prompt: string, examples: { input: any; output: any }[] = []) => {
      setCapabilityPrompts(prev => {
        const updated = {
          ...prev,
          [capability]: {
            systemPrompt: prompt,
            examples: examples,
          },
        };

        // Save to localStorage
        try {
          localStorage.setItem('capabilityPrompts', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save capability prompts to localStorage', e);
        }

        return updated;
      });
    },
    []
  );

  // Prompt Building Methods

  // Build a system prompt based on agent configuration
  const buildSystemPrompt = useCallback(
    (agent: AgentConfiguration): string => {
      if (agent.systemPrompt && agent.systemPrompt.trim()) {
        return agent.systemPrompt;
      }

      // Build a prompt based on enabled capabilities
      const enabledCapabilities = agent.capabilities.filter(cap => cap.isEnabled);

      if (enabledCapabilities.length === 0) {
        return `You are ${agent.name}, a helpful AI assistant.`;
      }

      let prompt = `You are ${agent.name}, an AI assistant specialized in the following capabilities:\n\n`;

      enabledCapabilities.forEach(capability => {
        const capabilityPrompt = capabilityPrompts[capability.key]?.systemPrompt;
        if (capabilityPrompt) {
          // Only include the first line of each capability prompt in the overview
          prompt += `- ${capability.name}: ${capabilityPrompt.split('\n')[0]}\n`;
        } else {
          prompt += `- ${capability.name}\n`;
        }
      });

      prompt +=
        '\nWhen responding to requests, use your specialized capabilities appropriately based on the context.';

      return prompt;
    },
    [capabilityPrompts]
  );

  // Build a task-specific prompt for a capability
  const buildTaskPrompt = useCallback(
    (capability: string, context: Record<string, any> = {}): string => {
      const basePrompt = capabilityPrompts[capability]?.systemPrompt || '';

      if (!basePrompt) {
        return '';
      }

      // Replace variables in the prompt with context values
      let taskPrompt = basePrompt;

      Object.entries(context).forEach(([key, value]) => {
        taskPrompt = taskPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      });

      return taskPrompt;
    },
    [capabilityPrompts]
  );

  // Build a prompt by filling in template variables
  const buildPromptFromTemplate = useCallback(
    (templateId: string, variables: Record<string, any>): string => {
      const template = allTemplates[templateId];

      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      let prompt = template.template;

      // Combine default values with provided variables
      const allVariables = variables;

      // Replace all variables
      template.variables.forEach(variable => {
        const value = allVariables[variable.name] ?? variable.default ?? '';
        prompt = prompt.replace(new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'), String(value));
      });

      return prompt;
    },
    [allTemplates]
  );

  // Build a prompt from multiple templates based on capabilities
  const buildPromptFromCapabilities = useCallback(
    (capabilities: string[], variables: Record<string, any>): string => {
      // Find templates matching the requested capabilities
      const matchingTemplates = Object.values(allTemplates).filter(template =>
        template.capabilities.some(cap => capabilities.includes(cap))
      );

      if (matchingTemplates.length === 0) {
        throw new Error('No templates found for the specified capabilities');
      }

      // Build each template and combine them
      const prompts = matchingTemplates.map(template => {
        try {
          const templateVars: Record<string, any> = {};
          template.variables.forEach(v => {
            if (variables[v.name] !== undefined) {
              templateVars[v.name] = variables[v.name];
            }
          });
          return buildPromptFromTemplate(template.id, templateVars);
        } catch (e) {
          console.error(`Error building prompt for template ${template.id}:`, e);
          return '';
        }
      });

      // Join all non-empty prompts with separators
      return prompts.filter(Boolean).join('\n\n---\n\n');
    },
    [allTemplates, buildPromptFromTemplate]
  );

  // Get templates filtered by category, capability, or both
  const getTemplates = useCallback(
    (category?: string, capability?: string): PromptTemplate[] => {
      return Object.values(allTemplates).filter(template => {
        const categoryMatch = !category || template.category === category;
        const capabilityMatch = !capability || template.capabilities.includes(capability);
        return categoryMatch && capabilityMatch;
      });
    },
    [allTemplates]
  );

  // Combined public methods
  return {
    // State
    templates: Object.values(allTemplates),
    apiTemplates: templates,
    localTemplates,
    capabilityPrompts,
    isLoading,
    error,

    // Template Management - API
    fetchTemplates,
    saveApiTemplate,
    deleteApiTemplate,

    // Template Management - Local
    saveLocalTemplate,
    deleteLocalTemplate,

    // Capability Management
    getCapabilityPrompt,
    setCapabilityPrompt,

    // Prompt Building
    buildSystemPrompt,
    buildTaskPrompt,
    buildPromptFromTemplate,
    buildPromptFromCapabilities,
    getTemplates,
  };
}
