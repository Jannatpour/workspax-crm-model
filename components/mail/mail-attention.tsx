'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  Mail,
  MessageSquare,
  User,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function MailAttention() {
  // Sample data for emails needing attention
  const attentionEmails = [
    {
      id: 1,
      sender: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        avatar: '/avatars/sarah.jpg',
      },
      subject: 'Urgent: Project Deadline Update',
      preview:
        'We need to discuss the upcoming deadline for the project. There are several concerns that...',
      received: '2 days ago',
      priority: 'high',
      reason: 'Urgent and no response',
      category: 'client',
    },
    {
      id: 2,
      sender: {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        avatar: '/avatars/michael.jpg',
      },
      subject: 'Contract Review Request',
      preview:
        'Could you please review the attached contract before our meeting tomorrow? I need your feedback on...',
      received: '3 days ago',
      priority: 'medium',
      reason: 'Contains action item',
      category: 'legal',
    },
    {
      id: 3,
      sender: {
        name: 'Alex Rodriguez',
        email: 'alex.r@example.com',
        avatar: '/avatars/alex.jpg',
      },
      subject: 'Follow-up: Sales Opportunity',
      preview:
        'Following up on our conversation last week about the potential partnership. Have you had a chance to...',
      received: '5 days ago',
      priority: 'medium',
      reason: 'Sales opportunity',
      category: 'sales',
    },
    {
      id: 4,
      sender: {
        name: 'Emma Wilson',
        email: 'emma.wilson@example.com',
        avatar: '/avatars/emma.jpg',
      },
      subject: 'Invoice #INV-2023-0042 Past Due',
      preview:
        'This is a reminder that invoice #INV-2023-0042 is now past due. Please arrange payment at your earliest...',
      received: '1 week ago',
      priority: 'high',
      reason: 'Payment overdue',
      category: 'finance',
    },
    {
      id: 5,
      sender: {
        name: 'David Park',
        email: 'david.park@example.com',
        avatar: '/avatars/david.jpg',
      },
      subject: 'Meeting Request: Strategic Planning',
      preview:
        'I would like to schedule a meeting to discuss our strategic plans for Q4. Are you available next...',
      received: '4 days ago',
      priority: 'low',
      reason: 'Meeting request',
      category: 'internal',
    },
  ];

  // Function to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to get category badge variant
  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'client':
        return 'default';
      case 'sales':
        return 'outline';
      case 'finance':
        return 'secondary';
      case 'legal':
        return 'destructive';
      case 'internal':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Emails Needing Attention</h1>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <span className="font-semibold">{attentionEmails.length} emails</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI-Detected Items Requiring Attention</CardTitle>
          <CardDescription>
            These emails have been flagged by our AI as needing your attention based on content,
            urgency, and context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {attentionEmails.map(email => (
            <div
              key={email.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
                    <AvatarFallback>{email.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{email.sender.name}</h3>
                    <p className="text-sm text-muted-foreground">{email.sender.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${getPriorityColor(email.priority)} text-white`}
                  >
                    {email.priority} priority
                  </Badge>
                  <Badge variant={getCategoryVariant(email.category)}>{email.category}</Badge>
                </div>
              </div>

              <h4 className="font-semibold mb-1">{email.subject}</h4>
              <p className="text-sm text-muted-foreground mb-3">{email.preview}</p>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Received {email.received}</span>
                  <span className="mx-2">•</span>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>{email.reason}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Handled
                  </Button>
                  <Button size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Respond
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" className="w-full max-w-md">
          View All Flagged Emails
        </Button>
      </div>
    </div>
  );
}

export default MailAttention;
