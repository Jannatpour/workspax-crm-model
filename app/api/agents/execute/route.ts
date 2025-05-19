// app/api/agents/execute/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { MistralClient } from '@mistralai/mistralai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Schema for agent execution request
const executionSchema = z.object({
  agentId: z.string(),
  actionType: z.string(),
  input: z.any(),
  options: z.record(z.any()).optional(),
});

// Initialize AI service clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const mistral = new MistralClient(process.env.MISTRAL_API_KEY || '');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Interface for AI client functions
interface AIClient {
  generateText: (prompt: string, options: any) => Promise<string>;
}

// OpenAI client implementation
const openaiClient: AIClient = {
  generateText: async (prompt: string, options: any) => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: options.systemPrompt || '' },
        { role: 'user', content: prompt },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      presence_penalty: options.presencePenalty,
      frequency_penalty: options.frequencyPenalty,
    });

    return response.choices[0]?.message.content || '';
  },
};

// Anthropic client implementation
const anthropicClient: AIClient = {
  generateText: async (prompt: string, options: any) => {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      system: options.systemPrompt || '',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
    });

    return response.content[0]?.text || '';
  },
};

// Mistral client implementation
const mistralClient: AIClient = {
  generateText: async (prompt: string, options: any) => {
    const response = await mistral.chat({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: options.systemPrompt || '' },
        { role: 'user', content: prompt },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP,
    });

    return response.choices[0]?.message.content || '';
  },
};

// Google client implementation
const googleClient: AIClient = {
  generateText: async (prompt: string, options: any) => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: options.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens,
        topP: options.topP,
      },
    });

    return result.response.text();
  },
};

// Get AI client based on model type
function getAIClient(modelType: string): AIClient {
  switch (modelType) {
    case 'gpt-4o':
      return openaiClient;
    case 'claude-3-opus':
      return anthropicClient;
    case 'mistral-large':
      return mistralClient;
    case 'gemini-pro':
      return googleClient;
    default:
      return openaiClient; // Default to OpenAI
  }
}

// Helper function to parse JSON from AI output safely
function safeJsonParse(text: string) {
  try {
    // Find JSON-like content between curly braces
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON-like content, try parsing the whole text
    return JSON.parse(text);
  } catch (error) {
    console.error('Error parsing JSON from AI output:', error);
    console.log('Original text:', text);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();

    // Validate the input
    const validatedData = executionSchema.parse(body);

    // Get the agent
    const agent = await prisma.agent.findUnique({
      where: {
        id: validatedData.agentId,
      },
      include: {
        capabilities: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if the agent is active
    if (agent.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Agent is not active' }, { status: 400 });
    }

    // Check if the user has access to the agent's workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: agent.workspaceId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Access denied to this agent' }, { status: 403 });
    }

    // Create an agent run record
    const agentRun = await prisma.agentRun.create({
      data: {
        status: 'RUNNING',
        input: validatedData.input,
        agentId: agent.id,
        startedAt: new Date(),
      },
    });

    try {
      // Get the AI client based on the agent's model type
      const aiClient = getAIClient(agent.type);

      // Create a task execution record
      const taskExecution = await prisma.moduleAgentTaskExecution.create({
        data: {
          taskName: validatedData.actionType,
          moduleType: validatedData.input.moduleType || 'unknown',
          moduleId: validatedData.input.moduleId,
          agentId: agent.id,
          input: validatedData.input,
          status: 'running',
          startedAt: new Date(),
          userId: user.id,
          workspaceId: workspace.id,
        },
      });

      // Process different action types
      let result;

      switch (validatedData.actionType) {
        case 'analyze_email': {
          // Process email analysis
          const { emailId, subject, body, sender, date } = validatedData.input;

          // Create a prompt for email analysis
          const promptText = `
Analyze the following email:

Subject: ${subject || 'N/A'}
From: ${sender || 'N/A'}
Date: ${date || 'N/A'}

${body || ''}

Provide a comprehensive analysis of this email in JSON format with the following structure:
{
  "summary": "A concise summary of the email content",
  "sentiment": "positive|negative|neutral|mixed",
  "intents": ["list", "of", "detected", "intents"],
  "entities": {
    "people": ["list", "of", "people", "mentioned"],
    "organizations": ["list", "of", "organizations"],
    "dates": ["list", "of", "dates", "mentioned"],
    "locations": ["list", "of", "locations"],
    "topics": ["list", "of", "key", "topics"]
  },
  "actionItems": ["list", "of", "action", "items"],
  "priority": "high|medium|low",
  "responseNeeded": true|false,
  "category": "category of the email",
  "language": "detected language",
  "confidenceScore": 0.95
}

Only respond with the JSON object and nothing else.
`;

          // Generate the analysis
          const analysisText = await aiClient.generateText(promptText, {
            systemPrompt: agent.prompt,
            ...agent.modelConfig,
          });

          // Parse the JSON response
          result = safeJsonParse(analysisText);

          if (!result) {
            throw new Error('Failed to parse analysis result');
          }

          // Add a default ID to the result
          result.id = `analysis-${Date.now()}`;

          break;
        }

        case 'generate_suggestions': {
          // Process email suggestions generation
          const { emailId, analysis } = validatedData.input;

          if (!analysis) {
            throw new Error('Email analysis is required for generating suggestions');
          }

          // Create a prompt for generating suggestions
          const promptText = `
Based on the following email analysis, generate appropriate action suggestions:

${JSON.stringify(analysis, null, 2)}

Provide a list of suggestions in JSON format as an array with the following structure for each suggestion:
[
  {
    "id": "suggestion-unique-id",
    "type": "reply|forward|task|meeting|note",
    "title": "Short descriptive title",
    "content": "The actual content of the suggestion",
    "priority": "high|medium|low",
    "confidence": 0.95
  }
]

Consider the sentiment, intent, and action items when creating these suggestions.
If the email requires a response, include reply suggestions.
If it contains tasks, include task suggestions.
If it mentions meetings, include meeting suggestions.
Only respond with the JSON array and nothing else.
`;

          // Generate the suggestions
          const suggestionsText = await aiClient.generateText(promptText, {
            systemPrompt: agent.prompt,
            ...agent.modelConfig,
          });

          // Parse the JSON response
          result = safeJsonParse(suggestionsText);

          if (!result || !Array.isArray(result)) {
            // If parsing failed or result is not an array, create a default suggestion
            result = [
              {
                id: `suggestion-${Date.now()}`,
                type: 'reply',
                title: 'General Reply',
                content: 'Thank you for your email. I have received it and will respond shortly.',
                priority: 'medium',
                confidence: 0.7,
              },
            ];
          }

          // Ensure each suggestion has an ID
          result = result.map((suggestion, index) => ({
            ...suggestion,
            id: suggestion.id || `suggestion-${Date.now()}-${index}`,
          }));

          break;
        }

        case 'generate_email': {
          // Process email generation
          const { purpose, recipient, key_points, tone, context } = validatedData.input;

          // Create a prompt for email generation
          const promptText = `
Generate a professional email with the following details:

Purpose: ${purpose || 'General communication'}
Recipient: ${recipient || 'The recipient'}
Key Points to Include:
${Array.isArray(key_points) ? key_points.map(point => `- ${point}`).join('\n') : 'Not specified'}
Tone: ${tone || 'Professional'}
Context: ${context || 'N/A'}

Provide the email in JSON format with the following structure:
{
  "subject": "The email subject line",
  "body": "The complete email body with appropriate greeting and signature"
}

Only respond with the JSON object and nothing else.
`;

          // Generate the email
          const emailText = await aiClient.generateText(promptText, {
            systemPrompt: agent.prompt,
            ...agent.modelConfig,
          });

          // Parse the JSON response
          result = safeJsonParse(emailText);

          if (!result) {
            throw new Error('Failed to parse email generation result');
          }

          break;
        }

        default:
          throw new Error(`Unsupported action type: ${validatedData.actionType}`);
      }

      // Update the task execution with results
      await prisma.moduleAgentTaskExecution.update({
        where: { id: taskExecution.id },
        data: {
          output: result,
          status: 'completed',
          completedAt: new Date(),
          executionTime: (Date.now() - taskExecution.createdAt.getTime()) / 1000, // in seconds
        },
      });

      // Update the agent run record
      await prisma.agentRun.update({
        where: { id: agentRun.id },
        data: {
          status: 'COMPLETED',
          output: result,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({ output: result });
    } catch (error: any) {
      // Update the task execution with error
      await prisma.moduleAgentTaskExecution.updateMany({
        where: {
          agentId: agent.id,
          status: 'running',
        },
        data: {
          error: error.message,
          status: 'failed',
          completedAt: new Date(),
        },
      });

      // Update the agent run record
      await prisma.agentRun.update({
        where: { id: agentRun.id },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  } catch (error: any) {
    console.error('Error executing agent action:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to execute agent action' },
      { status: 500 }
    );
  }
}
