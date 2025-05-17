// /components/workspace/invitation/invitation-form.tsx
'use client';

import React, { useState } from 'react';
import { useWorkspace, WorkspaceRole } from '@/context/workspace-client-context';
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
import { Loader2, Send, UserPlus, Shield, Users, User } from 'lucide-react';
import { useToast } from '@/components/ui/sonner';

export function InvitationForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('member');
  const [isInviting, setIsInviting] = useState(false);

  const { currentWorkspace, currentUser, inviteToWorkspace } = useWorkspace();
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentWorkspace) {
      toast.error('No workspace selected', {
        description: 'Please select a workspace first.',
      });
      return;
    }

    if (!currentUser) {
      toast.error('Authentication required', {
        description: 'You must be logged in to send invitations.',
      });
      return;
    }

    setIsInviting(true);

    try {
      const invitation = await inviteToWorkspace(currentWorkspace.id, email, role);

      // Generate the invitation link
      const inviteLink = `${window.location.origin}/invite?token=${invitation.token}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink);

      toast.success('Invitation sent', {
        description: 'Invitation link copied to clipboard.',
      });

      setEmail('');
    } catch (err) {
      toast.error('Invitation failed', {
        description: err instanceof Error ? err.message : 'Failed to send invitation',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleIcon = (roleValue: string) => {
    switch (roleValue) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'member':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'guest':
        return <User className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleInvite} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-email">Email Address</Label>
        <Input
          id="invite-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          required
        />
        <p className="text-xs text-muted-foreground">
          The invitation will be sent from {currentUser?.email || 'your account'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <Select value={role} onValueChange={value => setRole(value as WorkspaceRole)}>
          <SelectTrigger id="invite-role" className="flex items-center gap-2">
            {getRoleIcon(role)}
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500 mr-2" />
              <span>Admin</span>
            </SelectItem>
            <SelectItem value="member" className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500 mr-2" />
              <span>Member</span>
            </SelectItem>
            <SelectItem value="guest" className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500 mr-2" />
              <span>Guest</span>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {role === 'admin' && 'Admins can manage workspace settings and members.'}
          {role === 'member' &&
            'Members can access all workspace content but cannot manage settings.'}
          {role === 'guest' && 'Guests have limited access to specific items only.'}
        </p>
      </div>

      <Button type="submit" disabled={isInviting} className="w-full">
        {isInviting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Invitation...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Send Invitation
          </>
        )}
      </Button>
    </form>
  );
}
