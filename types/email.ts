// File: src/types/email.ts

export interface EmailAIAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  intent: string;
  urgency: 'low' | 'medium' | 'high';
  detectedLeads?: DetectedLead[];
  detectedTasks?: DetectedTask[];
  detectedEvents?: DetectedEvent[];
  keyEntities?: KeyEntity[];
  suggestedResponses?: SuggestedResponse[];
}

export interface DetectedLead {
  id?: string;
  name: string;
  email?: string;
  company?: string;
  title?: string;
  phone?: string;
  confidence: number;
  source: {
    emailId: string;
    text: string;
    position: {
      start: number;
      end: number;
    };
  };
}

export interface DetectedTask {
  id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  confidence: number;
  source: {
    emailId: string;
    text: string;
    position: {
      start: number;
      end: number;
    };
  };
}

export interface DetectedEvent {
  id?: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  attendees?: string[];
  confidence: number;
  source: {
    emailId: string;
    text: string;
    position: {
      start: number;
      end: number;
    };
  };
}

export interface KeyEntity {
  type: 'person' | 'organization' | 'location' | 'date' | 'product' | 'other';
  text: string;
  value?: string;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
}

export interface SuggestedResponse {
  text: string;
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  confidence: number;
}

// File: src/types/automation.ts

export interface ScheduledJob {
  id?: string;
  name: string;
  scheduledTime: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  userId: string;
  workspaceId: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Reminder {
  id?: string;
  type: string;
  scheduledTime: Date;
  data: any;
  userId: string;
  workspaceId: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AutomationJobLog {
  id?: string;
  jobType: string;
  status: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  success?: boolean;
  error?: string;
  metadata?: any;
  userId?: string;
  workspaceId: string;
  emailId?: string;
  createdAt?: Date;
}

// These types would need to be added to your actual Prisma schema for database models
