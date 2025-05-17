'use client';

import React, { useState, useEffect } from 'react';
import { Check, Plus, Tag as TagIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
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

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagsSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableTags?: Tag[];
  allowCreate?: boolean;
}

export function TagsSelect({
  value = [],
  onChange,
  availableTags = [],
  allowCreate = true,
}: TagsSelectProps) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [localTags, setLocalTags] = useState<Tag[]>(availableTags);

  // Update local tags when available tags change
  useEffect(() => {
    setLocalTags(availableTags);
  }, [availableTags]);

  // Get the selected tags as objects
  const selectedTags = value
    .map(id => localTags.find(tag => tag.id === id))
    .filter(Boolean) as Tag[];

  // Function to handle the creation of a new tag
  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    // Generate a unique ID (normally this would be done on the server)
    const newId = `tag-${Date.now()}`;

    // Create the new tag
    const newTag: Tag = {
      id: newId,
      name: newTagName.trim(),
      color: newTagColor,
    };

    // Add to local tags
    setLocalTags(prev => [...prev, newTag]);

    // Select the new tag
    onChange([...value, newId]);

    // Reset the form
    setNewTagName('');
    setNewTagColor('#3B82F6');
    setCreateDialogOpen(false);
  };

  // Pre-defined colors for tags
  const tagColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F97316', // Orange
    '#0EA5E9', // Sky
    '#14B8A6', // Teal
    '#6366F1', // Indigo
  ];

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full min-h-10 h-auto justify-between"
          >
            <div className="flex flex-wrap gap-1">
              {selectedTags.length > 0 ? (
                selectedTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="mr-1 mb-1"
                    style={{
                      backgroundColor: `${tag.color}10`,
                      borderColor: tag.color,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                    <Button
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={e => {
                        e.stopPropagation();
                        onChange(value.filter(id => id !== tag.id));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Select tags...</span>
              )}
            </div>
            <TagIcon className="h-4 w-4 opacity-50 shrink-0 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>
                {allowCreate ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setCreateDialogOpen(true);
                      setOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create &quot;{newTagName || 'new tag'}&quot;
                  </Button>
                ) : (
                  <p className="py-2 px-4 text-sm text-muted-foreground">No tags found.</p>
                )}
              </CommandEmpty>
              <CommandGroup heading="Available Tags">
                {localTags.map(tag => {
                  const isSelected = value.includes(tag.id);
                  return (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => {
                        onChange(
                          isSelected ? value.filter(id => id !== tag.id) : [...value, tag.id]
                        );
                      }}
                    >
                      <div
                        className="h-3 w-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                      {isSelected && <Check className="h-4 w-4 ml-auto" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {allowCreate && (
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setCreateDialogOpen(true);
                      setOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Tag
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog for creating a new tag */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>Add a new tag to categorize your contacts.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                placeholder="Enter tag name"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tag Color</Label>
              <div className="flex flex-wrap gap-2">
                {tagColors.map(color => (
                  <Button
                    key={color}
                    type="button"
                    variant="outline"
                    className={cn(
                      'h-8 w-8 rounded-full p-0',
                      newTagColor === color && 'ring-2 ring-offset-2'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Label>Preview</Label>
              <div className="flex items-center mt-2">
                <Badge
                  variant="outline"
                  className="mr-1"
                  style={{
                    backgroundColor: `${newTagColor}10`,
                    borderColor: newTagColor,
                    color: newTagColor,
                  }}
                >
                  {newTagName || 'Tag Name'}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
