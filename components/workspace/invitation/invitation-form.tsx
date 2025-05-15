// /components/workspace/invitation/invitation-form.tsx
'use client';

import { useState } from 'react';
import { useWorkspace, WorkspaceRole } from '@/context/workspace-context';
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
import { Loader2, Send, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/sonner';

export function InvitationForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('member');
  const [isInviting, setIsInviting] = useState(false);

  const { currentWorkspace, inviteToWorkspace } = useWorkspace();
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentWorkspace) {
      toast({
        title: 'No workspace selected',
        description: 'Please select a workspace first.',
        variant: 'destructive',
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

      toast({
        title: 'Invitation sent',
        description: 'Invitation link copied to clipboard.',
      });

      setEmail('');
    } catch (err) {
      toast({
        title: 'Invitation failed',
        description: err instanceof Error ? err.message : 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <Select value={role} onValueChange={value => setRole(value as WorkspaceRole)}>
          <SelectTrigger id="invite-role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
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
