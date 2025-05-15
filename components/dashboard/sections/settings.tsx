'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  User,
  Lock,
  Bell,
  Mail,
  CreditCard,
  Building,
  Link,
  UserPlus,
  Shield,
  Cloud,
  Edit,
  Save,
  KeySquare,
  Plug,
  Database,
  Network,
  Check,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDashboard } from '@/context/dashboard-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Profile Settings component
const ProfileSettings = () => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [title, setTitle] = useState('Marketing Director');
  const [timeZone, setTimeZone] = useState('America/New_York');

  const handleSave = () => {
    setEditMode(false);
    // In a real app, this would save the profile changes to the server
    console.log('Saving profile changes:', { name, email, title, timeZone });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </div>
          {!editMode ? (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            {editMode && (
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {editMode ? (
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                ) : (
                  <div className="p-2 border rounded-md">{name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {editMode ? (
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                ) : (
                  <div className="p-2 border rounded-md">{email}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                {editMode ? (
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
                ) : (
                  <div className="p-2 border rounded-md">{title}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                {editMode ? (
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 border rounded-md">Eastern Time (ET)</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-medium">Email Notifications</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing-emails" className="flex-1">
                Marketing emails
              </Label>
              <Switch id="marketing-emails" defaultChecked={false} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="activity-emails" className="flex-1">
                Activity emails
              </Label>
              <Switch id="activity-emails" defaultChecked={true} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notification-emails" className="flex-1">
                Notification emails
              </Label>
              <Switch id="notification-emails" defaultChecked={true} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Security Settings component
const SecuritySettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Manage your account security</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div></div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          <Button>Change Password</Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable 2FA</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch id="2fa" />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage API keys for integrating with external services
          </p>

          <div className="border rounded-md">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <p className="font-medium">Your API Keys</p>
              </div>
              <Button size="sm">
                <KeySquare className="h-4 w-4 mr-2" />
                Generate New Key
              </Button>
            </div>

            <div className="p-4 text-center text-muted-foreground">No API keys found</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Connected Accounts</h3>
          <p className="text-sm text-muted-foreground">Connect your account to other services</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between border rounded-md p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#4285F4] flex items-center justify-center text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Google</p>
                  <p className="text-sm text-muted-foreground">Connect your Google account</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>

            <div className="flex items-center justify-between border rounded-md p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-sm text-muted-foreground">Connect your GitHub account</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>

            <div className="flex items-center justify-between border rounded-md p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">LinkedIn</p>
                  <p className="text-sm text-muted-foreground">Connect your LinkedIn account</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Team Settings component
const TeamSettings = () => {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Owner',
      avatar: '/placeholder-avatar.jpg',
    },
    { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'Admin', avatar: null },
    { id: '3', name: 'Michael Brown', email: 'michael@example.com', role: 'Member', avatar: null },
  ]);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const handleInvite = () => {
    // In a real app, this would send an invitation to the email address
    console.log('Inviting:', { email: inviteEmail, role: inviteRole });
    setInviteEmail('');
    setShowInvite(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your team members and their roles</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showInvite && (
          <Card className="border-dashed">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Invite New Member</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowInvite(false)}>
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="invite-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleInvite} disabled={!inviteEmail}>
                  Send Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Member</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teamMembers.map(member => (
                <tr key={member.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar || ''} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        member.role === 'Owner'
                          ? 'default'
                          : member.role === 'Admin'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {member.role}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    {member.role !== 'Owner' && (
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">Pending Invitations</h3>
          <div className="text-center py-4 text-muted-foreground">No pending invitations</div>
        </div>
      </CardContent>
    </Card>
  );
};

// Workspace Settings component
const WorkspaceSettings = () => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('Acme Corporation');
  const [industry, setIndustry] = useState('Technology');
  const [size, setSize] = useState('50-100');
  const [website, setWebsite] = useState('https://acme.example.com');

  const handleSave = () => {
    setEditMode(false);
    // In a real app, this would save the workspace changes to the server
    console.log('Saving workspace changes:', { name, industry, size, website });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Workspace Settings</CardTitle>
            <CardDescription>Manage your workspace information</CardDescription>
          </div>
          {!editMode ? (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Workspace
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-24 w-24 rounded-md bg-primary/10 flex items-center justify-center">
              <Building className="h-12 w-12 text-primary" />
            </div>
            {editMode && (
              <Button variant="outline" size="sm">
                Change Logo
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Company Name</Label>
                {editMode ? (
                  <Input id="workspace-name" value={name} onChange={e => setName(e.target.value)} />
                ) : (
                  <div className="p-2 border rounded-md">{name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-industry">Industry</Label>
                {editMode ? (
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="workspace-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 border rounded-md">{industry}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-size">Company Size</Label>
                {editMode ? (
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger id="workspace-size">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="50-100">50-100 employees</SelectItem>
                      <SelectItem value="101-500">101-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 border rounded-md">50-100 employees</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-website">Website</Label>
                {editMode ? (
                  <Input
                    id="workspace-website"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                  />
                ) : (
                  <div className="p-2 border rounded-md">{website}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">Subscription Plan</h3>
          <div className="flex items-center justify-between border rounded-md p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Professional Plan</p>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Current Plan
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">$49/month • Renews on June 15, 2023</p>
              <ul className="text-sm mt-2 space-y-1">
                <li className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  Unlimited contacts
                </li>
                <li className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  10 team members
                </li>
                <li className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  Advanced AI features
                </li>
              </ul>
            </div>
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">Danger Zone</h3>
          <Card className="border-destructive">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-destructive">Delete Workspace</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this workspace and all its data
                  </p>
                </div>
                <Button variant="destructive">Delete Workspace</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

// Integrations Settings component
const IntegrationsSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>Connect with other services and tools</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border rounded-md p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-md bg-[#4285F4] flex items-center justify-center text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Google Calendar</p>
                <p className="text-sm text-muted-foreground">
                  Connect with Google Calendar to sync meetings and events
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Not Connected</Badge>
              <Button>Connect</Button>
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-md p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-md bg-[#0A66C2] flex items-center justify-center text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">LinkedIn</p>
                <p className="text-sm text-muted-foreground">Import contacts from LinkedIn</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Not Connected</Badge>
              <Button>Connect</Button>
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-md p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-md bg-[#3699FF] flex items-center justify-center text-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Salesforce</p>
                <p className="text-sm text-muted-foreground">
                  Sync contacts and deals with Salesforce
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Connected
              </Badge>
              <Button variant="outline">Manage</Button>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <Plug className="h-4 w-4 mr-2" />
          View More Integrations
        </Button>
      </CardContent>
    </Card>
  );
};

// API Settings component
const ApiSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
        <CardDescription>Manage API access and keys for your workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">API Keys</h3>
          <div className="border rounded-md">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <p className="font-medium">Your API Keys</p>
                <p className="text-sm text-muted-foreground">
                  Manage keys for accessing the WorkspaxCRM API
                </p>
              </div>
              <Button>
                <KeySquare className="h-4 w-4 mr-2" />
                Generate New Key
              </Button>
            </div>

            <div className="p-6 text-center text-muted-foreground">No API keys generated yet</div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">API Documentation</h3>
          <p className="text-sm text-muted-foreground">
            Learn how to use our API to integrate with your applications
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
            <Button variant="outline">
              <Cloud className="h-4 w-4 mr-2" />
              API Reference
            </Button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">API Rate Limits</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm">Daily API Calls</p>
              <p className="text-sm font-medium">1,000 / 10,000</p>
            </div>
            <Progress value={10} className="h-2" />
            <div className="flex items-center justify-between">
              <p className="text-sm">Rate Limit per Minute</p>
              <p className="text-sm font-medium">60 requests</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">Webhooks</h3>
          <p className="text-sm text-muted-foreground">
            Configure webhooks to receive notifications for events
          </p>
          <div className="border rounded-md">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <p className="font-medium">Your Webhooks</p>
              </div>
              <Button>
                <Network className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </div>

            <div className="p-6 text-center text-muted-foreground">No webhooks configured</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function SettingsSection() {
  const { changeSection } = useDashboard();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button variant="outline" onClick={() => changeSection('overview')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <Button
              variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant={activeTab === 'security' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('security')}
            >
              <Lock className="h-4 w-4 mr-2" />
              Security
            </Button>
            <Button
              variant={activeTab === 'team' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('team')}
            >
              <Users className="h-4 w-4 mr-2" />
              Team
            </Button>
            <Button
              variant={activeTab === 'workspace' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('workspace')}
            >
              <Building className="h-4 w-4 mr-2" />
              Workspace
            </Button>
            <Button
              variant={activeTab === 'email' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('email')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              variant={activeTab === 'integrations' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('integrations')}
            >
              <Link className="h-4 w-4 mr-2" />
              Integrations
            </Button>
            <Button
              variant={activeTab === 'api' ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveTab('api')}
            >
              <Database className="h-4 w-4 mr-2" />
              API
            </Button>
          </nav>
        </aside>

        <div className="flex-1">
          <ScrollArea className="h-[calc(100vh-10rem)]">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'team' && <TeamSettings />}
            {activeTab === 'workspace' && <WorkspaceSettings />}
            {activeTab === 'email' && (
              <Button onClick={() => changeSection('settings-email')}>Go to Email Settings</Button>
            )}
            {activeTab === 'integrations' && <IntegrationsSettings />}
            {activeTab === 'api' && <ApiSettings />}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
