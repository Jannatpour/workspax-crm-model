// /components/workspace/invitation/invitation-list.tsx
'use client';

import { useWorkspace, WorkspaceInvitation } from '@/context/workspace-context';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Copy, MoreVertical, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/sonner';
import { useState } from 'react';

export function InvitationList() {
  const { currentWorkspace, cancelInvitation, resendInvitation } = useWorkspace();
  const { toast } = useToast();
  const [actioningId, setActioningId] = useState<string | null>(null);

  const pendingInvitations = currentWorkspace?.pendingInvitations || [];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (date: Date) => {
    return new Date(date) < new Date();
  };

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

  const copyInviteLink = async (invitation: WorkspaceInvitation) => {
    const inviteLink = `${window.location.origin}/invite?token=${invitation.token}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Link copied', {
        description: 'Invitation link copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvitation = async (id: string) => {
    setActioningId(id);

    try {
      await cancelInvitation(id);
      toast({
        title: 'Invitation cancelled',
        description: 'The invitation has been cancelled',
      });
    } catch (err) {
      toast({
        title: 'Cancellation failed',
        description: err instanceof Error ? err.message : 'Failed to cancel invitation',
        variant: 'destructive',
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleResendInvitation = async (id: string) => {
    setActioningId(id);

    try {
      const updatedInvitation = await resendInvitation(id);

      // Copy new link to clipboard
      const inviteLink = `${window.location.origin}/invite?token=${updatedInvitation.token}`;
      await navigator.clipboard.writeText(inviteLink);

      toast({
        title: 'Invitation resent',
        description: 'New invitation link copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Resend failed',
        description: err instanceof Error ? err.message : 'Failed to resend invitation',
        variant: 'destructive',
      });
    } finally {
      setActioningId(null);
    }
  };

  if (pendingInvitations.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingInvitations.map(invitation => (
            <TableRow key={invitation.id}>
              <TableCell>{invitation.email}</TableCell>
              <TableCell>{getRoleDisplay(invitation.role)}</TableCell>
              <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
              <TableCell>
                {isExpired(invitation.expiresAt) ? (
                  <Badge
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/20"
                  >
                    Expired
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={actioningId === invitation.id}
                    >
                      {actioningId === invitation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyInviteLink(invitation)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
