import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, XCircle, Check, LayoutGrid } from 'lucide-react';
import { TemplatePreset } from '../types';

interface PresetSelectorProps {
  presets?: TemplatePreset[];
  onSelectPreset: (preset: TemplatePreset) => void;
  onStartFromScratch: () => void;
  onCancel: () => void;
}

export function PresetSelector({
  presets = defaultPresets,
  onSelectPreset,
  onStartFromScratch,
  onCancel,
}: PresetSelectorProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Choose a Template</h1>
          <p className="text-muted-foreground">Start with a preset or design from scratch</p>
        </div>
        <Button variant="outline" onClick={onCancel} className="flex gap-1.5 items-center">
          <XCircle className="h-4 w-4" />
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-dashed bg-muted/30"
          onClick={onStartFromScratch}
        >
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <Plus className="h-12 w-12 text-blue-300" />
          </div>
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-lg">Start from Scratch</CardTitle>
            <CardDescription>Create a custom template with a blank canvas</CardDescription>
          </CardHeader>
        </Card>

        {presets.map(preset => (
          <Card
            key={preset.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectPreset(preset)}
          >
            <div className="aspect-video bg-muted overflow-hidden relative group">
              <img
                src={preset.thumbnail}
                alt={preset.name}
                className="object-cover h-full w-full transition-all group-hover:scale-105 group-hover:opacity-90"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                <Button variant="secondary" size="sm" className="pointer-events-none">
                  <Check className="h-4 w-4 mr-1.5" />
                  Select
                </Button>
              </div>
            </div>
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-lg">{preset.name}</CardTitle>
              <CardDescription>{preset.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Default template presets
const defaultPresets: TemplatePreset[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'A friendly welcome email for new subscribers',
    thumbnail: 'https://via.placeholder.com/300x200?text=Welcome+Email',
    components: ['header', 'text', 'image', 'button', 'footer'],
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'A clean newsletter template with sections for articles',
    thumbnail: 'https://via.placeholder.com/300x200?text=Newsletter',
    components: ['header', 'text', 'columns-2', 'image', 'button', 'social', 'footer'],
  },
  {
    id: 'promotion',
    name: 'Promotional Offer',
    description: 'Highlight a special discount or promotion',
    thumbnail: 'https://via.placeholder.com/300x200?text=Promotional+Offer',
    components: ['header', 'image', 'text', 'countdown', 'button', 'footer'],
  },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Announce company news or product updates',
    thumbnail: 'https://via.placeholder.com/300x200?text=Announcement',
    components: ['header', 'text', 'image', 'button', 'footer'],
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Showcase your products with features and benefits',
    thumbnail: 'https://via.placeholder.com/300x200?text=Product+Showcase',
    components: ['header', 'image', 'text', 'feature-list', 'cta', 'testimonial', 'footer'],
  },
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    description: 'Invite users to your upcoming event',
    thumbnail: 'https://via.placeholder.com/300x200?text=Event+Invitation',
    components: ['header', 'image', 'text', 'countdown', 'button', 'footer'],
  },
];
