'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/components/ui/sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  FileText,
  PlusCircle,
  Palette,
  BookOpen,
  Star,
  Gauge,
  Calendar,
  BarChart2,
  ArrowRight,
  ChevronRight,
  Clock,
  Loader2,
  LayoutTemplate,
  Filter,
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
} from 'lucide-react';

// Import sub-components that we'll use in this component
import { TemplateEditor } from './TemplateEditor';
import { PresetSelector } from './PresetSelector';

// Types
interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  updatedAt: Date;
  usageCount?: number;
  thumbnail?: string;
}

type OverviewState = 'overview' | 'creating' | 'editing';

export function TemplatesOverview({
  isCreating = false,
  isFiltered = false,
  category = '',
}: {
  isCreating?: boolean;
  isFiltered?: boolean;
  category?: string;
}) {
  const { changeSection } = useDashboard();
  const { toast } = useToast();

  // State for the current view
  const [activeTab, setActiveTab] = useState('overview');
  const [viewState, setViewState] = useState<OverviewState>(isCreating ? 'creating' : 'overview');
  const [isSelectingPreset, setIsSelectingPreset] = useState(isCreating);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  // Effect to handle initial state
  useEffect(() => {
    if (isCreating) {
      setViewState('creating');
      setIsSelectingPreset(true);
    }
  }, [isCreating]);

  // Template statistics
  const stats = {
    total: 18,
    email: 12,
    marketing: 8,
    transactional: 4,
    onboarding: 3,
    newsletter: 3,
  };

  // Recent templates
  const recentTemplates = [
    {
      id: '1',
      name: 'Welcome Email',
      category: 'onboarding',
      updatedAt: new Date('2024-04-15'),
      thumbnail: 'https://via.placeholder.com/300x200?text=Welcome+Email',
    },
    {
      id: '2',
      name: 'Monthly Newsletter',
      category: 'newsletter',
      updatedAt: new Date('2024-04-10'),
      thumbnail: 'https://via.placeholder.com/300x200?text=Newsletter',
    },
    {
      id: '3',
      name: 'Promotional Offer',
      category: 'marketing',
      updatedAt: new Date('2024-04-05'),
      thumbnail: 'https://via.placeholder.com/300x200?text=Promo',
    },
  ];

  // Popular templates
  const popularTemplates = [
    {
      id: '4',
      name: 'Order Confirmation',
      category: 'transactional',
      usageCount: 156,
      thumbnail: 'https://via.placeholder.com/300x200?text=Order',
    },
    {
      id: '5',
      name: 'Abandoned Cart',
      category: 'marketing',
      usageCount: 132,
      thumbnail: 'https://via.placeholder.com/300x200?text=Cart',
    },
    {
      id: '6',
      name: 'Event Invitation',
      category: 'events',
      usageCount: 98,
      thumbnail: 'https://via.placeholder.com/300x200?text=Event',
    },
  ];

  // Template categories
  const categories = [
    { id: 'marketing', name: 'Marketing', count: 8, color: '#FF5733' },
    { id: 'onboarding', name: 'Onboarding', count: 5, color: '#33A1FF' },
    { id: 'newsletter', name: 'Newsletters', count: 12, color: '#33FF57' },
    { id: 'transactional', name: 'Transactional', count: 7, color: '#C133FF' },
    { id: 'event', name: 'Event', count: 4, color: '#FFD133' },
  ];

  // Handle creating a new template
  const handleCreateTemplate = useCallback(() => {
    setViewState('creating');
    setIsSelectingPreset(true);
  }, []);

  // Handle selecting preset for new template
  const handleSelectPreset = useCallback(
    (preset: any) => {
      setIsSelectingPreset(false);

      // Show notification
      toast({
        title: 'Template preset selected',
        description: `You selected the ${preset.name} preset`,
      });
    },
    [toast]
  );

  // Handle starting from scratch
  const handleStartFromScratch = useCallback(() => {
    setIsSelectingPreset(false);
  }, []);

  // Handle canceling template creation
  const handleCancelCreate = useCallback(() => {
    setViewState('overview');
    setSelectedTemplate(null);
  }, []);

  // Handle editing an existing template
  const handleEditTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setViewState('editing');
  }, []);

  // Handle template save event from editor
  const handleTemplateSaved = useCallback(() => {
    setTemplateSaved(true);

    // Show success notification
    toast({
      title: 'Template saved',
      description: 'Your template has been saved successfully',
      variant: 'default',
    });

    // Reset back to overview after delay
    setTimeout(() => {
      setViewState('overview');
      setTemplateSaved(false);
      setSelectedTemplate(null);
    }, 1500);
  }, [toast]);

  // Handle preset selection cancel
  const handleCancelPreset = useCallback(() => {
    setViewState('overview');
    setIsSelectingPreset(false);
  }, []);

  // If we're in the template editor view, render the editor
  if (viewState === 'creating') {
    // If selecting preset, show preset selector
    if (isSelectingPreset) {
      return (
        <PresetSelector
          onSelectPreset={handleSelectPreset}
          onStartFromScratch={handleStartFromScratch}
          onCancel={handleCancelPreset}
        />
      );
    }

    // Otherwise show template editor for creating a new template
    return <TemplateEditor onSave={handleTemplateSaved} onCancel={handleCancelCreate} />;
  } else if (viewState === 'editing' && selectedTemplate) {
    // Show template editor for editing an existing template
    return (
      <TemplateEditor
        templateId={selectedTemplate.id}
        currentTemplate={selectedTemplate}
        onSave={handleTemplateSaved}
        onCancel={handleCancelCreate}
      />
    );
  }

  // Effect to handle filtered view
  useEffect(() => {
    if (isFiltered && category) {
      // Set active tab based on category
      setActiveTab('recent');

      // Filter templates based on category
      // In a real app, this would filter from an API or state
      console.log(`Filtering templates by category: ${category}`);
    }
  }, [isFiltered, category]);

  // Main templates overview UI
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isFiltered && category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Templates`
              : 'Templates'}
          </h1>
          <p className="text-muted-foreground">
            {isFiltered
              ? `Browse and manage your ${category} templates`
              : 'Create and manage your reusable templates'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Filter templates"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Search templates"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Customize view"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleCreateTemplate}
            className="gap-1.5"
            data-testid="create-template-button"
          >
            <PlusCircle className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
              <CardHeader className="pb-2">
                <CardDescription>Total Templates</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-4 px-6">
                <div className="text-muted-foreground text-xs">+3 templates this month</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-gray-900">
              <CardHeader className="pb-2">
                <CardDescription>Email Templates</CardDescription>
                <CardTitle className="text-3xl">{stats.email}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-4 px-6">
                <div className="text-muted-foreground text-xs">
                  {Math.round((stats.email / stats.total) * 100)}% of total
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-900">
              <CardHeader className="pb-2">
                <CardDescription>Marketing Templates</CardDescription>
                <CardTitle className="text-3xl">{stats.marketing}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-4 px-6">
                <div className="text-muted-foreground text-xs">Most used category</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-gray-900">
              <CardHeader className="pb-2">
                <CardDescription>Usage This Month</CardDescription>
                <CardTitle className="text-3xl">342</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-4 px-6">
                <div className="text-muted-foreground text-xs">+18% from last month</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Links */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Create and manage your templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="default"
                  className="w-full justify-between"
                  onClick={handleCreateTemplate}
                >
                  <div className="flex items-center">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Template
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => changeSection('templates-library')}
                >
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Template Library
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => changeSection('templates-categories')}
                >
                  <div className="flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Manage Categories
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => changeSection('templates-email')}
                >
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Templates
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Categories
                  </CardTitle>
                  <CardDescription>Templates organized by category</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changeSection('templates-categories')}
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant="outline"
                      className="h-auto py-3 px-4 justify-start hover:shadow-md transition-all"
                      onClick={() => {
                        changeSection('templates-library');
                        // In a real implementation, we would pass the category filter
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.count} template{category.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <Badge className="ml-2 bg-secondary text-secondary-foreground">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent & Popular Templates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Templates */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Templates
                  </CardTitle>
                  <CardDescription>Recently updated templates</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('recent')}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-72">
                  <div className="p-4 space-y-3">
                    {recentTemplates.map(template => (
                      <div
                        key={template.id}
                        className="flex items-center gap-4 border rounded-md p-3 hover:bg-accent transition-colors cursor-pointer hover:shadow-md group"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <div className="w-16 h-12 bg-muted rounded overflow-hidden">
                          {template.thumbnail ? (
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Mail className="w-6 h-6 m-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{template.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <div className="px-1.5 py-0.5 bg-muted rounded mr-2 uppercase">
                              {template.category}
                            </div>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{template.updatedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => {
                            e.stopPropagation();
                            handleEditTemplate(template);
                          }}
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Popular Templates */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Popular Templates
                  </CardTitle>
                  <CardDescription>Most frequently used templates</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('popular')}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-72">
                  <div className="p-4 space-y-3">
                    {popularTemplates.map(template => (
                      <div
                        key={template.id}
                        className="flex items-center gap-4 border rounded-md p-3 hover:bg-accent transition-colors cursor-pointer hover:shadow-md group"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <div className="w-16 h-12 bg-muted rounded overflow-hidden">
                          {template.thumbnail ? (
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Mail className="w-6 h-6 m-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{template.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <div className="px-1.5 py-0.5 bg-muted rounded mr-2 uppercase">
                              {template.category}
                            </div>
                            <Star className="h-3 w-3 mr-1 text-amber-500" />
                            <span>{template.usageCount} uses</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => {
                            e.stopPropagation();
                            handleEditTemplate(template);
                          }}
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Templates
              </CardTitle>
              <CardDescription>Your most recently updated templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...recentTemplates, ...recentTemplates].map((template, index) => (
                  <div
                    key={`${template.id}-${index}`}
                    className="border rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <div className="aspect-video bg-muted relative">
                      {template.thumbnail ? (
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Mail className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Edit Template
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <div className="px-1.5 py-0.5 bg-muted rounded uppercase">
                          {template.category}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {template.updatedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button variant="outline" onClick={() => changeSection('templates-library')}>
                View All Templates
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Popular Templates
              </CardTitle>
              <CardDescription>Your most frequently used templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...popularTemplates, ...popularTemplates].map((template, index) => (
                  <div
                    key={`${template.id}-${index}`}
                    className="border rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <div className="aspect-video bg-muted relative">
                      {template.thumbnail ? (
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Mail className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" />
                      )}
                      <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs">
                        Popular
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Edit Template
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <div className="px-1.5 py-0.5 bg-muted rounded uppercase">
                          {template.category}
                        </div>
                        <div className="flex items-center">
                          <Gauge className="h-3 w-3 mr-1" />
                          {template.usageCount} uses
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button variant="outline" onClick={() => changeSection('templates-library')}>
                View All Templates
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Default export
export default TemplatesOverview;
