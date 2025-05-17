// /components/workspace/invitation/accept-invitation.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/context/workspace-client-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function AcceptInvitation() {
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const { acceptInvitation } = useWorkspace();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const inviteToken = searchParams.get('invite');
    if (inviteToken) {
      setToken(inviteToken);
    }
  }, [searchParams]);

  const handleAcceptInvitation = async () => {
    if (!token) return;

    setIsAccepting(true);
    setError(null);

    try {
      await acceptInvitation(token);
      // Redirect to dashboard after accepting
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Workspace Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You've been invited to join a workspace. Would you like to accept this invitation?
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => router.push('/')}>
            Decline
          </Button>
          <Button onClick={handleAcceptInvitation} disabled={isAccepting}>
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
