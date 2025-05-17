'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  BellRing,
  Mail,
  Smartphone,
  Zap,
  Calendar,
  MessageSquare,
  UserPlus,
  Tag,
  FileText,
  Check,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/sonner';
import { useDashboard } from '@/context/dashboard-context';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms: boolean;
}

const notificationSettings: Record<string, NotificationSetting[]> = {
  email: [
    {
      id: 'new-email',
      name: 'New Email',
      description: 'When you receive a new email',
      email: true,
      push: true,
      inApp: true,
      sms: false,
    },
    {
      id: 'email-replied',
      name: 'Email Replied',
      description: 'When someone replies to your email',
      email: true,
      push: true,
      inApp: true,
      sms: false,
    },
    {
      id: 'email-forwarded',
      name: 'Email Forwarded',
      description: 'When someone forwards your email',
      email: false,
      push: true,
      inApp: true,
      sms: false,
    },
  ],
  contacts: [
    {
      id: 'new-contact',
      name: 'New Contact',
      description: 'When a new contact is added to your account',
      email: true,
      push: false,
      inApp: true,
      sms: false,
    },
    {
      id: 'contact-updated',
      name: 'Contact Updated',
      description: "When a contact's information is updated",
      email: false,
      push: false,
      inApp: true,
      sms: false,
    },
    {
      id: 'contact-birthday',
      name: 'Contact Birthday',
      description: "When it's a contact's birthday",
      email: true,
      push: true,
      inApp: true,
      sms: false,
    },
  ],
  reminders: [
    {
      id: 'task-due',
      name: 'Task Due',
      description: 'When a task is due soon',
      email: true,
      push: true,
      inApp: true,
      sms: false,
    },
    {
      id: 'follow-up',
      name: 'Follow-up Reminder',
      description: "When it's time to follow up with a contact",
      email: true,
      push: true,
      inApp: true,
      sms: true,
    },
    {
      id: 'meeting-reminder',
      name: 'Meeting Reminder',
      description: 'Reminders for upcoming meetings',
      email: true,
      push: true,
      inApp: true,
      sms: true,
    },
  ],
  system: [
    {
      id: 'account-login',
      name: 'Account Login',
      description: 'When someone logs into your account',
      email: true,
      push: true,
      inApp: true,
      sms: true,
    },
    {
      id: 'account-update',
      name: 'Account Updates',
      description: 'Important updates about your account',
      email: true,
      push: false,
      inApp: true,
      sms: false,
    },
    {
      id: 'maintenance',
      name: 'Maintenance & Downtime',
      description: 'Scheduled maintenance and system downtime',
      email: true,
      push: true,
      inApp: true,
      sms: false,
    },
  ],
};

export function SettingsNotifications() {
  const { goBack } = useDashboard();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('email');
  const [settings, setSettings] = useState(notificationSettings);
  const [emailDigest, setEmailDigest] = useState('daily');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [quietHours, setQuietHours] = useState({
    enabled: true,
    start: '22:00',
    end: '07:00',
  });

  // Update a notification setting
  const updateSetting = (
    category: string,
    id: string,
    channel: 'email' | 'push' | 'inApp' | 'sms',
    value: boolean
  ) => {
    // Create a deep copy of the settings
    const newSettings = JSON.parse(JSON.stringify(settings));

    // Find and update the specific setting
    const notification = newSettings[category].find((n: NotificationSetting) => n.id === id);
    if (notification) {
      notification[channel] = value;
    }

    setSettings(newSettings);

    toast({
      title: 'Notification setting updated',
      description: `${value ? 'Enabled' : 'Disabled'} ${channel} notifications for ${
        notification?.name
      }.`,
    });
  };

  // Toggle all settings for a category/channel
  const toggleCategoryChannel = (
    category: string,
    channel: 'email' | 'push' | 'inApp' | 'sms',
    value: boolean
  ) => {
    const newSettings = JSON.parse(JSON.stringify(settings));

    newSettings[category].forEach((notification: NotificationSetting) => {
      notification[channel] = value;
    });

    setSettings(newSettings);

    toast({
      title: 'Notification settings updated',
      description: `${
        value ? 'Enabled' : 'Disabled'
      } all ${channel} notifications for ${category}.`,
    });
  };

  // Save all notification settings
  const saveSettings = () => {
    toast({
      title: 'Notification settings saved',
      description: 'Your notification preferences have been updated successfully.',
    });
  };

  // Reset to defaults
  const resetDefaults = () => {
    setSettings(notificationSettings);
    setEmailDigest('daily');
    setPushEnabled(true);
    setSmsEnabled(false);
    setQuietHours({
      enabled: true,
      start: '22:00',
      end: '07:00',
    });

    toast({
      title: 'Settings reset',
      description: 'Notification settings have been reset to default values.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Notification Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure when and how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex justify-start px-6 pt-2 border-b w-full rounded-none">
                  <TabsTrigger value="email" className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="contacts" className="flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4" />
                    <span>Contacts</span>
                  </TabsTrigger>
                  <TabsTrigger value="reminders" className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Reminders</span>
                  </TabsTrigger>
                  <TabsTrigger value="system" className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    <span>System</span>
                  </TabsTrigger>
                </TabsList>

                {Object.keys(settings).map(category => (
                  <TabsContent key={category} value={category} className="p-0 m-0">
                    <div className="bg-muted/40 p-4 flex items-center justify-between border-b">
                      <p className="text-sm font-medium">Notification Type</p>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                          <Label className="text-xs text-muted-foreground mb-1">Email</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              toggleCategoryChannel(
                                category,
                                'email',
                                !settings[category].every(n => n.email)
                              )
                            }
                          >
                            {settings[category].every(n => n.email) ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : settings[category].some(n => n.email) ? (
                              <Check className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <div className="flex flex-col items-center">
                          <Label className="text-xs text-muted-foreground mb-1">Push</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              toggleCategoryChannel(
                                category,
                                'push',
                                !settings[category].every(n => n.push)
                              )
                            }
                          >
                            {settings[category].every(n => n.push) ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : settings[category].some(n => n.push) ? (
                              <Check className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <div className="flex flex-col items-center">
                          <Label className="text-xs text-muted-foreground mb-1">In-App</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              toggleCategoryChannel(
                                category,
                                'inApp',
                                !settings[category].every(n => n.inApp)
                              )
                            }
                          >
                            {settings[category].every(n => n.inApp) ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : settings[category].some(n => n.inApp) ? (
                              <Check className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <div className="flex flex-col items-center">
                          <Label className="text-xs text-muted-foreground mb-1">SMS</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              toggleCategoryChannel(
                                category,
                                'sms',
                                !settings[category].every(n => n.sms)
                              )
                            }
                          >
                            {settings[category].every(n => n.sms) ? (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            ) : settings[category].some(n => n.sms) ? (
                              <Check className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <ScrollArea className="max-h-[460px]">
                      <div className="divide-y">
                        {settings[category].map(notification => (
                          <div
                            key={notification.id}
                            className="p-4 flex items-start justify-between"
                          >
                            <div>
                              <h3 className="font-medium text-sm">{notification.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-6">
                              <Switch
                                checked={notification.email}
                                onCheckedChange={value =>
                                  updateSetting(category, notification.id, 'email', value)
                                }
                                className="data-[state=checked]:bg-primary"
                              />
                              <Switch
                                checked={notification.push}
                                onCheckedChange={value =>
                                  updateSetting(category, notification.id, 'push', value)
                                }
                                className="data-[state=checked]:bg-primary"
                              />
                              <Switch
                                checked={notification.inApp}
                                onCheckedChange={value =>
                                  updateSetting(category, notification.id, 'inApp', value)
                                }
                                className="data-[state=checked]:bg-primary"
                              />
                              <Switch
                                checked={notification.sms}
                                onCheckedChange={value =>
                                  updateSetting(category, notification.id, 'sms', value)
                                }
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-4">
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={resetDefaults}>
                  Reset to Defaults
                </Button>
                <Button onClick={saveSettings}>Save Preferences</Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>Configure how notifications are delivered to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Digest Frequency</Label>
                  <RadioGroup
                    value={emailDigest}
                    onValueChange={setEmailDigest}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="realtime" id="digest-realtime" />
                      <Label htmlFor="digest-realtime" className="cursor-pointer">
                        Real-time
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="digest-daily" />
                      <Label htmlFor="digest-daily" className="cursor-pointer">
                        Daily Digest
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="digest-weekly" />
                      <Label htmlFor="digest-weekly" className="cursor-pointer">
                        Weekly Digest
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <Switch
                      id="push-notifications"
                      checked={pushEnabled}
                      onCheckedChange={setPushEnabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications on your device when the app is closed.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <Switch
                      id="sms-notifications"
                      checked={smsEnabled}
                      onCheckedChange={setSmsEnabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive important notifications via text message.
                  </p>

                  {smsEnabled && (
                    <div className="pt-2">
                      <Label htmlFor="phone-number">Phone Number</Label>
                      <Input id="phone-number" placeholder="+1 (555) 123-4567" className="mt-1" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>
                  Set times when you don't want to be disturbed by notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                  <Switch
                    id="quiet-hours"
                    checked={quietHours.enabled}
                    onCheckedChange={value => setQuietHours({ ...quietHours, enabled: value })}
                  />
                </div>

                {quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={quietHours.start}
                        onChange={e => setQuietHours({ ...quietHours, start: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={quietHours.end}
                        onChange={e => setQuietHours({ ...quietHours, end: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Label htmlFor="allowed-notifications">Allowed During Quiet Hours</Label>
                  <Select defaultValue="critical">
                    <SelectTrigger id="allowed-notifications" className="mt-1">
                      <SelectValue placeholder="Select allowed notifications" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No notifications</SelectItem>
                      <SelectItem value="critical">Critical notifications only</SelectItem>
                      <SelectItem value="starred">Starred contacts only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
