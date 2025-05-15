# WorkspaxCRM AI Agent Implementation Guide

## Introduction

This technical implementation guide provides detailed instructions for developers integrating the AI agent functionality into WorkspaxCRM. It covers the architecture, component structure, and best practices for extending the system with new AI capabilities.

## System Architecture

### Overview

The AI integration architecture consists of several key components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  CRM Modules    │◄────┤  Integration    │◄────┤   AI Services   │
│  (UI Layer)     │     │  Services       │     │   & Models      │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  API Layer      │◄────┤  Database       │◄────┤   External      │
│  (Next.js API)  │     │  (Prisma/SQL)   │     │   Services      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Components

- **UI Layer**: React components that provide AI functionality in each CRM module
- **Integration Services**: TypeScript services that coordinate between CRM functions and AI capabilities
- **AI Services**: Core services that interact with AI providers and manage agent logic
- **API Layer**: Next.js API routes for client-server communication
- **Database Layer**: Prisma models for storing agent configurations and execution history
- **External Services**: Connections to AI providers (OpenAI, Anthropic, etc.)

## Core Services Implementation

### Agent Service

The Agent Service manages the lifecycle of AI agents:

```typescript
// lib/services/agent-service.ts

import { db } from '@/lib/db';
import {
  AgentType,
  AgentStatus,
  CapabilityType
} from '@prisma/client';

export type AgentInput = {
  name: string;
  description?: string;
  type: AgentType;
  status: AgentStatus;
  prompt: string;
  modelConfig: {
    provider: string;
    modelName: string;
    temperature: number;
    maxTokens: number;
    systemMessage?: string;
  };
  settings: {
    requiresTraining: boolean;
    isPublic: boolean;
  };
  capabilities: string[];
  avatarUrl?: string;
  userId: string;
  workspaceId: string;
};

export const AgentService = {
  async createAgent(data: AgentInput) {
    try {
      // Create the agent
      const agent = await db.agent.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          status: data.status,
          prompt: data.prompt,
          modelConfig: data.modelConfig,
          settings: data.settings,
          avatarUrl: data.avatarUrl,
          user: { connect: { id: data.userId } },
          workspace: { connect: { id: data.workspaceId } },
        },
      });

      // Create capabilities if provided
      if (data.capabilities && data.capabilities.length > 0) {
        await Promise.all(
          data.capabilities.map((capability) => {
            const [type, name] = capability.split('_');
            return db.agentCapability.create({
              data: {
                name: name || capability,
                type: type.toUpperCase() as CapabilityType,
                config: {},
                agent: { connect: { id: agent.id } },
              },
            });
          })
        );
      }

      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  },

  // Additional methods for managing agents
  // ...
};
```

### Integration Service

The Integration Service connects agents with CRM modules:

```typescript
// lib/services/agent-integration-service.ts

import { AgentService } from './agent-service';
import { AiService } from './ai-service';

export type ModuleType = 'email' | 'contact' | 'template' | 'workflow' | 'calendar' | 'lead' | 'task';

export type AgentTaskRequest = {
  taskType: string;
  moduleType: ModuleType;
  moduleId?: string;
  input: any;
  userId: string;
  workspaceId: string;
  priority?: 'low' | 'normal' | 'high';
  requiredCapabilities?: string[];
  preferredAgentId?: string;
  preferredTeamId?: string;
};

export const AgentIntegrationService = {
  async findSuitableAgents(
    moduleType: ModuleType,
    requiredCapabilities: string[] = [],
    workspaceId: string
  ) {
    try {
      // Find agents assigned to module or with matching capabilities
      // ...
    } catch (error) {
      console.error('Error finding suitable agents:', error);
      throw error;
    }
  },

  async executeTask(request: AgentTaskRequest) {
    try {
      // Find suitable agent, prepare context, execute task
      // ...
    } catch (error) {
      console.error('Error executing task:', error);
      throw error;
    }
  },

  // Additional integration methods
  // ...
};
```

### AI Service

The AI Service provides the interface to AI models:

```typescript
// lib/services/ai-service.ts

export type AiModelConfig = {
  provider: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemMessage?: string;
};

export type AiChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AiChatRequest = {
  messages: AiChatMessage[];
  modelConfig: AiModelConfig;
  capabilities?: AiCapabilityConfig[];
};

export const AiService = {
  async chat(request: AiChatRequest) {
    try {
      // Handle provider-specific implementation
      switch (request.modelConfig.provider.toUpperCase()) {
        case 'OPENAI':
          return this.chatWithOpenAI(request);
        case 'ANTHROPIC':
          return this.chatWithAnthropic(request);
        case 'GOOGLE':
          return this.chatWithGoogle(request);
        // Additional providers
        default:
          throw new Error(`Unsupported provider: ${request.modelConfig.provider}`);
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw error;
    }
  },

  async chatWithOpenAI(request: AiChatRequest) {
    // OpenAI-specific implementation
    // ...
  },

  // Additional methods for different AI providers
  // ...
};
```

## Database Schema Implementation

### Core Agent Models

Implement these Prisma models:

```prisma
// prisma/schema.prisma

model Agent {
  id                  String              @id @default(cuid())
  name                String
  description         String?
  type                AgentType
  status              AgentStatus         @default(DRAFT)
  avatarUrl           String?
  prompt              String              @db.Text
  modelConfig         Json                @default("{}")
  settings            Json                @default("{}")
  capabilities        AgentCapability[]
  rating              Float?
  usageCount          Int                 @default(0)
  userId              String
  workspaceId         String
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  user                User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace           Workspace           @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  // Relations
  teamMemberships     AgentTeamMember[]
  runs                AgentRun[]
  trainingData        AgentTrainingData[]
  conversations       AgentConversation[]
  workflows           AgentWorkflow[]
  feedbacks           AgentFeedback[]
  moduleAssignments   ModuleAgentAssignment[]
  taskExecutions      ModuleAgentTaskExecution[]
}

model AgentCapability {
  id        String         @id @default(cuid())
  name      String
  type      CapabilityType
  config    Json           @default("{}")
  agentId   String
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  agent     Agent          @relation(fields: [agentId], references: [id], onDelete: Cascade)
}

// Additional models for teams, runs, training, etc.
// ...

// Integration models
model ModuleAgentAssignment {
  id           String     @id @default(cuid())
  agentId      String?
  teamId       String?
  moduleType   String
  moduleId     String?
  isActive     Boolean    @default(true)
  priority     Int        @default(1)
  capabilities String[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  agent        Agent?     @relation(fields: [agentId], references: [id], onDelete: SetNull)
  team         AgentTeam? @relation(fields: [teamId], references: [id], onDelete: SetNull)

  @@index([moduleType, moduleId])
}
```

## API Routes Implementation

### Agent Management Endpoints

```typescript
// app/api/agents/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AgentService } from '@/lib/services/agent-service';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await req.json();

    // Create agent
    const agent = await AgentService.createAgent({
      ...body,
      userId: session.user.id,
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Implementation for listing agents
    // ...
  } catch (error: any) {
    // Error handling
    // ...
  }
}
```

### Task Execution Endpoint

```typescript
// app/api/agent-integration/execute/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AgentIntegrationService } from '@/lib/services/agent-integration-service';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await req.json();

    // Execute task
    const result = await AgentIntegrationService.executeTask({
      ...body,
      userId: session.user.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error executing task:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

## UI Components Implementation

### Module Agent Selector

A reusable component for selecting agents:

```tsx
// components/module-agent-selector.tsx

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Bot, Users } from 'lucide-react';

interface ModuleAgentSelectorProps {
  moduleType: string;
  moduleId?: string;
  onAgentSelect?: (agentId: string | null, teamId: string | null) => void;
  onExecuteTask?: (taskType: string) => void;
  workspaceId: string;
  compact?: boolean;
}

export function ModuleAgentSelector({
  moduleType,
  moduleId,
  onAgentSelect,
  onExecuteTask,
  workspaceId,
  compact = false,
}: ModuleAgentSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Implementation details
  // ...

  return (
    <div className="...">
      {/* Component UI */}
    </div>
  );
}
```

### Email Module Integration

Example of integrating AI into the email module:

```tsx
// components/mail/mail-compose.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ModuleAgentSelector } from '@/components/module-agent-selector';
import { toast } from '@/components/ui/use-toast';

export function MailCompose() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm({
    // Form configuration
  });

  // Handle agent selection
  const handleAgentSelect = (agentId: string | null, teamId: string | null) => {
    setSelectedAgentId(agentId);
  };

  // Handle AI task execution
  const handleExecuteTask = async (taskType: string) => {
    setIsGenerating(true);

    try {
      // Execute task using API
      const response = await fetch('/api/agent-integration/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          moduleType: 'email',
          input: {
            // Task-specific input
            subject: form.getValues('subject'),
            body: form.getValues('body'),
          },
          workspaceId,
        }),
      });

      if (!response.ok) throw new Error('Failed to execute task');

      const result = await response.json();

      // Update UI with result
      if (result.success) {
        if (taskType === 'generate_email') {
          form.setValue('subject', result.output.subject);
          form.setValue('body', result.output.body);
        }
        // Handle other task types...

        toast({
          title: 'Success',
          description: 'AI task completed successfully',
        });
      }
    } catch (error) {
      console.error('Error executing AI task:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute AI task',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="...">
      {/* Email compose UI */}
      <div className="ai-sidebar">
        <ModuleAgentSelector
          moduleType="email"
          workspaceId={workspaceId}
          onAgentSelect={handleAgentSelect}
          onExecuteTask={handleExecuteTask}
        />
      </div>
    </div>
  );
}
```

## Testing Implementation

### Unit Tests

Example of unit tests for the agent service:

```typescript
// __tests__/services/agent-service.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentService } from '@/lib/services/agent-service';
import { prismaMock } from '@/lib/prisma-mock';

vi.mock('@/lib/db', () => ({
  db: prismaMock,
}));

describe('AgentService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createAgent', () => {
    it('should create an agent with capabilities', async () => {
      // Setup mocks
      prismaMock.agent.create.mockResolvedValue({
        id: 'agent-1',
        name: 'Test Agent',
        // Other fields
      });

      prismaMock.agentCapability.create.mockResolvedValue({
        id: 'cap-1',
        name: 'web_search',
        type: 'WEB_SEARCH',
        config: {},
        agentId: 'agent-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Execute test
      const result = await AgentService.createAgent({
        name: 'Test Agent',
        type: 'SUPPORT',
        status: 'ACTIVE',
        prompt: 'Test prompt',
        modelConfig: { provider: 'OPENAI', modelName: 'gpt-4' },
        settings: { requiresTraining: false, isPublic: true },
        capabilities: ['web_search'],
        userId: 'user-1',
        workspaceId: 'workspace-1',
      });

      // Assertions
      expect(result).toHaveProperty('id', 'agent-1');
      expect(prismaMock.agent.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.agentCapability.create).toHaveBeenCalledTimes(1);
    });
  });

  // Additional tests
  // ...
});
```

### Integration Tests

Example of integration tests for the API:

```typescript
// __tests__/api/agents.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST, GET } from '@/app/api/agents/route';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'user-1', name: 'Test User' },
  }),
}));

vi.mock('@/lib/services/agent-service', () => ({
  AgentService: {
    createAgent: vi.fn(),
    getAgents: vi.fn(),
  },
}));

describe('Agents API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', async () => {
      // Setup mocks
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Agent',
          type: 'SUPPORT',
          // Other fields
        },
      });

      const AgentService = require('@/lib/services/agent-service').AgentService;
      AgentService.createAgent.mockResolvedValue({
        id: 'agent-1',
        name: 'Test Agent',
        // Other fields
      });

      // Execute test
      await POST(req, res);

      // Assertions
      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toHaveProperty('id', 'agent-1');
      expect(AgentService.createAgent).toHaveBeenCalledTimes(1);
    });
  });

  // Additional tests
  // ...
});
```

## Extending the System

### Adding New Agent Types

To add a new agent type:

1. Update the `AgentType` enum in the Prisma schema:

```prisma
enum AgentType {
  // Existing types
  SUPPORT
  EMAIL
  SALES
  // New type
  DATA_ANALYSIS
}
```

2. Create prompt templates for the new type:

```typescript
// lib/data/agent-templates.ts

export const agentTemplates = {
  // Existing templates
  // ...

  // New template
  DATA_ANALYSIS: {
    name: "Data Analysis Agent",
    prompt: `You are a data analysis agent that helps users interpret data and generate insights.
    Your primary responsibilities are:
    1. Analyzing numeric data to identify trends and patterns
    2. Creating summaries of key metrics
    3. Suggesting possible visualizations for data
    4. Identifying anomalies and outliers
    ...`,
    systemMessage: "You are a helpful data analysis assistant...",
    suggestedCapabilities: ["database_access", "data_visualization"],
  },
};
```

3. Update UI to support the new type:

```tsx
// components/agents/agent-create.tsx

// Add to agent type options
<Select>
  {/* Existing options */}
  <SelectItem value="SUPPORT">Support</SelectItem>
  <SelectItem value="EMAIL">Email</SelectItem>
  {/* New option */}
  <SelectItem value="DATA_ANALYSIS">Data Analysis</SelectItem>
</Select>
```

### Adding New Capabilities

To add a new agent capability:

1. Update the `CapabilityType` enum in the Prisma schema:

```prisma
enum CapabilityType {
  // Existing types
  WEB_SEARCH
  EMAIL_SENDING
  // New capability
  DATA_VISUALIZATION
}
```

2. Implement the capability handler in the AI service:

```typescript
// lib/services/capabilities/data-visualization.ts

export async function handleDataVisualization(params: any) {
  try {
    // Implementation for data visualization capability
    const { data, chartType } = params;

    // Generate visualization code or data
    // ...

    return {
      success: true,
      visualization: {
        type: chartType,
        data: processedData,
        code: chartCode,
      },
    };
  } catch (error) {
    console.error('Error in data visualization capability:', error);
    throw error;
  }
}
```

3. Register the capability handler:

```typescript
// lib/services/ai-service.ts

import { handleDataVisualization } from './capabilities/data-visualization';

// In the capability handler map
const capabilityHandlers = {
  // Existing handlers
  WEB_SEARCH: handleWebSearch,
  EMAIL_SENDING: handleEmailSending,
  // New handler
  DATA_VISUALIZATION: handleDataVisualization,
};
```

4. Update UI to support the new capability:

```tsx
// Update available capabilities in the UI
const capabilities = [
  // Existing capabilities
  { id: 'web_search', label: 'Web Search', icon: <Search /> },
  // New capability
  { id: 'data_visualization', label: 'Data Visualization', icon: <BarChart /> },
];
```

### Creating Custom Module Integration

To integrate AI into a custom module:

1. Define module tasks:

```typescript
// lib/services/tasks/custom-module-tasks.ts

export const customModuleTasks = [
  {
    type: 'analyze_custom_data',
    name: 'Analyze Custom Data',
    description: 'Analyzes data from the custom module',
    requiredCapabilities: ['data_analysis'],

    async handler(params: any) {
      // Task implementation
      // ...
      return {
        analysis: {
          summary: "...",
          insights: ["...", "..."],
          recommendations: ["...", "..."],
        },
      };
    },
  },
];
```

2. Register the module type and tasks:

```typescript
// In your module initialization code

import { AgentIntegrationService } from '@/lib/services/agent-integration-service';
import { customModuleTasks } from '@/lib/services/tasks/custom-module-tasks';

// Register each task
for (const task of customModuleTasks) {
  await AgentIntegrationService.defineModuleTask(
    task.type,
    task.name,
    'custom_module', // Module type
    task.requiredCapabilities
  );
}
```

3. Add the UI integration:

```tsx
// components/custom-module/custom-module-view.tsx

import { ModuleAgentSelector } from '@/components/module-agent-selector';

export function CustomModuleView() {
  // Component state and logic
  // ...

  return (
    <div className="custom-module-layout">
      <div className="main-content">
        {/* Main module UI */}
      </div>
      <div className="ai-sidebar">
        <ModuleAgentSelector
          moduleType="custom_module"
          moduleId={customModuleId}
          workspaceId={workspaceId}
          onAgentSelect={handleAgentSelect}
          onExecuteTask={handleExecuteTask}
        />
      </div>
    </div>
  );
}
```

## Performance Optimization

### Caching Strategies

Implement caching for AI responses:

```typescript
// lib/services/ai-service.ts

import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Connect to Redis
redisClient.connect();

// In the chat method
async chat(request: AiChatRequest) {
  try {
    // Generate cache key based on request
    const cacheKey = this.generateCacheKey(request);

    // Check cache first
    const cachedResponse = await redisClient.get(cacheKey);
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }

    // If not in cache, proceed with normal request
    const response = await this.makeAiRequest(request);

    // Cache the response (with appropriate TTL based on task type)
    const ttl = this.getTtlForRequest(request);
    await redisClient.set(cacheKey, JSON.stringify(response), { EX: ttl });

    return response;
  } catch (error) {
    // Error handling
    // ...
  }
}
```

### Task Queue for Long-Running Tasks

Implement a task queue for efficient processing:

```typescript
// lib/services/task-queue.ts

import { Queue } from 'bullmq';
import { AgentService } from './agent-service';
import { AiService } from './ai-service';

// Create task queue
const taskQueue = new Queue('agent-tasks', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Task processor
export async function processTask(job) {
  const { taskType, input, agentId, userId, workspaceId } = job.data;

  try {
    // Get agent
    const agent = await AgentService.getAgent(agentId);

    // Execute AI task
    const result = await AiService.chat({
      messages: [
        { role: 'system', content: agent.modelConfig.systemMessage || '' },
        { role: 'user', content: JSON.stringify(input) },
      ],
      modelConfig: agent.modelConfig,
      // Other config
    });

    // Process and store result
    await AgentService.storeTaskResult(job.id, result);

    return { success: true, result };
  } catch (error) {
    console.error(`Error processing task ${job.id}:`, error);
    await AgentService.storeTaskError(job.id, error);
    return { success: false, error: error.message };
  }
}

// Add task to queue
export async function queueTask(taskData) {
  const job = await taskQueue.add('execute', taskData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });

  return job.id;
}
```

## Security Best Practices

### Input Validation

Implement thorough input validation:

```typescript
// lib/validations/agent-validation.ts

import { z } from 'zod';

// Validation schemas
export const agentInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  type: z.enum(['SUPPORT', 'EMAIL', 'SALES', 'SCHEDULING', 'CONTENT', 'RESEARCH', 'ASSISTANT', 'CODING', 'CUSTOM']),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  modelConfig: z.object({
    provider: z.enum(['OPENAI', 'ANTHROPIC', 'GOOGLE', 'MISTRAL', 'CUSTOM']),
    modelName: z.string().min(1, 'Model name is required'),
    temperature: z.number().min(0).max(1),
    maxTokens: z.number().min(100).max(16000),
    systemMessage: z.string().optional(),
  }),
  settings: z.object({
    requiresTraining: z.boolean().default(false),
    isPublic: z.boolean().default(false),
  }),
  capabilities: z.array(z.string()).optional(),
  avatarUrl: z.string().url().optional(),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

// Usage in API route
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = agentInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }

    // Proceed with validated data
    const validatedData = validation.data;
    // ...
  } catch (error) {
    // Error handling
    // ...
  }
}
```

### Content Filtering

Implement content filtering for AI responses:

```typescript
// lib/services/content-filter.ts

export async function filterContent(content: string): Promise<{ safe: boolean, filteredContent: string }> {
  try {
    // Check for harmful content using a filtering service or API
    // This is a simplified example - in practice, you'd use a more robust solution

    const harmfulPatterns = [
      /malicious code/i,
      /harmful instructions/i,
      // Other patterns
    ];

    let safe = true;
    let filteredContent = content;

    for (const pattern of harmfulPatterns) {
      if (pattern.test(content)) {
        safe = false;
        filteredContent = filteredContent.replace(pattern, '[FILTERED]');
      }
    }

    // For sensitive operations, you can also use the AI provider's content filtering
    // Example with OpenAI's moderation API:
    if (process.env.USE_OPENAI_MODERATION === 'true') {
      const { Configuration, OpenAIApi } = require('openai');
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      const moderationResponse = await openai.createModeration({
        input: content,
      });

      if (moderationResponse.data.results[0].flagged) {
        safe = false;
        // Handle moderation flags
        // ...
      }
    }

    return { safe, filteredContent };
  } catch (error) {
    console.error('Error in content filtering:', error);
    // Default to safe behavior on error, but log the issue
    return { safe: true, filteredContent: content };
  }
}

// Usage in AI service
async chat(request: AiChatRequest) {
  // Get response from AI provider
  const response = await this.makeAiRequest(request);

  // Filter the content
  const { safe, filteredContent } = await filterContent(response.content);

  // Handle unsafe content
  if (!safe) {
    console.warn('Potentially unsafe content filtered:', response.content);
    response.content = filteredContent;

    // Optionally log the incident
    await this.logSafetyIncident({
      userId: request.userId,
      workspaceId: request.workspaceId,
      originalContent: response.content,
      filteredContent,
    });
  }

  return response;
}
```

## Deployment Considerations

### Environment Configuration

Example `.env` configuration:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/workspaxcrm"

# Redis for caching and task queue
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# AI Providers
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="..."
MISTRAL_API_KEY="..."

# Security
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Feature Flags
ENABLE_AI_FEATURES="true"
USE_OPENAI_MODERATION="true"

# Monitoring
SENTRY_DSN="https://..."
```

### Resource Requirements

Recommended server specifications:

- **For small deployments (< 50 users):**
  - 4 vCPUs
  - 8 GB RAM
  - 100 GB SSD
  - Redis instance for caching and queues

- **For medium deployments (50-200 users):**
  - 8 vCPUs
  - 16 GB RAM
  - 250 GB SSD
  - Dedicated Redis instance
  - Load balancer for API routes

- **For large deployments (200+ users):**
  - 16+ vCPUs
  - 32+ GB RAM
  - 500+ GB SSD
  - Redis cluster
  - Load balanced API instances
  - Separate worker instances for task processing

### Monitoring Setup

Implement monitoring with Sentry:

```typescript
// lib/monitoring.ts

import * as Sentry from '@sentry/nextjs';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
});

// Custom error handler
export function captureAiError(error: any, context: any) {
  Sentry.captureException(error, {
    tags: {
      source: 'ai_service',
      agentId: context.agentId,
      provider: context.provider,
    },
    extra: {
      input: context.input,
      modelConfig: context.modelConfig,
    },
  });
}

// Usage in services
try {
  // AI operation
} catch (error) {
  captureAiError(error, {
    agentId: agent.id,
    provider: agent.modelConfig.provider,
    input: request.input,
    modelConfig: agent.modelConfig,
  });
  throw error;
}
```

## Conclusion

This implementation guide provides a comprehensive framework for integrating AI agents into the WorkspaxCRM platform. Following these patterns will ensure a scalable, secure, and maintainable system that can grow with your needs.

For additional support, refer to the following resources:

- [API Documentation](./api-documentation.md)
- [User Guide](./user-guide.md)
- [Administrator Manual](./administrator-manual.md)
- [Examples and Tutorials](./examples-and-tutorials.md)
