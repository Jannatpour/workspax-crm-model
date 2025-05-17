'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  Zap,
  Check,
  X,
  RefreshCw,
  Globe,
  Server,
  Database,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/sonner';
import { useDashboard } from '@/context/dashboard-context';

// Mock integrations data
const integrations = [
  {
    id: 'google',
    name: 'Google Workspace',
    icon: Globe,
    description: 'Connect your Google Workspace account to sync calendar, contacts, and emails.',
    connected: true,
    lastSynced: '2024-05-14T15:30:00Z',
    status: 'healthy',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: Zap,
    description: 'Integrate with Slack for notifications and channel messaging.',
    connected: true,
    lastSynced: '2024-05-13T10:15:00Z',
    status: 'healthy',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: Database,
    description: 'Connect to Salesforce to sync contacts, opportunities, and leads.',
    connected: false,
    lastSynced: null,
    status: 'disconnected',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: Server,
    description: 'Integrate with HubSpot CRM for marketing automation and contact management.',
    connected: false,
    lastSynced: null,
    status: 'disconnected',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    icon: Zap,
    description: 'Create automated workflows with thousands of apps.',
    connected: true,
    lastSynced: '2024-05-10T09:45:00Z',
    status: 'warning',
    warningMessage: 'Authentication token will expire in 3 days',
  },
];

export function SettingsIntegrations() {
  const { goBack } = useDashboard();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [integrationState, setIntegrationState] = useState(integrations);

  // Format date string for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  // Toggle integration connection
  const toggleConnection = (id: string) => {
    setIntegrationState(prev =>
      prev.map(integration => {
        if (integration.id === id) {
          const newConnection = !integration.connected;

          toast({
            title: newConnection ? 'Integration Connected' : 'Integration Disconnected',
            description: `Successfully ${newConnection ? 'connected to' : 'disconnected from'} ${
              integration.name
            }.`,
          });

          return {
            ...integration,
            connected: newConnection,
            status: newConnection ? 'healthy' : 'disconnected',
            lastSynced: newConnection ? new Date().toISOString() : null,
          };
        }
        return integration;
      })
    );
  };

  // Refresh integration
  const refreshIntegration = (id: string) => {
    setIsRefreshing(id);

    // Simulate refresh delay
    setTimeout(() => {
      setIntegrationState(prev =>
        prev.map(integration => {
          if (integration.id === id) {
            return {
              ...integration,
              lastSynced: new Date().toISOString(),
              status: 'healthy',
              warningMessage: undefined,
            };
          }
          return integration;
        })
      );

      setIsRefreshing(null);

      toast({
        title: 'Integration Updated',
        description: 'The integration has been refreshed successfully.',
      });
    }, 1500);
  };

  // Render status badge
  const renderStatusBadge = (status: string, message?: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <RefreshCw className="h-3 w-3 mr-1" />
            {message || 'Needs attention'}
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Integrations</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connected Services</CardTitle>
            <CardDescription>
              Manage the services and applications that are connected to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[460px]">
              <div className="divide-y">
                {integrationState.map(integration => (
                  <div key={integration.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-primary-50 p-2 rounded-md">
                          <integration.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {integration.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {renderStatusBadge(integration.status, integration.warningMessage)}

                            {integration.connected && integration.lastSynced && (
                              <span className="text-xs text-muted-foreground">
                                Last synced: {formatDate(integration.lastSynced)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {integration.connected && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshIntegration(integration.id)}
                            disabled={isRefreshing === integration.id}
                          >
                            {isRefreshing === integration.id ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Refresh
                              </>
                            )}
                          </Button>
                        )}

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={integration.connected}
                            onCheckedChange={() => toggleConnection(integration.id)}
                          />
                        </div>
                      </div>
                    </div>

                    {integration.connected && integration.id === 'google' && (
                      <div className="mt-4 pl-10">
                        <p className="text-sm font-medium mb-2">Connected Services</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Gmail</Badge>
                          <Badge variant="secondary">Calendar</Badge>
                          <Badge variant="secondary">Drive</Badge>
                          <Badge variant="secondary">Contacts</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 p-4">
            <Button>
              <Globe className="h-4 w-4 mr-2" />
              Connect New Service
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
            <CardDescription>
              Manage API keys and access for developers and third-party applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex">
                <Input
                  id="api-key"
                  type="password"
                  value="sk_live_51KjJkHGtR6SYVGhQ8DG5J7Ng"
                  readOnly
                  className="flex-1 rounded-r-none font-mono"
                />
                <Button variant="outline" className="rounded-l-none">
                  View
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This key provides access to your account. Keep it secure and never share it
                publicly.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block">Webhook URL</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive real-time notifications for events in your account.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Input placeholder="https://example.com/webhook" className="font-mono" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate API Key
            </Button>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Manage Permissions
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
