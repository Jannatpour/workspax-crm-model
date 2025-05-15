import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EnhancedScroller } from '@/shared/EnhancedScroller';
import { ComponentCategory, EmailComponent } from '@/components/templates/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, LayoutGrid, Search, Box, Layout, Type, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Default components and categories for when none are provided
const defaultComponentCategories: ComponentCategory[] = [
  { id: 'layout', name: 'Layout', icon: 'Layout' },
  { id: 'content', name: 'Content', icon: 'Type' },
  { id: 'media', name: 'Media', icon: 'Image' },
  { id: 'buttons', name: 'Buttons', icon: 'Button' },
];

const defaultComponents: EmailComponent[] = [
  {
    id: 'header-1',
    type: 'header',
    name: 'Header',
    category: 'layout',
    content: '<div>Header</div>',
    icon: 'Layout',
    description: 'Add a header to your email',
  },
  {
    id: 'text-1',
    type: 'text',
    name: 'Text Block',
    category: 'content',
    content: '<div>Text content</div>',
    icon: 'Type',
    description: 'Add text to your email',
  },
  {
    id: 'image-1',
    type: 'image',
    name: 'Image',
    category: 'media',
    content: '<div>Image</div>',
    icon: 'Image',
    description: 'Add an image to your email',
  },
];

// Default safe icons
const defaultSafeIcons: Record<string, React.FC<{ className?: string }>> = {
  Layout: Layout,
  Type: Type,
  Image: Image,
  Button: Box,
  Box: Box,
};

interface ComponentPanelProps {
  componentCategories?: ComponentCategory[];
  components?: EmailComponent[];
  onDragStart?: (component: EmailComponent) => void;
  onSelectPreset?: () => void;
  safeIcons?: Record<string, React.FC<{ className?: string }>>;
}

export function ComponentPanel({
  componentCategories = defaultComponentCategories,
  components = defaultComponents,
  onDragStart = () => {},
  onSelectPreset = () => {},
  safeIcons = defaultSafeIcons,
}: ComponentPanelProps) {
  const [activeCategory, setActiveCategory] = useState('layout');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  // Filter components by active category and search query
  const filteredComponents = components.filter(component => {
    const matchesCategory = activeCategory === 'all' || component.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (component.description &&
        component.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Get icon component from safe icons object
  const getIconComponent = (iconName: string) => {
    const IconComponent = safeIcons[iconName] || Box;
    return <IconComponent className="h-4 w-4" />;
  };

  // Category tabs to be used as sticky header
  const categoryTabs = (
    <div className="flex overflow-x-auto pb-1 mb-1 border-b">
      <Button
        variant={activeCategory === 'all' ? 'secondary' : 'ghost'}
        size="sm"
        className="flex-shrink-0 px-3"
        onClick={() => setActiveCategory('all')}
      >
        <LayoutGrid className="h-4 w-4 mr-1.5" />
        All
      </Button>

      {componentCategories.map(category => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? 'secondary' : 'ghost'}
          size="sm"
          className="flex-shrink-0 px-3"
          onClick={() => setActiveCategory(category.id)}
        >
          {getIconComponent(category.icon)}
          <span className="ml-1.5">{category.name}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Components</CardTitle>
        <CardDescription>Drag and drop components to build your template</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-4 py-3 border-t">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search components..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Template preset button */}
          <Button variant="outline" size="sm" className="w-full mb-3" onClick={onSelectPreset}>
            <LayoutGrid className="h-4 w-4 mr-1.5" />
            Template Presets
          </Button>

          <EnhancedScroller
            maxHeight="calc(100vh - 320px)"
            showControls={true}
            scrollToTopButton={true}
            stickyHeader={categoryTabs}
          >
            <div className="space-y-2 pb-2 px-1">
              {filteredComponents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-1">No components found</p>
                  <p className="text-sm">Try a different search or category</p>
                </div>
              ) : (
                filteredComponents.map(component => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={() => onDragStart(component)}
                    className={cn(
                      'group cursor-move rounded-md border p-3 hover:bg-accent/50 hover:border-primary/30 transition-all',
                      expandedInfo === component.id ? 'bg-accent border-primary/30' : ''
                    )}
                  >
                    <div className="flex items-center gap-3 relative">
                      {getIconComponent(component.icon)}
                      <span className="font-medium">{component.name}</span>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                setExpandedInfo(expandedInfo === component.id ? null : component.id)
                              }
                            >
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {component.description ||
                              `Add ${component.name.toLowerCase()} to your template`}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {expandedInfo === component.id && component.description && (
                      <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                        {component.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </EnhancedScroller>
        </div>
      </CardContent>
    </Card>
  );
}
