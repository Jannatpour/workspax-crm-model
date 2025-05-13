'use client';

import React from 'react';
import { CheckCircle2, Clock, Mail, AlertCircle, UserCheck, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

// Mock tasks data
const mockTasks = [
  {
    id: '1',
    title: "Respond to Jane's proposal",
    dueDate: '2025-05-13T17:00:00Z',
    type: 'email',
    priority: 'high',
    completed: false,
  },
  {
    id: '2',
    title: 'Prepare client presentation',
    dueDate: '2025-05-14T12:00:00Z',
    type: 'task',
    priority: 'high',
    completed: false,
  },
  {
    id: '3',
    title: 'Follow up with marketing team',
    dueDate: '2025-05-15T10:00:00Z',
    type: 'email',
    priority: 'medium',
    completed: false,
  },
  {
    id: '4',
    title: 'Review quarterly reports',
    dueDate: '2025-05-12T16:00:00Z',
    type: 'task',
    priority: 'medium',
    completed: true,
  },
  {
    id: '5',
    title: 'Schedule meeting with new client',
    dueDate: '2025-05-16T09:00:00Z',
    type: 'meeting',
    priority: 'high',
    completed: false,
  },
];

// Format due date relative to now
const formatDueDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return 'Overdue';
  }

  if (diffInDays === 0) {
    const hours = date.getHours() - now.getHours();
    if (hours <= 0) {
      return 'Today (Due soon)';
    }
    return `Today (${hours} hours left)`;
  }

  if (diffInDays === 1) {
    return 'Tomorrow';
  }

  if (diffInDays < 7) {
    return `${diffInDays} days left`;
  }

  return date.toLocaleDateString();
};

// Get priority icon and style
const getPriorityElement = (priority: string) => {
  switch (priority) {
    case 'high':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'medium':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'low':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};

// Get task type icon
const getTaskTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'meeting':
      return <Calendar className="h-4 w-4" />;
    case 'task':
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <CheckCircle2 className="h-4 w-4" />;
  }
};

export function UpcomingTasks() {
  const [tasks, setTasks] = React.useState(mockTasks);

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    );
  };

  // Calculate progress
  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = (completedTasks / tasks.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Task Progress</p>
          <p className="text-xs text-muted-foreground">
            {completedTasks} of {tasks.length} complete
          </p>
        </div>
        <Progress value={progress} className="w-1/3" />
      </div>

      <Separator />

      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-2 rounded-md ${
              task.completed ? 'bg-muted/50' : task.priority === 'high' ? 'bg-red-100/10' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleTaskCompletion(task.id)}
              >
                <div
                  className={`h-4 w-4 rounded-full border ${
                    task.completed
                      ? 'bg-primary border-primary'
                      : 'bg-background border-muted-foreground/50'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                </div>
              </Button>

              <div className="flex items-center">
                {getTaskTypeIcon(task.type)}
                <span
                  className={`ml-2 text-sm ${
                    task.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.title}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!task.completed && getPriorityElement(task.priority)}
              <span className="text-xs text-muted-foreground">{formatDueDate(task.dueDate)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" className="text-xs">
          View All Tasks
        </Button>
      </div>
    </div>
  );
}
