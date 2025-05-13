'use client';
import React from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Bot, Zap, BrainCircuit, Users } from 'lucide-react';

// Sample data for AI agents
const agents = [
  {
    id: '1',
    name: 'Email Assistant',
    description: 'Helps manage email responses and prioritization',
    status: 'active',
    type: 'email',
    lastRun: '2023-05-12T14:30:00Z',
    avatar: '/agents/email-assistant.png',
  },
  {
    id: '2',
    name: 'Lead Qualifier',
    description: 'Qualifies new leads based on predefined criteria',
    status: 'active',
    type: 'sales',
    lastRun: '2023-05-13T10:15:00Z',
    avatar: '/agents/lead-qualifier.png',
  },
  {
    id: '3',
    name: 'Content Generator',
    description: 'Creates content for email campaigns and social media',
    status: 'inactive',
    type: 'marketing',
    lastRun: '2023-05-10T09:45:00Z',
    avatar: '/agents/content-generator.png',
  },
  {
    id: '4',
    name: 'Meeting Scheduler',
    description: 'Coordinates and schedules meetings with contacts',
    status: 'active',
    type: 'productivity',
    lastRun: '2023-05-12T16:20:00Z',
    avatar: '/agents/meeting-scheduler.png',
  },
];

export function AgentsOverview() {
  const { changeSection } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Agents</h2>
          <p className="text-muted-foreground">Manage your intelligent AI assistants</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>
      </div>

      {/* Agents Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-agents" onClick={() => changeSection('agents-my')}>
            My Agents
          </TabsTrigger>
          <TabsTrigger value="teams" onClick={() => changeSection('agents-teams')}>
            Teams
          </TabsTrigger>
          <TabsTrigger value="training" onClick={() => changeSection('agents-training')}>
            Training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Agent Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">3 active, 1 inactive</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">238</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48h</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92.4%</div>
                <p className="text-xs text-muted-foreground">+3.2% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Agent List */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Active Agents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map(agent => (
                <Card
                  key={agent.id}
                  className={`overflow-hidden ${agent.status === 'inactive' ? 'opacity-70' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={agent.avatar} alt={agent.name} />
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-base">{agent.name}</CardTitle>
                      </div>
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </div>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Type: </span>
                      <span className="capitalize">{agent.type}</span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="text-muted-foreground">Last run: </span>
                      <span>{new Date(agent.lastRun).toLocaleString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 pt-2">
                    <div className="flex justify-between w-full">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        Run Now
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
