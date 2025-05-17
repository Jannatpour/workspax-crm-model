// /components/workspace/workspace-selector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-client-context';
import { useDashboard } from '@/context/dashboard-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Check, PlusCircle, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/sonner';

export function WorkspaceSelector() {
  const { changeSection } = useDashboard();
  const {
    currentWorkspace,
    workspaces,
    setCurrentWorkspace,
    createWorkspace,
    isLoading,
    clearWorkspaceData,
  } = useWorkspace();

  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newWorkspaceName.trim()) return;

    try {
      await createWorkspace({
        name: newWorkspaceName,
        logo: logoFile || undefined,
      });

      setNewWorkspaceName('');
      setLogoFile(null);
      setShowCreateDialog(false);

      toast.success('Workspace created', {
        description: 'Your new workspace is ready.',
      });
    } catch (error) {
      toast({
        title: 'Creation failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleSelectWorkspace = (workspace: typeof currentWorkspace) => {
    if (!workspace || (currentWorkspace && workspace.id === currentWorkspace.id)) {
      setOpen(false);
      return;
    }

    // Clear all workspace-specific data before switching
    clearWorkspaceData();

    // Set the new workspace
    setCurrentWorkspace(workspace);
    setOpen(false);

    // Redirect to overview
    changeSection('overview');

    toast({
      title: 'Workspace switched',
      description: `You are now in "${workspace.name}"`,
    });
  };

  // Handle manage workspace navigation
  const handleManageWorkspace = () => {
    setOpen(false);
    // Add a short delay to ensure the popover closes properly
    setTimeout(() => {
      changeSection('settings-workspace');
    }, 10);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-[240px] px-3"
          >
            <div className="flex items-center gap-2 truncate">
              {currentWorkspace ? (
                <>
                  <Avatar className="h-6 w-6">
                    {currentWorkspace.logo ? (
                      <AvatarImage
                        src={
                          typeof currentWorkspace.logo === 'string'
                            ? currentWorkspace.logo
                            : URL.createObjectURL(currentWorkspace.logo as File)
                        }
                        alt={currentWorkspace.name}
                      />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {currentWorkspace.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="truncate">{currentWorkspace.name}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Select workspace</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder="Search workspaces..." />
            <CommandList>
              <CommandEmpty>No workspaces found</CommandEmpty>
              <CommandGroup heading="Your workspaces">
                {workspaces.map(workspace => (
                  <CommandItem
                    key={workspace.id}
                    onSelect={() => handleSelectWorkspace(workspace)}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-5 w-5">
                      {workspace.logo ? (
                        <AvatarImage
                          src={
                            typeof workspace.logo === 'string'
                              ? workspace.logo
                              : URL.createObjectURL(workspace.logo as File)
                          }
                          alt={workspace.name}
                        />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {workspace.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>{workspace.name}</span>
                    {currentWorkspace?.id === workspace.id && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                {/* Add Manage Workspace option */}
                {currentWorkspace && (
                  <CommandItem onSelect={handleManageWorkspace}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Workspace
                  </CommandItem>
                )}
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCreateDialog(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Workspace
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your projects and collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  value={newWorkspaceName}
                  onChange={e => setNewWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logo">Logo (optional)</Label>
                <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !newWorkspaceName.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
