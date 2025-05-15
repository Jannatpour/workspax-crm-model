'use client';
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { useWorkspace } from '@/context/workspace-context';
import { useRouter } from 'next/navigation';

export function CreateWorkspace() {
  const [workspaceName, setWorkspaceName] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { createWorkspace } = useWorkspace();
  const router = useRouter();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceName.trim()) {
      setError('Workspace name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createWorkspace({ name: workspaceName, logo: logo || undefined });
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating workspace:', err);
      setError('Failed to create workspace. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Workspace</CardTitle>
          <CardDescription>Set up a workspace for your company or organization</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <div
                  className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Workspace Logo Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Building className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <Input
                  type="file"
                  id="logo"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground">Optional: Upload your company logo</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  placeholder="Acme Corporation"
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="text-sm text-red-500 text-center">{error}</div>}
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isCreating || !workspaceName.trim()}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Workspace
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
