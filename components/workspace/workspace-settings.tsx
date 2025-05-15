// /components/workspace/workspace-settings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
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
  Link,
} from 'lucide-react';
import { PermissionGate } from '@/components/workspace/permissions/permission-gate';
import { InvitationForm } from '@/components/workspace/invitation/invitation-form';
import { InvitationList } from '@/components/workspace/invitation/invitation-list';

// Mock current user ID (this would come from your auth system in a real app)
const CURRENT_USER_ID = '1';

export function WorkspaceSettings() {
  const { currentSection, changeSection } = useDashboard();
  const {
    currentWorkspace,
    updateWorkspace,
    deleteWorkspace,
    updateMemberRole,
    removeMember,
    isLoading,
    error,
    fetchWorkspaces,
    getCurrentUserRole,
    hasPermission,
  } = useWorkspace();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberAction, setMemberAction] = useState<{ id: string; action: string } | null>(null);
  const { toast } = useToast();

  // Initialize form with current workspace data
  useEffect(() => {
    if (currentWorkspace) {
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

    try {
      const data: Partial<typeof currentWorkspace> = {
        name,
        description,
      };

      if (logo) {
        data.logo = logo;
      }

      await updateWorkspace(currentWorkspace.id, data);

      toast.success('Workspace updated', {
        description: 'Your workspace settings have been saved.',
      });
    } catch (error) {
      toast.error('Update failed', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete workspace
  const handleDelete = async () => {
    if (!currentWorkspace) {
      return;
    }

    if (deleteConfirmation !== currentWorkspace.name) {
      toast.error('Confirmation failed', {
        description: 'Please type the workspace name to confirm deletion.',
      });
      return;
    }

    setIsDeleting(true);

    try {
      const success = await deleteWorkspace(currentWorkspace.id);

      if (success) {
        setShowDeleteDialog(false);
        toast.success('Workspace deleted', {
          description: 'The workspace has been permanently deleted.',
        });

        // Change to overview section after successful deletion
        changeSection('overview');
      }
    } catch (error) {
      toast.error('Deletion failed', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Update member role
  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!currentWorkspace) return;

    setMemberAction({ id: memberId, action: 'update' });

    try {
      await updateMemberRole(currentWorkspace.id, memberId, newRole as any);
      toast.success('Role updated', {
        description: 'Member role has been updated successfully.',
      });
    } catch (error) {
      toast.error('Update failed', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setMemberAction(null);
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId: string) => {
    if (!currentWorkspace) return;

    setMemberAction({ id: memberId, action: 'remove' });

    try {
      await removeMember(currentWorkspace.id, memberId);
      toast.success('Member removed', {
        description: 'Member has been removed from the workspace.',
      });
    } catch (error) {
      toast.error('Removal failed', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setMemberAction(null);
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

  const currentUserRole = getCurrentUserRole();

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Workspace Settings</h1>
          <p className="text-muted-foreground">Manage your workspace settings and members</p>
        </div>
        <Button
          variant="outline"
          onClick={() => changeSection('overview')}
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
          <TabsTrigger value="invitations">
            <Link className="h-4 w-4 mr-2" />
            Invitations
          </TabsTrigger>
          <PermissionGate permission="workspace:delete">
            <TabsTrigger value="danger">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Danger Zone
            </TabsTrigger>
          </PermissionGate>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <PermissionGate
              permission="workspace:update"
              fallback={
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        {currentWorkspace.logo && typeof currentWorkspace.logo === 'string' ? (
                          <AvatarImage src={currentWorkspace.logo} alt={currentWorkspace.name} />
                        ) : (
                          <AvatarFallback className="text-2xl">
                            {currentWorkspace.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium">{currentWorkspace.name}</h3>
                        {currentWorkspace.description && (
                          <p className="text-muted-foreground">{currentWorkspace.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-md bg-muted p-4">
                      <p className="text-sm text-muted-foreground">
                        You need admin or owner permissions to edit workspace settings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              }
            >
              <form onSubmit={handleUpdate}>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Update your workspace name, description, and logo
                  </CardDescription>
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
            </PermissionGate>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Members</CardTitle>
              <CardDescription>View members and their roles in your workspace</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
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
                            {/* Role display/selector */}
                            {hasPermission('workspace:members:update') &&
                            member.id !== currentWorkspace.ownerId ? (
                              <Select
                                value={member.role}
                                onValueChange={value => handleUpdateRole(member.id, value)}
                                disabled={memberAction?.id === member.id}
                              >
                                <SelectTrigger className="w-[110px]">
                                  {memberAction?.id === member.id &&
                                  memberAction.action === 'update' ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="guest">Guest</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm px-3 py-1 rounded-md bg-muted">
                                {getRoleDisplay(member.role)}
                              </span>
                            )}

                            {/* Remove button */}
                            {hasPermission('workspace:members:remove') &&
                              member.id !== currentWorkspace.ownerId &&
                              member.id !== CURRENT_USER_ID && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={memberAction?.id === member.id}
                                >
                                  {memberAction?.id === member.id &&
                                  memberAction.action === 'remove' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  )}
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

        <TabsContent value="invitations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Invitations</CardTitle>
              <CardDescription>Invite new users to join your workspace</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <PermissionGate
                permission="workspace:members:invite"
                fallback={
                  <div className="rounded-md bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      You need admin or owner permissions to invite members to this workspace.
                    </p>
                  </div>
                }
              >
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Invite a New Member</h3>
                  <InvitationForm />
                </div>
              </PermissionGate>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Pending Invitations</h3>
                <InvitationList />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-6">
          <PermissionGate permission="workspace:delete">
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
                          This action cannot be undone. This will permanently delete the workspace
                          and all associated data.
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
          </PermissionGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
