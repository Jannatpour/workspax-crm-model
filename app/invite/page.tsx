// /app/invite/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/context/workspace-client-context';
import { useDashboard } from '@/context/dashboard-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, AlertTriangle } from 'lucide-react';

export default function InvitePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { acceptInvitation } = useWorkspace();
  const { changeSection, refreshUI } = useDashboard();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Invalid invitation link. No token provided.');
      return;
    }

    const processInvitation = async () => {
      setIsProcessing(true);

      try {
        await acceptInvitation(token);
        setSuccess(true);

        // Redirect to dashboard after a delay using section-based navigation
        setTimeout(() => {
          console.log('Navigation to dashboard overview after successful invitation');
          // First navigate to the dashboard page if not already there
          router.push('/dashboard');

          // Then use the section-based navigation
          setTimeout(() => {
            changeSection('overview');
            refreshUI(); // Force UI refresh to ensure proper rendering
          }, 100);
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      } finally {
        setIsProcessing(false);
      }
    };

    processInvitation();
  }, [searchParams, acceptInvitation, router, changeSection, refreshUI]);

  // Handle manual navigation to dashboard
  const handleNavigateHome = () => {
    // First navigate to the base dashboard page
    router.push('/dashboard');

    // Then handle the section-based navigation after a slight delay
    setTimeout(() => {
      changeSection('overview');
      refreshUI();
    }, 100);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            {error ? (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                Invitation Error
              </>
            ) : (
              'Workspace Invitation'
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessing && (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center">Processing your invitation...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-muted-foreground mt-2">
                The invitation may have expired or been cancelled.
              </p>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center py-6">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">You've successfully joined the workspace!</p>
              <p className="text-muted-foreground mt-2 text-center">
                Redirecting you to the dashboard...
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {error && (
            <Button onClick={handleNavigateHome} className="px-6">
              Return to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
