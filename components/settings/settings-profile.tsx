'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  User,
  Mail,
  Lock,
  UserCog,
  Shield,
  Key,
  Camera,
  Languages,
  LogOut,
  Clock,
  Bell,
  FileText,
  Smartphone,
  Brush,
  ExternalLink,
  Check,
  RefreshCw,
  Save,
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/sonner';
import { useDashboard } from '@/context/dashboard-context';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function SettingsProfile() {
  const { goBack } = useDashboard();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // User profile state
  const [userProfile, setUserProfile] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 123-4567',
    jobTitle: 'Marketing Director',
    department: 'Marketing',
    company: 'Acme Inc.',
    bio: 'Experienced marketing professional with a focus on digital strategy and content marketing.',
    timezone: 'America/Los_Angeles',
    language: 'en',
    twoFactorEnabled: true,
    emailNotifications: true,
    browserNotifications: true,
    weeklyDigest: true,
    darkMode: 'system',
    compactView: false,
    autoSave: true,
    avatarUrl: '',
  });

  // Update profile field
  const updateProfile = (field: string, value: any) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save profile
  const handleSaveProfile = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    }, 1500);
  };

  // Handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });

      // Reset form
      const form = e.target as HTMLFormElement;
      form.reset();
    }, 1500);
  };

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      toast({
        title: 'Avatar uploaded',
        description: 'Your profile picture has been updated successfully.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  {userProfile.avatarUrl ? (
                    <AvatarImage
                      src={userProfile.avatarUrl}
                      alt={`${userProfile.firstName} ${userProfile.lastName}`}
                    />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {userProfile.firstName.charAt(0)}
                      {userProfile.lastName.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h2 className="text-xl font-bold">
                  {userProfile.firstName} {userProfile.lastName}
                </h2>
                <p className="text-muted-foreground mb-2">
                  {userProfile.jobTitle} at {userProfile.company}
                </p>

                <div className="flex flex-wrap gap-1 justify-center mt-1 mb-4">
                  <Badge variant="outline">{userProfile.department}</Badge>
                  <Badge variant="outline">Premium Plan</Badge>
                </div>

                <div>
                  <Button variant="outline" className="relative" disabled={isLoading}>
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isLoading}
                    />
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Change Picture
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{userProfile.email}</span>
                </div>
                {userProfile.phone && (
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {Intl.DateTimeFormat('en-US', {
                      timeZone: userProfile.timezone,
                      timeZoneName: 'short',
                    }).format(new Date())}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {userProfile.twoFactorEnabled
                      ? 'Two-factor authentication enabled'
                      : 'Two-factor authentication disabled'}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="destructive" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex justify-start px-6 pt-2 border-b w-full rounded-none">
                  <TabsTrigger value="profile" className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-1.5">
                    <Lock className="h-4 w-4" />
                    <span>Security</span>
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center gap-1.5">
                    <Brush className="h-4 w-4" />
                    <span>Preferences</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Personal Information</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            value={userProfile.firstName}
                            onChange={e => updateProfile('firstName', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            value={userProfile.lastName}
                            onChange={e => updateProfile('lastName', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userProfile.email}
                          onChange={e => updateProfile('email', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={userProfile.phone}
                          onChange={e => updateProfile('phone', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Professional Details</h3>

                      <div className="space-y-2">
                        <Label htmlFor="job-title">Job Title</Label>
                        <Input
                          id="job-title"
                          value={userProfile.jobTitle}
                          onChange={e => updateProfile('jobTitle', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={userProfile.department}
                          onValueChange={value => updateProfile('department', value)}
                        >
                          <SelectTrigger id="department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Product">Product</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Customer Support">Customer Support</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={userProfile.company}
                          onChange={e => updateProfile('company', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-base font-medium">About</h3>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={userProfile.bio}
                        onChange={e => updateProfile('bio', e.target.value)}
                        rows={4}
                        placeholder="Tell us about yourself"
                      />
                      <p className="text-xs text-muted-foreground">
                        Brief description about yourself that will be visible to other team members.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Localization</h3>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Time Zone</Label>
                        <Select
                          value={userProfile.timezone}
                          onValueChange={value => updateProfile('timezone', value)}
                        >
                          <SelectTrigger id="timezone">
                            <SelectValue placeholder="Select time zone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Los_Angeles">
                              Pacific Time (US & Canada)
                            </SelectItem>
                            <SelectItem value="America/Denver">
                              Mountain Time (US & Canada)
                            </SelectItem>
                            <SelectItem value="America/Chicago">
                              Central Time (US & Canada)
                            </SelectItem>
                            <SelectItem value="America/New_York">
                              Eastern Time (US & Canada)
                            </SelectItem>
                            <SelectItem value="America/Sao_Paulo">São Paulo</SelectItem>
                            <SelectItem value="Europe/London">London</SelectItem>
                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                            <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={userProfile.language}
                          onValueChange={value => updateProfile('language', value)}
                        >
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                            <SelectItem value="ja">日本語</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Change Password</h3>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" required />
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 8 characters and include a number and a special
                          character.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" required />
                      </div>

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </form>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                      <Switch
                        checked={userProfile.twoFactorEnabled}
                        onCheckedChange={value => updateProfile('twoFactorEnabled', value)}
                      />
                    </div>

                    {userProfile.twoFactorEnabled && (
                      <div className="bg-muted p-4 rounded-lg mt-4">
                        <p className="text-sm font-medium mb-2">
                          Two-factor authentication is enabled
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          You will be asked for a verification code when signing in from new
                          devices.
                        </p>
                        <Button variant="outline" size="sm">
                          <Key className="h-4 w-4 mr-2" />
                          Manage 2FA Settings
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Connected Accounts</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your connected accounts and services.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-6 w-6 mr-3"
                          >
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <div>
                            <p className="font-medium">Google</p>
                            <p className="text-xs text-muted-foreground">
                              Connected as {userProfile.email}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-6 w-6 mr-3 text-black dark:text-white"
                            fill="currentColor"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          <div>
                            <p className="font-medium">GitHub</p>
                            <p className="text-xs text-muted-foreground">Not connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Notification Preferences</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications" className="cursor-pointer">
                            Email Notifications
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Receive notifications via email.
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={userProfile.emailNotifications}
                          onCheckedChange={value => updateProfile('emailNotifications', value)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="browser-notifications" className="cursor-pointer">
                            Browser Notifications
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Receive notifications in your browser.
                          </p>
                        </div>
                        <Switch
                          id="browser-notifications"
                          checked={userProfile.browserNotifications}
                          onCheckedChange={value => updateProfile('browserNotifications', value)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weekly-digest" className="cursor-pointer">
                            Weekly Digest
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Receive a weekly summary of your activity.
                          </p>
                        </div>
                        <Switch
                          id="weekly-digest"
                          checked={userProfile.weeklyDigest}
                          onCheckedChange={value => updateProfile('weeklyDigest', value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Appearance</h3>

                    <div className="space-y-2">
                      <Label htmlFor="theme-mode">Theme Mode</Label>
                      <RadioGroup
                        id="theme-mode"
                        value={userProfile.darkMode}
                        onValueChange={value => updateProfile('darkMode', value)}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="theme-light" />
                          <Label htmlFor="theme-light" className="cursor-pointer">
                            Light
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="theme-dark" />
                          <Label htmlFor="theme-dark" className="cursor-pointer">
                            Dark
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="system" id="theme-system" />
                          <Label htmlFor="theme-system" className="cursor-pointer">
                            System
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <Label htmlFor="compact-view" className="cursor-pointer">
                          Compact View
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use a more compact layout throughout the application.
                        </p>
                      </div>
                      <Switch
                        id="compact-view"
                        checked={userProfile.compactView}
                        onCheckedChange={value => updateProfile('compactView', value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Editor Preferences</h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-save" className="cursor-pointer">
                          Auto-Save
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Automatically save your work as you type.
                        </p>
                      </div>
                      <Switch
                        id="auto-save"
                        checked={userProfile.autoSave}
                        onCheckedChange={value => updateProfile('autoSave', value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-4">
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={goBack}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
