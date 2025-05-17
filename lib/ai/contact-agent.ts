// lib/ai/contact-agent.ts
import { Contact } from '@/lib/contacts/types';
import { OpenAI } from '@/lib/ai/openai';

const systemPrompt = `
You are an AI assistant specialized in contact management for WorkSpaxCRM.
Your goal is to help users manage their business contacts effectively.

Tasks you can help with:
1. Analyzing contact data for insights
2. Generating follow-up suggestions
3. Identifying potential duplicates
4. Recommending tags and grouping strategies
5. Prioritizing leads based on engagement patterns
6. Suggesting personalized email templates

Always be helpful, practical, and business-oriented in your recommendations.
`;

export interface ContactAgentParams {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class ContactAgent {
  private openai: OpenAI;
  private params: ContactAgentParams;

  constructor(params: ContactAgentParams = {}) {
    this.params = {
      model: params.model || 'gpt-4-turbo',
      temperature: params.temperature || 0.3,
      maxTokens: params.maxTokens || 1000,
    };

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Analyze a list of contacts for insights
   */
  async analyzeContacts(contacts: Contact[]): Promise<string[]> {
    const contactData = JSON.stringify(
      contacts.map(c => ({
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        company: c.company,
        title: c.title,
        status: c.status,
        tags: c.tags?.map(t => t.name),
        lastContactedAt: c.lastContactedAt,
        engagementScore: c.engagementScore,
      }))
    );

    const prompt = `
      Analyze these contacts and provide 5-7 key insights about them:
      ${contactData}
      
      Focus on patterns related to:
      - Industry or company distributions
      - Job title patterns
      - Engagement levels
      - Follow-up opportunities
      - Potential relationship patterns
      
      Return insights as a JSON array of strings, with each string being a specific insight.
    `;

    const response = await this.openai.chat.completions.create({
      model: this.params.model!,
      temperature: this.params.temperature!,
      max_tokens: this.params.maxTokens!,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) return [];

      const parsed = JSON.parse(content);
      return parsed.insights || [];
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  /**
   * Generate follow-up suggestions for a contact
   */
  async generateFollowUpSuggestions(contact: Contact): Promise<{
    suggestedDate: string;
    reason: string;
    emailSubject: string;
    emailOpening: string;
  }> {
    const contactData = JSON.stringify({
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      company: contact.company,
      title: contact.title,
      status: contact.status,
      tags: contact.tags?.map(t => t.name),
      lastContactedAt: contact.lastContactedAt,
      nextFollowUpDate: contact.nextFollowUpDate,
      engagementScore: contact.engagementScore,
      notes: contact.notes,
    });

    const prompt = `
      Generate a follow-up suggestion for this contact:
      ${contactData}
      
      Include:
      1. A suggested follow-up date
      2. A reason for the follow-up
      3. A suggested email subject line
      4. A brief email opening paragraph (2-3 sentences)
      
      Return as a JSON object with properties: suggestedDate, reason, emailSubject, emailOpening
    `;

    const response = await this.openai.chat.completions.create({
      model: this.params.model!,
      temperature: this.params.temperature!,
      max_tokens: this.params.maxTokens!,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating follow-up suggestions:', error);
      return {
        suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Regular check-in',
        emailSubject: `Follow-up with ${contact.firstName}`,
        emailOpening: `I hope this email finds you well. I wanted to follow up on our previous conversation.`,
      };
    }
  }

  /**
   * Find potential duplicate contacts
   */
  async findPotentialDuplicates(contacts: Contact[]): Promise<{
    duplicates: { group: Contact[]; confidence: number; reason: string }[];
  }> {
    const contactData = JSON.stringify(
      contacts.map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        company: c.company,
        phone: c.phone,
      }))
    );

    const prompt = `
      Identify potential duplicate contacts in this list:
      ${contactData}
      
      Look for:
      - Similar names with slight variations
      - Same email but different names
      - Same phone number but different emails
      - Similar name and same company
      
      Return as a JSON object with a "duplicates" array. Each item should have:
      - group: array of contact IDs that appear to be duplicates
      - confidence: number from 0-1 indicating confidence level
      - reason: string explaining why they're likely duplicates
      
      Only include groups with confidence > 0.5
    `;

    const response = await this.openai.chat.completions.create({
      model: this.params.model!,
      temperature: this.params.temperature!,
      max_tokens: this.params.maxTokens!,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) return { duplicates: [] };

      const result = JSON.parse(content);

      // Convert IDs back to actual Contact objects
      const contactsMap = new Map(contacts.map(c => [c.id, c]));

      const processedDuplicates = result.duplicates.map((dup: any) => ({
        group: dup.group.map((id: string) => contactsMap.get(id)).filter(Boolean),
        confidence: dup.confidence,
        reason: dup.reason,
      }));

      return { duplicates: processedDuplicates };
    } catch (error) {
      console.error('Error finding potential duplicates:', error);
      return { duplicates: [] };
    }
  }

  /**
   * Suggest tags for a contact
   */
  async suggestTags(
    contact: Contact,
    availableTags: any[]
  ): Promise<{
    suggestedTags: string[];
    newTagSuggestions: { name: string; color: string }[];
  }> {
    const contactData = JSON.stringify({
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      company: contact.company,
      title: contact.title,
      status: contact.status,
      notes: contact.notes,
    });

    const tagsData = JSON.stringify(availableTags.map(t => ({ id: t.id, name: t.name })));

    const prompt = `
      Suggest appropriate tags for this contact:
      ${contactData}
      
      Available tags:
      ${tagsData}
      
      Return as a JSON object with properties:
      - suggestedTags: array of tag IDs from the available tags that would be appropriate
      - newTagSuggestions: array of objects with name and color properties for new tags that might be useful
      
      Choose relevant tags based on the contact's role, industry, and potential value.
      Limit to 3-5 most relevant tags. Suggest 0-2 new tags if appropriate.
      For new tag colors, use hex codes appropriate for a professional CRM interface.
    `;

    const response = await this.openai.chat.completions.create({
      model: this.params.model!,
      temperature: this.params.temperature!,
      max_tokens: this.params.maxTokens!,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content);
    } catch (error) {
      console.error('Error suggesting tags:', error);
      return {
        suggestedTags: [],
        newTagSuggestions: [],
      };
    }
  }
}
