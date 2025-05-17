'use client';

import React, { useState } from 'react';
import { useWorkspace, WorkspaceInvitation } from '@/context/workspace-client-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/sonner';
import {
  Mail,
  MoreHorizontal,
  Clock,
  XCircle,
  RefreshCw,
  Copy,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { PermissionGate } from '@/components/workspace/permissions/permission-gate';

export function InvitationList() {
  const { currentWorkspace, cancelInvitation, resendInvitation } = useWorkspace();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<{ id: string; action: string } | null>(null);

  // Mock invitations data - in a real app, this would come from the context/API
  const mockInvitations: WorkspaceInvitation[] = [
    {
      id: '1',
      email: 'johndoe@example.com',
      role: 'admin',
      token: 'token1',
      workspaceId: currentWorkspace?.id || '',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // expires in 4 days
      createdBy: 'user1',
      createdByName: 'Alex Smith',
    },
    {
      id: '2',
      email: 'jane@example.com',
      role: 'member',
      token: 'token2',
      workspaceId: currentWorkspace?.id || '',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // expires in 6 days
      createdBy: 'user1',
      createdByName: 'Alex Smith',
    },
    {
      id: '3',
      email: 'robert@example.com',
      role: 'guest',
      token: 'token3',
      workspaceId: currentWorkspace?.id || '',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // expires in 1 day
      createdBy: 'user1',
      createdByName: 'Alex Smith',
    },
  ];

  // Use pending invitations from the workspace if available, otherwise use mock data
  const pendingInvitations = currentWorkspace?.pendingInvitations || mockInvitations;

  // Handle cancel invitation
  const handleCancelInvitation = async (invitationId: string) => {
    setActionLoading({ id: invitationId, action: 'cancel' });
    try {
      await cancelInvitation(invitationId);
      toast({
        title: 'Invitation cancelled',
        description: 'The invitation has been cancelled successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to cancel invitation',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle resend invitation
  const handleResendInvitation = async (invitationId: string) => {
    setActionLoading({ id: invitationId, action: 'resend' });
    try {
      await resendInvitation(invitationId);
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

  // Copy invitation link
  const copyInvitationLink = (invitation: WorkspaceInvitation) => {
    // In a real app, this would generate a proper invitation link
    const invitationLink = `https://app.example.com/invite/${invitation.token}`;

    navigator.clipboard.writeText(invitationLink).then(() => {
      toast({
        title: 'Invitation link copied',
        description: 'Invitation link has been copied to clipboard',
      });
    });
  };

  // Format expiration time
  const formatExpirationTime = (expirationDate: Date) => {
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'Expired';
    } else if (diffDays === 1) {
      return 'Expires today';
    } else if (diffDays <= 7) {
      return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else {
      return expirationDate.toLocaleDateString();
    }
  };

  // Get role display
  const getRoleDisplay = (role: string) => {
    switch (role) {
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

  // Check if invitation is about to expire
  const isAboutToExpire = (expirationDate: Date) => {
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2; // Consider 2 days or less as "about to expire"
  };

  if (!currentWorkspace) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>Manage pending workspace invitations</CardDescription>
      </CardHeader>
      <CardContent>
        <PermissionGate permission="workspace:members:invite">
          {pendingInvitations.length === 0 ? (
            <div className="text-center py-6">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No pending invitations</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invitee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map(invitation => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getRoleDisplay(invitation.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">
                                  {new Date(invitation.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Invited on {new Date(invitation.createdAt).toLocaleString()}
                                {invitation.createdByName && ` by ${invitation.createdByName}`}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        {isAboutToExpire(new Date(invitation.expiresAt)) ? (
                          <div className="flex items-center gap-1.5 text-amber-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="text-sm">
                              {formatExpirationTime(new Date(invitation.expiresAt))}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm">
                            {formatExpirationTime(new Date(invitation.expiresAt))}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!!actionLoading && actionLoading.id === invitation.id}
                            >
                              {actionLoading && actionLoading.id === invitation.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyInvitationLink(invitation)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Invitation Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend Invitation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCancelInvitation(invitation.id)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </PermissionGate>

        <PermissionGate
          permission="workspace:members:invite"
          fallback={
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                You need admin or owner permissions to manage invitations.
              </p>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}
