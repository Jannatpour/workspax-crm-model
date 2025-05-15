import React, { useState, useMemo } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
  LayoutGrid,
  ListFilter,
  Search,
  PlusCircle,
  Filter,
  Download,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Mail,
  FileText,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmailTemplate } from '../types';

interface TemplateLibraryProps {
  category?: string;
}

export function TemplateLibrary({ category }: TemplateLibraryProps) {
  const { changeSection } = useDashboard();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState(category || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Mock templates data
  const [templates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      description: 'A template for welcoming new users',
      content: 'Welcome to our platform! We are excited to have you onboard.',
      html: '<div>Welcome template HTML</div>',
      thumbnail: 'https://via.placeholder.com/300x200?text=Welcome+Email',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-15'),
      category: 'onboarding',
      tags: ['welcome', 'onboarding', 'new user'],
      isDefault: true,
    },
    {
      id: '2',
      name: 'Monthly Newsletter',
      description: 'Monthly newsletter template',
      content: 'Here are our updates for the month.',
      html: '<div>Newsletter template HTML</div>',
      thumbnail: 'https://via.placeholder.com/300x200?text=Newsletter',
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-02-15'),
      category: 'newsletter',
      tags: ['newsletter', 'monthly', 'updates'],
      isDefault: true,
    },
    {
      id: '3',
      name: 'Promotional Offer',
      description: 'Template for special offers',
      content: 'Special offer just for you!',
      html: '<div>Promotional template HTML</div>',
      thumbnail: 'https://via.placeholder.com/300x200?text=Promo',
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2023-03-15'),
      category: 'marketing',
      tags: ['promotion', 'offer', 'discount'],
      isDefault: true,
    },
    {
      id: '4',
      name: 'Event Invitation',
      description: 'Template for event invitations',
      content: "You're invited to our special event!",
      html: '<div>Event invitation template HTML</div>',
      thumbnail: 'https://via.placeholder.com/300x200?text=Event',
      createdAt: new Date('2023-04-01'),
      updatedAt: new Date('2023-04-15'),
      category: 'events',
      tags: ['event', 'invitation', 'rsvp'],
      isDefault: true,
    },
    {
      id: '5',
      name: 'Order Confirmation',
      description: 'Email confirmation after order placement',
      content: 'Thank you for your order! Here are your order details.',
      html: '<div>Order confirmation template HTML</div>',
      thumbnail: 'https://via.placeholder.com/300x200?text=Order',
      createdAt: new Date('2023-05-01'),
      updatedAt: new Date('2023-05-15'),
      category: 'transactional',
      tags: ['order', 'confirmation', 'purchase'],
      isDefault: true,
    },
    {
      id: '6',
      name: 'Abandoned Cart',
      description: 'Reminder for items left in cart',
      content: 'You left some items in your cart. Complete your purchase now!',
      html: '<div>Abandoned cart template HTML</div>',
      thumbnail: 'https://via.placeholder.com/300x200?text=Cart',
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2023-06-15'),
      category: 'marketing',
      tags: ['cart', 'reminder', 'recovery'],
      isDefault: true,
    },
  ]);

  // Categories for filtering
  const categories = [
    'all',
    'onboarding',
    'newsletter',
    'marketing',
    'events',
    'transactional',
    'feedback',
    'custom',
  ];

  // Filtered and sorted templates
  const filteredTemplates = useMemo(() => {
    return templates
      .filter(template => {
        // Filter by search query
        const matchesSearch =
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          false;

        // Filter by tab/category
        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'recent') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return matchesSearch && new Date(template.updatedAt) > oneMonthAgo;
        }
        if (activeTab === 'default') {
          return matchesSearch && template.isDefault === true;
        }

        // Filter by category
        if (filterCategory !== 'all') {
          return matchesSearch && template.category === filterCategory;
        }

        return matchesSearch;
      })
      .sort((a, b) => {
        // Sort by name or date
        if (sortBy === 'name') {
          const comparison = a.name.localeCompare(b.name);
          return sortDirection === 'asc' ? comparison : -comparison;
        } else {
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
      });
  }, [templates, searchQuery, activeTab, filterCategory, sortBy, sortDirection]);

  // Handle editing a template
  const handleEditTemplate = (templateId: string) => {
    changeSection('templates-email', { action: 'edit', templateId });
  };

  // Handle duplicating a template
  const handleDuplicateTemplate = (template: EmailTemplate) => {
    // In a real implementation, this would create a copy in the database
    console.log(`Duplicating template: ${template.id}`);
  };

  // Handle exporting a template
  const handleExportTemplate = (template: EmailTemplate) => {
    // In a real implementation, this would generate and download the HTML file
    console.log(`Exporting template: ${template.id}`);
  };

  // Handle deleting a template
  const handleDeleteTemplate = (templateId: string) => {
    // In a real implementation, this would delete the template from the database
    console.log(`Deleting template: ${templateId}`);
  };

  // Handle creating a new template
  const handleCreateTemplate = () => {
    changeSection('templates-create');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Template Library</h1>
          <p className="text-muted-foreground">Browse and manage email templates</p>
        </div>
        <Button onClick={handleCreateTemplate} className="gap-1.5">
          <PlusCircle className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between flex-wrap">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="default">Default</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map(category => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={filterCategory === category ? 'bg-accent' : ''}
                >
                  {category === 'all'
                    ? 'All Categories'
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                  {filterCategory === category && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setSortBy('name')}
                className={sortBy === 'name' ? 'bg-accent' : ''}
              >
                Name
                {sortBy === 'name' && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('date')}
                className={sortBy === 'date' ? 'bg-accent' : ''}
              >
                Date Modified
                {sortBy === 'date' && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Ascending
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Descending
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-md">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="rounded-r-none h-9 w-9"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="rounded-l-none h-9 w-9"
                    onClick={() => setViewMode('list')}
                  >
                    <ListFilter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card className="text-center py-12">
          <div className="mx-auto flex max-w-md flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="mb-4 mt-2 text-muted-foreground">
              {searchQuery
                ? `No templates match "${searchQuery}". Try a different search.`
                : "You haven't created any templates yet. Create your first one to get started."}
            </p>
            <Button onClick={handleCreateTemplate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card
              key={template.id}
              className="overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video bg-muted overflow-hidden border-b">
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="object-cover h-full w-full transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Mail className="h-12 w-12 opacity-50" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => handleEditTemplate(template.id)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportTemplate(template)}>
                          <Download className="h-4 w-4 mr-2" />
                          Export HTML
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {template.isDefault && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
                    Default
                  </div>
                )}
              </div>

              <CardHeader className="px-4 py-3">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-xs truncate">
                  {template.description || 'No description'}
                </CardDescription>
              </CardHeader>

              <CardFooter className="px-4 py-3 border-t bg-muted/50 text-xs text-muted-foreground">
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {new Date(template.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {template.category && (
                    <div className="px-1.5 py-0.5 bg-muted rounded text-[10px] uppercase tracking-wider">
                      {template.category}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md divide-y">
          {filteredTemplates.map(template => (
            <div key={template.id} className="flex items-center p-4 hover:bg-muted/50">
              <div className="h-12 w-12 rounded bg-muted mr-4 flex items-center justify-center overflow-hidden">
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <Mail className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="font-medium">{template.name}</span>
                  {template.isDefault && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {template.description || 'No description'}
                </div>
              </div>

              {template.category && (
                <div className="hidden md:block px-2 py-1 bg-muted rounded text-xs uppercase tracking-wider mr-4">
                  {template.category}
                </div>
              )}

              <div className="text-sm text-muted-foreground mr-4 hidden sm:block">
                Updated{' '}
                {new Date(template.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportTemplate(template)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export HTML
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
