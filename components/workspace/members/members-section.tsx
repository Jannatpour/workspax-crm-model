'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWorkspace, WorkspaceMember, WorkspaceRole } from '@/context/workspace-client-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/sonner';
import {
  UserPlus,
  MoreHorizontal,
  Shield,
  User,
  UserCheck,
  AlertCircle,
  Loader2,
  UserX,
  Mail,
  Search,
  ArrowUpDown,
  Crown,
  Copy,
  RefreshCw,
  Clock,
  CheckCircle2,
  Users as UsersIcon,
  Filter,
} from 'lucide-react';
import { PermissionGate } from '@/components/workspace/permissions/permission-gate';

// Member activity status (would be real-time in a production app)
type ActivityStatus = 'online' | 'offline' | 'away' | 'busy';

// Enhanced member type with activity information
interface EnhancedMember extends WorkspaceMember {
  status?: ActivityStatus;
  lastActive?: Date;
  joinedAt: Date; // Make required for sorting
}

export function MembersSection() {
  const {
    currentWorkspace,
    hasPermission,
    inviteToWorkspace,
    updateMemberRole,
    removeMember,
    currentUser,
    cancelInvitation,
    resendInvitation,
  } = useWorkspace();

  // States for member management
  const [members, setMembers] = useState<EnhancedMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'role' | 'joinedAt'>('joinedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // States for member actions
  const [actionLoading, setActionLoading] = useState<{ id: string; action: string } | null>(null);

  // States for invitation dialog
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('member');
  const [bulkInvites, setBulkInvites] = useState<string>('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // States for removal dialog
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<EnhancedMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Notifications
  const { toast } = useToast();

  // Load and enhance members when workspace changes
  useEffect(() => {
    if (currentWorkspace && currentWorkspace.members) {
      // Add fake activity data (would be real in production)
      const enhancedMembers: EnhancedMember[] = currentWorkspace.members.map(member => {
        const statuses: ActivityStatus[] = ['online', 'offline', 'away', 'busy'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        // Create a random last active date within the past week
        const lastActive = new Date();
        lastActive.setDate(lastActive.getDate() - Math.floor(Math.random() * 7));

        // Ensure joined date exists for sorting
        const joinedAt = member.joinedAt ? new Date(member.joinedAt) : new Date();

        return {
          ...member,
          status: randomStatus,
          lastActive,
          joinedAt,
        };
      });

      setMembers(enhancedMembers);
    }
  }, [currentWorkspace]);

  // Filter members based on search and tab
  const filteredMembers = useMemo(() => {
    if (!members) return [];

    let filtered = [...members];

    // Filter by search query (name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        member =>
          member.name?.toLowerCase().includes(query) || member.email.toLowerCase().includes(query)
      );
    }

    // Filter by tab/role
    if (activeTab !== 'all') {
      filtered = filtered.filter(member => member.role === activeTab);
    }

    // Sort members
    filtered.sort((a, b) => {
      if (sortField === 'name') {
        const nameA = a.name || a.email;
        const nameB = b.name || b.email;
        return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (sortField === 'role') {
        // Priority order: owner, admin, member, guest
        const roleOrder = { owner: 0, admin: 1, member: 2, guest: 3 };
        const roleValueA = roleOrder[a.role as keyof typeof roleOrder];
        const roleValueB = roleOrder[b.role as keyof typeof roleOrder];
        return sortDirection === 'asc' ? roleValueA - roleValueB : roleValueB - roleValueA;
      } else {
        // Sort by join date
        return sortDirection === 'asc'
          ? a.joinedAt.getTime() - b.joinedAt.getTime()
          : b.joinedAt.getTime() - a.joinedAt.getTime();
      }
    });

    return filtered;
  }, [members, searchQuery, activeTab, sortField, sortDirection]);

  // Handle sorting toggle
  const toggleSort = (field: 'name' | 'role' | 'joinedAt') => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle member invitation
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBulkMode) {
      await handleBulkInvite();
      return;
    }

    if (!inviteEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address to invite',
        variant: 'destructive',
      });
      return;
    }

    if (!currentWorkspace) {
      toast({
        title: 'No workspace selected',
        description: 'Please select a workspace first',
        variant: 'destructive',
      });
      return;
    }

    setIsInviting(true);

    try {
      await inviteToWorkspace(currentWorkspace.id, inviteEmail, inviteRole);

      toast({
        title: 'Invitation sent',
        description: `Successfully invited ${inviteEmail} as ${inviteRole}`,
      });

      // Reset form
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteDialog(false);
    } catch (error) {
      toast({
        title: 'Failed to send invitation',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Handle bulk invitation
  const handleBulkInvite = async () => {
    if (!bulkInvites.trim() || !currentWorkspace) return;

    setIsInviting(true);

    // Parse emails (comma or newline separated)
    const emails = bulkInvites
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && /\S+@\S+\.\S+/.test(email)); // Simple email validation

    if (emails.length === 0) {
      toast({
        title: 'No valid emails',
        description: 'Please enter valid email addresses',
        variant: 'destructive',
      });
      setIsInviting(false);
      return;
    }

    // Track success and failures
    let successCount = 0;
    let failureCount = 0;

    // Invite each email
    for (const email of emails) {
      try {
        await inviteToWorkspace(currentWorkspace.id, email, inviteRole);
        successCount++;
      } catch (error) {
        failureCount++;
        console.error(`Failed to invite ${email}:`, error);
      }
    }

    // Show results
    if (successCount > 0) {
      toast({
        title: `${successCount} invitation${successCount > 1 ? 's' : ''} sent`,
        description: `Successfully invited ${successCount} member${successCount > 1 ? 's' : ''}`,
      });
    }

    if (failureCount > 0) {
      toast({
        title: `${failureCount} invitation${failureCount > 1 ? 's' : ''} failed`,
        description: 'Some invitations could not be sent. Check the console for details.',
        variant: 'destructive',
      });
    }

    // Reset form
    setBulkInvites('');
    setInviteRole('member');
    setShowInviteDialog(false);
    setIsBulkMode(false);
    setIsInviting(false);
  };

  // Handle role change
  const handleRoleChange = async (memberId: string, userId: string, newRole: WorkspaceRole) => {
    if (!currentWorkspace) return;

    setActionLoading({ id: memberId, action: 'role' });

    try {
      await updateMemberRole(currentWorkspace.id, memberId, newRole);

      // Update local state
      setMembers(prev =>
        prev.map(member => (member.id === memberId ? { ...member, role: newRole } : member))
      );

      toast({
        title: 'Role updated',
        description: 'Member role has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to update role',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle member removal
  const handleRemoveMember = async () => {
    if (!currentWorkspace || !memberToRemove) return;

    setIsRemoving(true);

    try {
      await removeMember(currentWorkspace.id, memberToRemove.id);

      // Update local state
      setMembers(prev => prev.filter(member => member.id !== memberToRemove.id));

      toast({
        title: 'Member removed',
        description: `${
          memberToRemove.name || memberToRemove.email
        } has been removed from the workspace`,
      });

      setShowRemoveDialog(false);
      setMemberToRemove(null);
    } catch (error) {
      toast({
        title: 'Failed to remove member',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  // Copy invitation link (mock function - would generate real links in production)
  const copyInvitationLink = (email: string) => {
    // In a real app, this would generate and copy a valid invitation link
    const dummyLink = `https://app.example.com/invite?email=${encodeURIComponent(
      email
    )}&workspace=${currentWorkspace?.id}`;
    navigator.clipboard.writeText(dummyLink).then(() => {
      toast({
        title: 'Invitation link copied',
        description: 'You can share this link directly with the invitee',
      });
    });
  };

  // Resend invitation (mock function - would use real invitations in production)
  const handleResendInvitation = async (memberId: string) => {
    if (!currentWorkspace) return;

    setActionLoading({ id: memberId, action: 'resend' });

    try {
      // In a real app, this would use the actual invitation ID
      await resendInvitation(memberId);

      toast({
        title: 'Invitation resent',
        description: 'The invitation has been resent successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to resend invitation',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Render role badge with tooltip
  const renderRoleBadge = (role: string, showTooltip = true) => {
    let badge;
    let tooltipContent = '';

    switch (role) {
      case 'owner':
        badge = (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Crown className="h-3.5 w-3.5 mr-1 text-amber-500" />
            <span>Owner</span>
          </Badge>
        );
        tooltipContent = 'Owners have full control over the workspace and its settings';
        break;
      case 'admin':
        badge = (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="h-3.5 w-3.5 mr-1 text-blue-500" />
            <span>Admin</span>
          </Badge>
        );
        tooltipContent = 'Admins can manage workspace settings and members';
        break;
      case 'member':
        badge = (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <UserCheck className="h-3.5 w-3.5 mr-1 text-green-500" />
            <span>Member</span>
          </Badge>
        );
        tooltipContent = 'Members can access all workspace resources';
        break;
      case 'guest':
        badge = (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
            <span>Guest</span>
          </Badge>
        );
        tooltipContent = 'Guests have limited access to specific resources';
        break;
      default:
        badge = <Badge variant="outline">{role}</Badge>;
        tooltipContent = role;
    }

    return showTooltip ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{badge}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      badge
    );
  };

  // Render activity status
  const renderActivityStatus = (status?: ActivityStatus, lastActive?: Date) => {
    if (!status) return null;

    let statusColor = '';
    let statusText = '';
    let tooltip = '';

    switch (status) {
      case 'online':
        statusColor = 'bg-green-500';
        statusText = 'Online';
        tooltip = 'Currently active';
        break;
      case 'away':
        statusColor = 'bg-amber-500';
        statusText = 'Away';
        tooltip = 'Inactive for a few minutes';
        break;
      case 'busy':
        statusColor = 'bg-red-500';
        statusText = 'Busy';
        tooltip = 'Do not disturb';
        break;
      default:
        statusColor = 'bg-gray-500';
        statusText = 'Offline';
        tooltip = lastActive ? `Last active ${formatLastActive(lastActive)}` : 'Currently offline';
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${statusColor}`} />
              <span className="text-xs text-muted-foreground">{statusText}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Format last active time
  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  // Determine if the current user can manage this member
  const canManageMember = (member: WorkspaceMember) => {
    if (!currentWorkspace || !currentUser) return false;

    // Can't manage yourself or the owner
    if (member.userId === currentUser.id || member.userId === currentWorkspace.ownerId) {
      return false;
    }

    return hasPermission('workspace:members:update');
  };

  // Get initials from name or email
  const getInitials = (member: WorkspaceMember) => {
    if (member.name) {
      return member.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }

    return member.email.substring(0, 2).toUpperCase();
  };

  // Count members by role
  const countByRole = (role: string) => {
    return members.filter(m => m.role === role).length;
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>No workspace selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Workspace Members</CardTitle>
            <CardDescription className="mt-1">
              Manage members and their access levels in {currentWorkspace.name}
            </CardDescription>
          </div>

          <PermissionGate permission="workspace:members:invite">
            <Button onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </PermissionGate>
        </CardHeader>

        <CardContent>
          {/* Tabs and Search bar */}
          <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <UsersIcon className="h-3.5 w-3.5" />
                  <span>All</span>
                  <Badge variant="secondary" className="ml-1">
                    {members.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="owner" className="flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" />
                  <span>Owners</span>
                  <Badge variant="secondary" className="ml-1">
                    {countByRole('owner')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admins</span>
                  <Badge variant="secondary" className="ml-1">
                    {countByRole('admin')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="member" className="flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Members</span>
                  <Badge variant="secondary" className="ml-1">
                    {countByRole('member')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="guest" className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Guests</span>
                  <Badge variant="secondary" className="ml-1">
                    {countByRole('guest')}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="w-full sm:w-[250px] pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Members List */}
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No members yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Invite team members to collaborate in this workspace
              </p>

              <PermissionGate
                permission="workspace:members:invite"
                fallback={
                  <p className="text-sm text-muted-foreground italic">
                    You need admin permissions to invite members
                  </p>
                }
              >
                <Button onClick={() => setShowInviteDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </PermissionGate>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Filter className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No matching members</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">User</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                        onClick={() => toggleSort('role')}
                      >
                        Role
                        <ArrowUpDown
                          className={`h-3.5 w-3.5 text-muted-foreground ${
                            sortField === 'role' ? 'opacity-100' : 'opacity-50'
                          }`}
                        />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                        onClick={() => toggleSort('joinedAt')}
                      >
                        Joined
                        <ArrowUpDown
                          className={`h-3.5 w-3.5 text-muted-foreground ${
                            sortField === 'joinedAt' ? 'opacity-100' : 'opacity-50'
                          }`}
                        />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map(member => (
                    <TableRow
                      key={member.id}
                      className={
                        currentUser && member.userId === currentUser.id ? 'bg-muted/30' : ''
                      }
                    >
                      <TableCell className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt={member.name || member.email} />
                            ) : (
                              <AvatarFallback>{getInitials(member)}</AvatarFallback>
                            )}
                          </Avatar>
                          {member.status === 'online' && (
                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.name || 'No name'}</span>
                            {currentUser && member.userId === currentUser.id && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                            {member.userId === currentWorkspace.ownerId && (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 border-amber-200 text-xs"
                              >
                                <Crown className="h-3 w-3 mr-1 text-amber-500" />
                                <span className="text-amber-700">Owner</span>
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{renderRoleBadge(member.role)}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">
                                  {member.joinedAt
                                    ? new Date(member.joinedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })
                                    : 'Unknown'}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {member.joinedAt
                                  ? `Joined on ${new Date(member.joinedAt).toLocaleDateString(
                                      'en-US',
                                      {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }
                                    )}`
                                  : 'Join date unknown'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        {renderActivityStatus(member.status, member.lastActive)}
                      </TableCell>
                      <TableCell className="text-right">
                        {canManageMember(member) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!!actionLoading && actionLoading.id === member.id}
                              >
                                {actionLoading && actionLoading.id === member.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem onClick={() => copyInvitationLink(member.email)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Invitation Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResendInvitation(member.id)}
                                disabled={member.status === 'online'}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Resend Invitation
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, member.userId, 'admin')}
                              >
                                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, member.userId, 'member')}
                              >
                                <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, member.userId, 'guest')}
                              >
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                Make Guest
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setMemberToRemove(member);
                                  setShowRemoveDialog(true);
                                }}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-sm text-muted-foreground px-2">
                            {member.userId === currentUser?.id ? 'You' : 'No actions'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredMembers.length} of {members.length} members
          </div>

          <PermissionGate permission="workspace:members:invite">
            <div className="flex items-center gap-2">
              {/* Additional actions could go here */}
              <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>
          </PermissionGate>
        </CardFooter>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member{isBulkMode ? 's' : ''}</DialogTitle>
            <DialogDescription>
              {isBulkMode
                ? 'Invite multiple members to join your workspace. Enter one email per line or separate with commas.'
                : 'Invite a team member to join your workspace. They will receive an email invitation.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-4">
              {/* Toggle between single and bulk mode */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkMode(!isBulkMode)}
                >
                  {isBulkMode ? 'Single Invite' : 'Bulk Invite'}
                </Button>
              </div>

              {isBulkMode ? (
                <div className="space-y-2">
                  <Label htmlFor="bulk-emails">Email Addresses</Label>
                  <textarea
                    id="bulk-emails"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="john@example.com, jane@example.com"
                    value={bulkInvites}
                    onChange={e => setBulkInvites(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter multiple email addresses separated by commas or newlines
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={value => setInviteRole(value as WorkspaceRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="member">
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                        <span>Member</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="guest">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Guest</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {inviteRole === 'admin' && 'Admins can manage workspace settings and members'}
                  {inviteRole === 'member' && 'Members can view and use all workspace resources'}
                  {inviteRole === 'guest' && 'Guests have limited access to specific resources'}
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInviting || (isBulkMode ? !bulkInvites.trim() : !inviteEmail.trim())}
              >
                {isInviting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isBulkMode ? 'Inviting Members...' : 'Inviting...'}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {isBulkMode ? 'Send Invitations' : 'Send Invitation'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the workspace? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {memberToRemove && (
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-md">
              <Avatar>
                {memberToRemove.avatar ? (
                  <AvatarImage
                    src={memberToRemove.avatar}
                    alt={memberToRemove.name || memberToRemove.email}
                  />
                ) : (
                  <AvatarFallback>{getInitials(memberToRemove)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="font-medium">{memberToRemove.name || 'No name'}</div>
                <div className="text-sm text-muted-foreground">{memberToRemove.email}</div>
                <div className="flex items-center mt-1.5 gap-1.5">
                  {renderRoleBadge(memberToRemove.role, false)}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md mt-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div>
              <p>This member will immediately lose access to the workspace.</p>
              <p className="mt-1">Any content they've created will remain in the workspace.</p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isRemoving}>
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Remove Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
