'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace, Workspace } from '@/context/workspace-context';
import { useDashboard } from '@/context/dashboard-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/sonner';
import {
  Loader2,
  Upload,
  X,
  User,
  Users,
  Trash2,
  Building2,
  UserPlus,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

export function WorkspaceSettings() {
  console.log('WorkspaceSettings component is rendering'); // Debug log

  const { currentSection, changeSection } = useDashboard();
  const {
    currentWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteToWorkspace,
    isLoading,
    error,
    fetchWorkspaces,
  } = useWorkspace();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Component lifecycle logging
  useEffect(() => {
    console.log('WorkspaceSettings mounted, current section:', currentSection);
    console.log('Current workspace:', currentWorkspace);

    return () => {
      console.log('WorkspaceSettings unmounted');
    };
  }, [currentSection, currentWorkspace]);

  // Refresh workspace data when component mounts
  useEffect(() => {
    console.log('Fetching workspaces...');
    fetchWorkspaces()
      .then(() => {
        console.log('Workspaces fetched successfully');
      })
      .catch(err => {
        console.error('Error refreshing workspaces:', err);
        toast({
          title: 'Failed to load workspaces',
          description: 'Please try again later',
          variant: 'destructive',
        });
      });
  }, [fetchWorkspaces, toast]);

  // Initialize form with current workspace data
  useEffect(() => {
    if (currentWorkspace) {
      console.log('Initializing form with workspace data:', currentWorkspace.name);
      setName(currentWorkspace.name || '');
      setDescription(currentWorkspace.description || '');

      // Handle logo which can be string or File
      if (typeof currentWorkspace.logo === 'string') {
        setLogoPreview(currentWorkspace.logo);
      }
    }
  }, [currentWorkspace]);

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogo(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update workspace
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentWorkspace) {
      console.error('Cannot update: No current workspace');
      return;
    }

    setIsUpdating(true);
    console.log('Updating workspace:', currentWorkspace.id);

    try {
      const data: Partial<Workspace> = {
        name,
        description,
      };

      if (logo) {
        data.logo = logo;
      }

      await updateWorkspace(currentWorkspace.id, data);
      console.log('Workspace updated successfully');

      toast({
        title: 'Workspace updated',
        description: 'Your workspace settings have been saved.',
      });
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Invite a user
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentWorkspace) {
      console.error('Cannot invite: No current workspace');
      return;
    }

    setIsInviting(true);
    console.log('Inviting user to workspace:', inviteEmail);

    try {
      await inviteToWorkspace(currentWorkspace.id, inviteEmail, inviteRole);
      console.log('User invited successfully');

      toast({
        title: 'Invitation sent',
        description: `${inviteEmail} has been added to the workspace.`,
      });

      setInviteEmail('');
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Invitation failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Delete workspace
  const handleDelete = async () => {
    if (!currentWorkspace) {
      console.error('Cannot delete: No current workspace');
      return;
    }

    if (deleteConfirmation !== currentWorkspace.name) {
      toast({
        title: 'Confirmation failed',
        description: 'Please type the workspace name to confirm deletion.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    console.log('Deleting workspace:', currentWorkspace.id);

    try {
      const success = await deleteWorkspace(currentWorkspace.id);

      if (success) {
        console.log('Workspace deleted successfully');
        setShowDeleteDialog(false);
        toast({
          title: 'Workspace deleted',
          description: 'The workspace has been permanently deleted.',
        });

        console.log('Redirecting to overview after deletion');
        // Change to overview section after successful deletion
        changeSection('overview');
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get member role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      case 'guest':
        return 'Guest';
      default:
        return role;
    }
  };

  // When no workspace is selected, show a fallback UI
  if (!currentWorkspace) {
    console.log('No current workspace, showing fallback UI');
    return (
      <div className="flex items-center justify-center h-[calc(100vh-14rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Workspace Selected</CardTitle>
            <CardDescription>Please select or create a workspace to manage.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => changeSection('overview')}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  console.log('Rendering workspace settings for:', currentWorkspace.name);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Workspace Settings</h1>
          <p className="text-muted-foreground">Manage your workspace settings and members</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            console.log('Back button clicked, returning to overview');
            changeSection('overview');
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="danger">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <form onSubmit={handleUpdate}>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Update your workspace name, description, and logo</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workspace-logo">Workspace Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        {logoPreview ? (
                          <AvatarImage src={logoPreview} alt={name} />
                        ) : (
                          <AvatarFallback className="text-2xl">
                            {name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => {
                            setLogo(null);
                            setLogoPreview(null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="logo-upload"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended size: 256x256px
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="My Workspace"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workspace-description">Description</Label>
                  <Textarea
                    id="workspace-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your workspace..."
                    rows={3}
                  />
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Members</CardTitle>
              <CardDescription>
                Manage members and invite new users to your workspace
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleInvite} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="invite-email">Invite User</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="Email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="invite-role" className="w-[120px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isInviting}>
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </>
                  )}
                </Button>
              </form>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Current Members</h3>
                <div className="border rounded-md overflow-hidden">
                  {currentWorkspace.members && currentWorkspace.members.length > 0 ? (
                    <div className="divide-y">
                      {currentWorkspace.members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              {member.avatar ? (
                                <AvatarImage src={member.avatar} alt={member.name || 'Member'} />
                              ) : (
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name || member.email}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {getRoleDisplay(member.role)}
                            </span>
                            {member.role !== 'owner' && (
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="mt-2 text-muted-foreground">No members found</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                These actions are irreversible and can lead to data loss
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="border border-destructive/20 rounded-md p-4 bg-destructive/5">
                <h3 className="text-lg font-medium text-destructive">Delete Workspace</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently delete the workspace and all associated data
                </p>
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="mt-4">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Workspace
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Workspace</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the workspace and
                        all associated data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p>
                        Please type <span className="font-bold">{currentWorkspace.name}</span> to
                        confirm.
                      </p>
                      <Input
                        value={deleteConfirmation}
                        onChange={e => setDeleteConfirmation(e.target.value)}
                        placeholder={currentWorkspace.name}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || deleteConfirmation !== currentWorkspace.name}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Workspace'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
