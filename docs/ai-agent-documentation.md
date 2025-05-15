# WorkspaxCRM AI Agent Documentation

## Overview

This documentation provides comprehensive guidance for implementing, administering, and using the AI agent capabilities within WorkspaxCRM. Our AI integration allows you to leverage intelligent agents across all modules of the CRM platform, automating tasks and providing valuable insights to improve productivity and decision-making.

## Table of Contents

1. [API Documentation](#api-documentation)
2. [User Guide](#user-guide)
3. [Administrator Manual](#administrator-manual)
4. [Examples & Tutorials](#examples-and-tutorials)
5. [Troubleshooting](#troubleshooting)

---

## API Documentation

### Core Endpoints

#### Agent Management

```typescript
// GET /api/agents
// Retrieves all agents available to the authenticated user

// POST /api/agents
// Creates a new agent
// Required body: { name, type, prompt, modelConfig, workspaceId }

// GET /api/agents/:id
// Retrieves a specific agent by ID

// PUT /api/agents/:id
// Updates an existing agent
// Required body: varies based on fields to update

// DELETE /api/agents/:id
// Deletes an agent
```

#### Agent Teams

```typescript
// GET /api/agent-teams
// Retrieves all agent teams

// POST /api/agent-teams
// Creates a new agent team
// Required body: { name, description, workspaceId }

// GET /api/agent-teams/:id
// Retrieves a specific team by ID

// PUT /api/agent-teams/:id
// Updates an existing team

// DELETE /api/agent-teams/:id
// Deletes a team

// POST /api/agent-teams/:id/members
// Adds an agent to a team
// Required body: { agentId, role }

// DELETE /api/agent-teams/:teamId/members/:agentId
// Removes an agent from a team
```

#### Agent Integration

```typescript
// GET /api/agent-integration/modules/:moduleType
// Get agents assigned to a specific module type

// POST /api/agent-integration/modules/:moduleType/assign
// Assign an agent or team to a module
// Required body: { agentId or teamId, priority, capabilities }

// GET /api/agent-integration/tasks/:moduleType
// Get available tasks for a module type

// POST /api/agent-integration/execute
// Execute a task using an agent
// Required body: { taskType, moduleType, moduleId, input, workspaceId }
```

### Request & Response Examples

#### Creating an Agent

Request:
```typescript
POST /api/agents
Content-Type: application/json

{
  "name": "Email Assistant",
  "description": "Helps draft and improve emails",
  "type": "EMAIL",
  "prompt": "You are an email assistant that helps users write professional emails...",
  "modelConfig": {
    "provider": "OPENAI",
    "modelName": "gpt-4o",
    "temperature": 0.7,
    "maxTokens": 2000,
    "systemMessage": "You are a helpful email assistant..."
  },
  "settings": {
    "requiresTraining": false,
    "isPublic": true
  },
  "capabilities": ["email_access", "web_search"],
  "workspaceId": "workspace-123"
}
```

Response:
```typescript
{
  "id": "agent-456",
  "name": "Email Assistant",
  "description": "Helps draft and improve emails",
  "type": "EMAIL",
  "status": "ACTIVE",
  "prompt": "You are an email assistant that helps users write professional emails...",
  "modelConfig": { /* model config */ },
  "settings": { /* settings */ },
  "capabilities": [
    {
      "id": "cap-1",
      "name": "email_access",
      "type": "EMAIL_ACCESS",
      "config": {}
    },
    {
      "id": "cap-2",
      "name": "web_search",
      "type": "WEB_SEARCH",
      "config": {}
    }
  ],
  "userId": "user-789",
  "workspaceId": "workspace-123",
  "createdAt": "2025-05-14T10:30:00.000Z",
  "updatedAt": "2025-05-14T10:30:00.000Z"
}
```

#### Executing a Task

Request:
```typescript
POST /api/agent-integration/execute
Content-Type: application/json

{
  "taskType": "generate_email_response",
  "moduleType": "email",
  "moduleId": "email-123",
  "input": {
    "emailSubject": "Meeting Follow-up",
    "emailBody": "Let's schedule a follow-up meeting to discuss...",
    "threadHistory": [/* previous emails */]
  },
  "userId": "user-789",
  "workspaceId": "workspace-123",
  "requiredCapabilities": ["email_access"]
}
```

Response:
```typescript
{
  "success": true,
  "taskId": "task-abc",
  "agentId": "agent-456",
  "output": {
    "message": "Email response generated successfully",
    "content": "Dear John,\n\nThank you for suggesting a follow-up meeting...",
    "suggestions": ["Add specific dates", "Mention the project timeline"]
  },
  "completedAt": "2025-05-14T10:35:00.000Z",
  "metrics": {
    "executionTime": 2.3,
    "tokensUsed": 328
  }
}
```

### TypeScript Client

A TypeScript client is available for easy integration:

```typescript
import { AgentClient } from '@/lib/api-clients/agent-client';

// Initialize client
const agentClient = new AgentClient();

// Create an agent
const newAgent = await agentClient.createAgent({
  name: 'Sales Assistant',
  type: 'SALES',
  // ...other properties
});

// Execute a task
const result = await agentClient.executeTask({
  taskType: 'qualify_lead',
  moduleType: 'contact',
  moduleId: 'contact-123',
  input: { /* task input */ }
});
```

### Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:

```typescript
{
  "error": "Error message",
  "details": {
    // Additional error details
  },
  "code": "ERROR_CODE"
}
```

### Rate Limiting

API requests are subject to rate limiting:

- 100 requests per minute for agent management
- 300 requests per minute for task execution
- 1000 requests per day for model training

When rate limited, the API returns status code `429 Too Many Requests`.

---

## User Guide

### Introduction to AI Agents

AI agents in WorkspaxCRM are specialized assistants that help you automate tasks and get insights across the CRM platform. Each agent is designed for specific purposes, such as email composition, lead qualification, or data analysis.

### Getting Started

#### Accessing AI Features

AI features are available throughout the CRM where you see the <Bot /> icon. Click this icon to access AI capabilities relevant to your current task.

#### Selecting an Agent

1. Navigate to any module (Email, Contacts, etc.)
2. Look for the "AI Assistant" button or sidebar
3. From the dropdown, select the agent most appropriate for your task
4. If no specific agent is selected, the system will automatically choose the best agent

### Module-Specific Features

#### Email Module

AI agents can help with:

- Drafting emails based on context
- Suggesting subject lines
- Improving existing email content
- Detecting tone and suggesting improvements
- Automatically categorizing emails
- Generating follow-up emails

To use an agent in the email module:

1. Open the email composer
2. Click "AI Assistant" in the right sidebar
3. Select a task such as "Generate Email" or "Improve Email"
4. Review and edit the suggested content

#### Contact Management

AI agents can:

- Qualify leads based on profile data
- Research companies and contacts
- Suggest next best actions
- Analyze communication history
- Generate personalized outreach

To analyze a contact:

1. Open a contact record
2. Click "AI Assistant" in the sidebar
3. Select "Qualify Lead" or another relevant task
4. Review the AI analysis and scoring

#### Templates

AI capabilities for templates:

- Generate template content
- Personalize templates for specific segments
- Improve existing templates
- Suggest optimal send times
- Create A/B test variations

### Working with Agent Teams

Agent teams combine multiple specialized agents for complex tasks:

1. Select a team instead of an individual agent
2. The team coordinates internally to complete multi-step tasks
3. Results from the team include comprehensive output from all agents involved

### Customizing AI Behavior

You can customize AI behavior in your user settings:

1. Go to Settings > AI Preferences
2. Set your default agents for different modules
3. Configure language preferences
4. Set preferred communication style
5. Enable/disable specific AI features

### Tips for Effective Use

- Be specific with your instructions
- Review and edit AI-generated content
- Provide feedback to improve future results
- Use specialized agents for specific tasks
- Combine AI with human judgment for best results

---

## Administrator Manual

### System Requirements

- WorkspaxCRM v3.5 or higher
- AI Module license activated
- Minimum 8GB RAM for server instances
- Required API access to selected AI providers

### Installation & Setup

#### Enabling AI Features

1. Navigate to Admin Settings > Features
2. Enable "AI Agents" feature flag
3. Select AI providers and configure API keys
4. Set default model parameters

#### AI Provider Configuration

Configure credentials for one or more AI providers:

```json
{
  "openai": {
    "apiKey": "YOUR_API_KEY",
    "organization": "YOUR_ORG_ID",
    "defaultModel": "gpt-4o"
  },
  "anthropic": {
    "apiKey": "YOUR_API_KEY",
    "defaultModel": "claude-3-opus"
  },
  "google": {
    "apiKey": "YOUR_API_KEY",
    "defaultModel": "gemini-pro"
  }
}
```

#### Database Setup

Run the database migrations for AI functionality:

```bash
npx prisma migrate deploy --name ai-agents
```

### Managing Agents

#### Creating Default Agents

1. Go to Admin > AI Agents
2. Click "Create Default Agents"
3. This will create standard agents for each module

#### Custom Agent Configuration

Create a custom agent:

1. Go to Admin > AI Agents > Create New
2. Select the agent type and model
3. Configure the base prompt and system message
4. Select required capabilities
5. Set permissions and visibility

#### Monitoring & Auditing

Monitor agent usage through the AI dashboard:

1. View usage metrics by agent and user
2. Audit task execution history
3. Review performance statistics
4. See error rates and common failure patterns

### Role-Based Access Control

Configure which user roles have access to AI features:

```typescript
// Example role configuration
const aiPermissions = {
  admin: {
    createAgents: true,
    editAllAgents: true,
    viewAuditLogs: true,
    configureGlobalSettings: true
  },
  manager: {
    createAgents: true,
    editOwnAgents: true,
    viewTeamUsage: true
  },
  user: {
    useAgents: true,
    createPersonalAgents: false
  }
};
```

### Cost Management

Control AI usage costs with these features:

1. Set token quotas per user or team
2. Configure cost centers for billing
3. Set up alerts for unusual usage patterns
4. View detailed cost breakdowns by department

### Security Considerations

Implement these security practices:

1. Enable content filtering for all AI outputs
2. Set up PII detection and redaction
3. Configure data retention policies
4. Implement approval workflows for sensitive operations

### Troubleshooting

Common issues and solutions:

1. **Agent Creation Failures**
   - Check API key validity
   - Verify network connectivity to AI provider
   - Ensure prompt length is within limits

2. **Performance Issues**
   - Scale database connection pool
   - Increase worker threads for task processing
   - Consider dedicated servers for high-volume instances

3. **Error Monitoring**
   - Enable detailed logging with `LOG_LEVEL=debug`
   - Set up error alerts in Admin > Notifications
   - Review error logs in Admin > System Logs

---

## Examples and Tutorials

### Creating Your First Agent

This tutorial walks through creating a custom support agent:

```typescript
// 1. Define the agent configuration
const supportAgentConfig = {
  name: "Customer Support Assistant",
  description: "Helps answer common customer questions",
  type: "SUPPORT",
  prompt: `You are a customer support assistant for WorkspaxCRM.
  Your goal is to help users with common questions about our product.
  Be friendly, concise, and accurate in your responses.`,
  modelConfig: {
    provider: "OPENAI",
    modelName: "gpt-4o",
    temperature: 0.3,
    maxTokens: 1000,
    systemMessage: "You are a helpful customer support assistant..."
  },
  capabilities: ["knowledge_base_access", "ticket_creation"],
  settings: {
    requiresTraining: true,
    isPublic: true
  }
};

// 2. Create the agent via API
const agent = await agentService.createAgent(supportAgentConfig);

// 3. Add training data
await agentService.addTrainingData({
  agentId: agent.id,
  type: "DOCUMENT",
  content: "# WorkspaxCRM FAQ\n\nQ: How do I reset my password?\nA: Go to login page and click 'Forgot Password'...",
  name: "Product FAQ",
  userId: currentUser.id
});

// 4. Assign to relevant modules
await agentIntegrationService.assignAgentToModule(
  agent.id,
  null, // No team
  "support",
  null, // All support module
  10, // High priority
  ["knowledge_base_access"]
);
```

### Setting Up an Agent Team

This example shows how to create a sales acceleration team:

```typescript
// 1. Create the team
const team = await agentService.createTeam({
  name: "Sales Acceleration Team",
  description: "Team of agents to help with sales processes",
  userId: currentUser.id,
  workspaceId: workspace.id
});

// 2. Add agents to the team
await agentService.addAgentToTeam({
  agentId: "lead-qualifier-agent-id",
  teamId: team.id,
  role: "lead"
});

await agentService.addAgentToTeam({
  agentId: "email-outreach-agent-id",
  teamId: team.id,
  role: "member"
});

await agentService.addAgentToTeam({
  agentId: "meeting-scheduler-agent-id",
  teamId: team.id,
  role: "member"
});

// 3. Assign team to relevant modules
await agentIntegrationService.assignAgentToModule(
  null, // No individual agent
  team.id,
  "contact", // Contact module
  null, // All contacts
  5, // Medium priority
  ["web_search", "email_access"]
);
```

### Building Email Workflows with AI

Tutorial for creating an email workflow with AI assistance:

```typescript
// 1. Define the workflow
const emailWorkflow = {
  name: "Lead Nurturing Sequence",
  steps: [
    {
      type: "ai_generate",
      agentId: "email-agent-id",
      taskType: "generate_initial_outreach",
      parameters: {
        tone: "professional",
        includeCompanyInfo: true
      }
    },
    {
      type: "wait",
      duration: { days: 3 }
    },
    {
      type: "condition",
      condition: "email.opened",
      ifTrue: {
        type: "ai_generate",
        agentId: "email-agent-id",
        taskType: "generate_followup_opened"
      },
      ifFalse: {
        type: "ai_generate",
        agentId: "email-agent-id",
        taskType: "generate_followup_unopened"
      }
    }
  ]
};

// 2. Create and activate the workflow
const workflow = await workflowService.createWorkflow(emailWorkflow);
await workflowService.activateWorkflow(workflow.id);

// 3. Apply the workflow to a segment
await workflowService.applyWorkflowToSegment(workflow.id, "new-leads-segment-id");
```

### Training an Agent with Custom Data

Example of training an agent with company-specific data:

```typescript
// 1. Prepare training data
const trainingData = [
  {
    type: "DOCUMENT",
    name: "Product Documentation",
    content: fs.readFileSync('product_docs.md', 'utf8')
  },
  {
    type: "CONVERSATION",
    name: "Sample Support Conversations",
    content: JSON.stringify(sampleConversations)
  },
  {
    type: "STRUCTURED_DATA",
    name: "Product Features",
    content: JSON.stringify(productFeatures)
  }
];

// 2. Add training data to agent
for (const data of trainingData) {
  await agentService.addTrainingData({
    agentId: "support-agent-id",
    type: data.type,
    name: data.name,
    content: data.content,
    userId: currentUser.id
  });
}

// 3. Initiate training
await agentService.trainAgent("support-agent-id");

// 4. Monitor training progress
const trainingStatus = await agentService.getTrainingStatus("support-agent-id");
console.log(`Training status: ${trainingStatus.status}, Progress: ${trainingStatus.progress}%`);
```

### Creating a Custom Module Integration

This example shows how to integrate AI into a custom CRM module:

```typescript
// 1. Define module tasks
await agentIntegrationService.defineModuleTask(
  "analyze_custom_data",
  "Analyzes data from the custom module",
  "custom_module",
  ["data_analysis", "web_search"]
);

// 2. Set up the UI component
function CustomModuleWithAI() {
  return (
    <div className="custom-module">
      <h1>Custom Module</h1>
      <div className="content">
        {/* Module specific content */}
      </div>
      <div className="ai-sidebar">
        <ModuleAgentSelector
          moduleType="custom_module"
          workspaceId={workspace.id}
          onAgentSelect={handleAgentSelect}
          onExecuteTask={handleExecuteTask}
        />
      </div>
    </div>
  );
}

// 3. Implement task handler
async function handleExecuteTask(taskType: string) {
  if (taskType === "analyze_custom_data") {
    const result = await agentIntegrationService.executeTask({
      taskType: "analyze_custom_data",
      moduleType: "custom_module",
      input: {
        customData: getCustomModuleData()
      },
      userId: currentUser.id,
      workspaceId: workspace.id
    });

    updateUIWithResult(result);
  }
}
```

---

## Troubleshooting

### Common Issues

#### Agent Not Available in Module

**Problem:** The AI agent isn't appearing in a specific module
**Solution:**
1. Check that the agent has been assigned to this module type
2. Verify the agent has the required capabilities for this module
3. Ensure the user has permission to access AI features
4. Check that the agent is active and not in training mode

#### Poor Quality AI Responses

**Problem:** Agent responses aren't helpful or relevant
**Solution:**
1. Improve the agent's prompt with more specific instructions
2. Add more training data relevant to the use case
3. Adjust the temperature setting (lower for more focused responses)
4. Check if more context is needed in the task input

#### Performance Issues

**Problem:** AI tasks are taking too long to complete
**Solution:**
1. Check your API rate limits with the AI provider
2. Consider using a faster model for time-sensitive tasks
3. Optimize the amount of context sent with each request
4. Use task caching for common operations

#### Integration Errors

**Problem:** Errors when integrating with specific modules
**Solution:**
1. Check the browser console for specific error messages
2. Verify the module type is correctly defined in the integration service
3. Ensure required capabilities are correctly configured
4. Check the task execution logs for detailed error information

### Getting Support

For additional help, contact WorkspaxCRM support:

- Email: support@workspaxcrm.com
- Support Portal: https://support.workspaxcrm.com
- Community Forum: https://community.workspaxcrm.com/ai-agents

Our support team is available 24/7 to assist with AI agent configuration and troubleshooting.
