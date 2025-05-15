'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { useToast } from '@/components/ui/sonner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Icons
import {
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Undo,
  Redo,
  Laptop,
  Tablet,
  Smartphone,
  LayoutGrid,
  Loader2,
  CheckCircle2,
  XCircle,
  PanelLeft,
  PanelRight,
  Sparkles,
  PencilRuler,
  TextCursorInput,
  Lightbulb,
  MessageSquareText,
  MousePointer,
  Move,
  CornerBottomRight,
  ArrowUpDown,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Image,
  PlusCircle,
  RotateCcw,
  CheckCheck,
  Wand2,
  Menu,
  Sun,
  RefreshCw,
  Palette,
  Layers,
} from 'lucide-react';

// Import sub-components
import { ComponentPanel } from './ComponentPanel';
import { EditorCanvas } from './EditorCanvas';
import { PropertyEditor } from './PropertyEditor';
import { PreviewPanel } from './PreviewPanel';
import { PresetSelector } from './PresetSelector';
import { AISuggestionsPanel } from './AISuggestionsPanel';

// Define types
interface EmailComponent {
  id: string;
  type: string;
  name: string;
  category: string;
  content: string;
  icon?: string;
  preview?: string;
  description?: string;
  styles?: {
    width?: string;
    height?: string;
    backgroundColor?: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    [key: string]: string | undefined;
  };
}

interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  html?: string;
  components?: EmailComponent[];
  thumbnail?: string;
  category?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface AISuggestion {
  id: string;
  type: 'design' | 'content' | 'structure';
  title: string;
  description: string;
  preview?: string;
  changes: any; // Changes to apply if suggestion is accepted
}

interface TemplateEditorProps {
  templateId?: string;
  currentTemplate?: Template | null;
  presetId?: string;
}

export function TemplateEditor({ templateId, currentTemplate, presetId }: TemplateEditorProps) {
  const { changeSection } = useDashboard();
  const { toast } = useToast();
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // State for template and editing
  const [template, setTemplate] = useState<Template | null>(currentTemplate || null);
  const [templateName, setTemplateName] = useState<string>(currentTemplate?.name || 'New Template');
  const [templateDescription, setTemplateDescription] = useState<string>(
    currentTemplate?.description || ''
  );
  const [templateCategory, setTemplateCategory] = useState<string>(
    currentTemplate?.category || 'custom'
  );
  const [editorContent, setEditorContent] = useState<EmailComponent[]>(
    currentTemplate?.components || []
  );

  // UI state
  const [loading, setLoading] = useState<boolean>(!!templateId);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [isSelectingPreset, setIsSelectingPreset] = useState(!!presetId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'ai'>('properties');
  const [editMode, setEditMode] = useState<'select' | 'resize' | 'text'>('select');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTextEditor, setActiveTextEditor] = useState<{
    componentIndex: number;
    element: HTMLElement | null;
  } | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [resizingComponent, setResizingComponent] = useState<{
    componentIndex: number;
    handle: 'right' | 'bottom' | 'corner';
  } | null>(null);

  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestionFocus, setAiSuggestionFocus] = useState<string | null>(null);

  // History for undo/redo
  const [historySteps, setHistorySteps] = useState<EmailComponent[][]>([[]]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  // Load template data if templateId is provided
  useEffect(() => {
    if (templateId && !currentTemplate) {
      setLoading(true);
      // This would be replaced with an actual API call
      setTimeout(() => {
        // Mock template data
        const mockTemplate = {
          id: templateId,
          name: `Template ${templateId}`,
          description: 'Template description',
          content: '',
          components: getSampleComponents(),
          category: 'custom',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setTemplate(mockTemplate);
        setTemplateName(mockTemplate.name);
        setTemplateDescription(mockTemplate.description);
        setTemplateCategory(mockTemplate.category || 'custom');
        setEditorContent(mockTemplate.components || []);
        setHistorySteps([[...(mockTemplate.components || [])]]);
        setLoading(false);

        // Generate AI suggestions after loading
        generateAISuggestions(mockTemplate.components || []);
      }, 500);
    }

    // If presetId is provided, we should load a template preset
    if (presetId) {
      setIsSelectingPreset(false);
      // Load preset components based on presetId
      const presetComponents = getSampleComponents();

      setTemplateCategory(presetId === 'welcome' ? 'onboarding' : 'marketing');
      setTemplateName(presetId === 'welcome' ? 'Welcome Email' : 'New Template');
      setEditorContent(presetComponents);
      setHistorySteps([presetComponents]);

      // Generate AI suggestions
      generateAISuggestions(presetComponents);
    }
  }, [templateId, currentTemplate, presetId]);

  // Function to get sample components for demo
  const getSampleComponents = (): EmailComponent[] => {
    return [
      {
        id: `header-${Date.now()}`,
        type: 'header',
        name: 'Header',
        category: 'content',
        content: `<div style="padding: 20px; text-align: center; background-color: #f8f9fa;"><h1 style="color: #333333; margin: 0; font-family: Arial, sans-serif; font-size: 28px;">Welcome to Our Newsletter</h1></div>`,
        styles: {
          backgroundColor: '#f8f9fa',
          textAlign: 'center',
          padding: '20px',
        },
      },
      {
        id: `text-${Date.now()}`,
        type: 'text',
        name: 'Text Block',
        category: 'content',
        content: `<div style="padding: 15px;"><p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">Thank you for subscribing to our newsletter. We're excited to share the latest updates and news with you. Stay tuned for exclusive content and special offers.</p></div>`,
        styles: {
          padding: '15px',
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#333333',
        },
      },
      {
        id: `image-${Date.now()}`,
        type: 'image',
        name: 'Image',
        category: 'media',
        content: `<div style="padding: 15px; text-align: center;"><img src="https://via.placeholder.com/600x200" alt="Banner Image" style="max-width: 100%;"></div>`,
        styles: {
          padding: '15px',
          textAlign: 'center',
        },
      },
      {
        id: `button-${Date.now()}`,
        type: 'button',
        name: 'Button',
        category: 'buttons',
        content: `<div style="padding: 15px; text-align: center;"><a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px; display: inline-block;">Get Started</a></div>`,
        styles: {
          padding: '15px',
          textAlign: 'center',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '4px',
        },
      },
    ];
  };

  // Generate AI suggestions based on current template content
  const generateAISuggestions = useCallback(
    (components: EmailComponent[]) => {
      setIsGeneratingAI(true);

      // Simulate AI processing delay
      setTimeout(() => {
        // Generate mock AI suggestions
        const mockSuggestions: AISuggestion[] = [
          {
            id: 'suggestion-1',
            type: 'design',
            title: 'Enhance visual hierarchy',
            description:
              'Adjust color contrast and spacing to improve readability and focus attention on key elements.',
            preview: 'https://via.placeholder.com/300x200?text=Enhanced+Design',
            changes: {
              type: 'style',
              components: [
                { index: 0, styles: { backgroundColor: '#f0f7ff', padding: '25px' } },
                { index: 3, styles: { backgroundColor: '#0066cc' } },
              ],
            },
          },
          {
            id: 'suggestion-2',
            type: 'content',
            title: 'Improve welcome message',
            description: 'Make your welcome message more engaging with personalized language.',
            changes: {
              type: 'content',
              components: [
                {
                  index: 1,
                  content: `<div style="padding: 15px;"><p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">We're thrilled to have you join our community! As a valued subscriber, you'll be the first to receive our latest updates, exclusive content, and special offers tailored just for you. We can't wait to share exciting news and helpful resources in the coming weeks.</p></div>`,
                },
              ],
            },
          },
          {
            id: 'suggestion-3',
            type: 'structure',
            title: 'Add social proof section',
            description:
              'Include testimonials or social media links to build trust with new subscribers.',
            preview: 'https://via.placeholder.com/300x200?text=Social+Proof',
            changes: {
              type: 'add',
              component: {
                type: 'testimonial',
                name: 'Testimonial',
                category: 'content',
                content: `<div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin: 15px;"><p style="font-style: italic; color: #555; font-size: 16px;">"This newsletter has been incredibly valuable for me. The content is always relevant and actionable!"</p><p style="font-weight: bold; margin-bottom: 0;">Sarah Johnson</p><p style="font-size: 14px; color: #777; margin-top: 5px;">Marketing Director</p></div>`,
                styles: {
                  backgroundColor: '#f9f9f9',
                  padding: '20px',
                  borderRadius: '5px',
                  margin: '15px',
                },
              },
              position: 3,
            },
          },
        ];

        setAiSuggestions(mockSuggestions);
        setIsGeneratingAI(false);

        // Show a toast notification about new suggestions
        toast({
          title: 'AI suggestions ready',
          description: `${mockSuggestions.length} suggestions available to improve your template`,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRightPanelTab('ai');
                setShowAISuggestions(true);
              }}
            >
              View
            </Button>
          ),
        });
      }, 2000);
    },
    [toast]
  );

  // Apply an AI suggestion
  const applyAISuggestion = (suggestion: AISuggestion) => {
    try {
      const newContent = [...editorContent];

      if (suggestion.changes.type === 'style') {
        // Apply style changes
        suggestion.changes.components.forEach((change: any) => {
          if (newContent[change.index]) {
            newContent[change.index] = {
              ...newContent[change.index],
              styles: {
                ...newContent[change.index].styles,
                ...change.styles,
              },
            };

            // Update the content HTML with new styles
            let content = newContent[change.index].content;
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const element = doc.body.firstChild as HTMLElement;

            if (element) {
              Object.entries(change.styles).forEach(([prop, value]) => {
                element.style[prop as any] = value as string;
              });

              newContent[change.index].content = element.outerHTML;
            }
          }
        });
      } else if (suggestion.changes.type === 'content') {
        // Apply content changes
        suggestion.changes.components.forEach((change: any) => {
          if (newContent[change.index]) {
            newContent[change.index] = {
              ...newContent[change.index],
              content: change.content,
            };
          }
        });
      } else if (suggestion.changes.type === 'add') {
        // Add new component
        const newComponent: EmailComponent = {
          id: `${suggestion.changes.component.type}-${Date.now()}`,
          ...suggestion.changes.component,
        };

        newContent.splice(suggestion.changes.position, 0, newComponent);
      }

      setEditorContent(newContent);
      addToHistory(newContent);

      // Show success toast
      toast({
        title: 'Suggestion applied',
        description: suggestion.title,
        variant: 'default',
      });

      // Remove this suggestion from the list
      setAiSuggestions(aiSuggestions.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error('Error applying AI suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply suggestion',
        variant: 'destructive',
      });
    }
  };

  // Add to history - helper function with proper type
  const addToHistory = useCallback(
    (content: EmailComponent[]) => {
      setHistorySteps(prev => {
        // If we're in the middle of the history stack, truncate the future states
        const newHistory = prev.slice(0, currentHistoryIndex + 1);
        // Add new state to history - deep clone to avoid reference issues
        return [...newHistory, JSON.parse(JSON.stringify(content))];
      });
      setCurrentHistoryIndex(prev => prev + 1);
    },
    [currentHistoryIndex]
  );

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setEditorContent(JSON.parse(JSON.stringify(historySteps[newIndex])));
      toast({
        title: 'Undo',
        description: 'Previous action undone',
        duration: 1500,
      });
    }
  }, [currentHistoryIndex, historySteps, toast]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < historySteps.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setEditorContent(JSON.parse(JSON.stringify(historySteps[newIndex])));
      toast({
        title: 'Redo',
        description: 'Action redone',
        duration: 1500,
      });
    }
  }, [currentHistoryIndex, historySteps, toast]);

  // Handle component selection
  const handleElementSelect = useCallback(
    (index: number | null) => {
      if (activeTextEditor) {
        // If we're editing text, commit the changes before selecting a new component
        finishTextEditing();
      }

      setSelectedComponent(index);
      setResizingComponent(null);
    },
    [activeTextEditor]
  );

  // Start in-place text editing for a component
  const startTextEditing = useCallback(
    (componentIndex: number, element: HTMLElement) => {
      if (editMode !== 'text') return;

      setActiveTextEditor({
        componentIndex,
        element,
      });

      // Make the element editable
      element.contentEditable = 'true';
      element.focus();

      // Select all text to make editing easier
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection?.removeAllRanges();
      selection?.addRange(range);
    },
    [editMode]
  );

  // Finish text editing and save changes
  const finishTextEditing = useCallback(() => {
    if (!activeTextEditor) return;

    const { componentIndex, element } = activeTextEditor;

    if (element) {
      // Make the element non-editable
      element.contentEditable = 'false';

      // Get the updated HTML content
      const newContent = element.outerHTML;

      // Update the component content
      const updatedComponents = [...editorContent];
      updatedComponents[componentIndex] = {
        ...updatedComponents[componentIndex],
        content: newContent,
      };

      setEditorContent(updatedComponents);
      addToHistory(updatedComponents);

      toast({
        title: 'Text updated',
        description: 'Content changes saved',
        duration: 1500,
      });
    }

    setActiveTextEditor(null);
  }, [activeTextEditor, editorContent, addToHistory, toast]);

  // Start resizing a component
  const startResizing = useCallback(
    (componentIndex: number, handle: 'right' | 'bottom' | 'corner') => {
      if (editMode !== 'resize') return;

      setResizingComponent({
        componentIndex,
        handle,
      });
    },
    [editMode]
  );

  // Handle component resizing
  const handleResize = useCallback(
    (componentIndex: number, width?: string, height?: string) => {
      const updatedComponents = [...editorContent];
      const component = updatedComponents[componentIndex];

      // Update component styles
      updatedComponents[componentIndex] = {
        ...component,
        styles: {
          ...component.styles,
          ...(width && { width }),
          ...(height && { height }),
        },
      };

      // Also update the HTML content with new dimensions
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(component.content, 'text/html');
        const element = doc.body.firstChild as HTMLElement;

        if (element) {
          if (width) element.style.width = width;
          if (height) element.style.height = height;

          updatedComponents[componentIndex].content = element.outerHTML;
        }
      } catch (error) {
        console.error('Error updating component HTML:', error);
      }

      setEditorContent(updatedComponents);
    },
    [editorContent]
  );

  // Finish resizing and save changes
  const finishResizing = useCallback(() => {
    if (!resizingComponent) return;

    // Add the current state to history
    addToHistory(editorContent);
    setResizingComponent(null);

    toast({
      title: 'Component resized',
      description: 'New dimensions have been applied',
      duration: 1500,
    });
  }, [resizingComponent, editorContent, addToHistory, toast]);

  // Handle property changes
  const handlePropertyChange = useCallback(
    (componentIndex: number, propertyName: string, value: any) => {
      if (componentIndex === null) return;

      try {
        const updatedComponents = [...editorContent];
        const component = updatedComponents[componentIndex];

        // Update component styles
        updatedComponents[componentIndex] = {
          ...component,
          styles: {
            ...component.styles,
            [propertyName]: value,
          },
        };

        // Also update the HTML content with new style
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(component.content, 'text/html');
          const element = doc.body.firstChild as HTMLElement;

          if (element) {
            element.style[propertyName as any] = value;
            updatedComponents[componentIndex].content = element.outerHTML;
          }
        } catch (error) {
          console.error('Error updating component HTML:', error);
        }

        setEditorContent(updatedComponents);
        addToHistory(updatedComponents);

        toast({
          title: 'Property updated',
          description: `${propertyName} changed successfully`,
          duration: 1500,
        });
      } catch (error) {
        console.error('Error updating property:', error);
        toast({
          title: 'Error',
          description: 'Failed to update property',
          variant: 'destructive',
        });
      }
    },
    [editorContent, addToHistory, toast]
  );

  // Add new component to template
  const handleAddComponent = useCallback(
    (component: EmailComponent, position?: number) => {
      const newComponent = {
        ...component,
        id: `${component.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };

      const newContent = [...editorContent];

      if (typeof position === 'number') {
        newContent.splice(position, 0, newComponent);
      } else {
        newContent.push(newComponent);
      }

      setEditorContent(newContent);
      addToHistory(newContent);

      toast({
        title: 'Component added',
        description: `${component.name} added to template`,
        duration: 1500,
      });
    },
    [editorContent, addToHistory, toast]
  );

  // Handle removing a component
  const handleRemoveComponent = useCallback(
    (index: number) => {
      try {
        const componentName = editorContent[index]?.name || 'Component';
        const newContent = [...editorContent];
        newContent.splice(index, 1);
        setEditorContent(newContent);
        addToHistory(newContent);

        if (selectedComponent === index) {
          setSelectedComponent(null);
        } else if (selectedComponent !== null && selectedComponent > index) {
          setSelectedComponent(selectedComponent - 1);
        }

        toast({
          title: 'Component removed',
          description: `${componentName} has been removed`,
          duration: 1500,
        });
      } catch (error) {
        console.error('Error removing component:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove component',
          variant: 'destructive',
        });
      }
    },
    [editorContent, selectedComponent, addToHistory, toast]
  );

  // Handle duplicating a component
  const handleDuplicateComponent = useCallback(
    (index: number) => {
      try {
        const componentToDuplicate = editorContent[index];
        if (!componentToDuplicate) return;

        const duplicatedComponent = {
          ...componentToDuplicate,
          id: `${componentToDuplicate.id}-copy-${Date.now()}`,
        };

        const newContent = [...editorContent];
        newContent.splice(index + 1, 0, duplicatedComponent);
        setEditorContent(newContent);
        addToHistory(newContent);

        toast({
          title: 'Component duplicated',
          description: `${componentToDuplicate.name} has been duplicated`,
          duration: 1500,
        });
      } catch (error) {
        console.error('Error duplicating component:', error);
        toast({
          title: 'Error',
          description: 'Failed to duplicate component',
          variant: 'destructive',
        });
      }
    },
    [editorContent, addToHistory, toast]
  );

  // Handle moving a component
  const handleMoveComponent = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      try {
        const newContent = [...editorContent];
        const [movedComponent] = newContent.splice(fromIndex, 1);
        newContent.splice(toIndex, 0, movedComponent);

        setEditorContent(newContent);
        addToHistory(newContent);

        if (selectedComponent === fromIndex) {
          setSelectedComponent(toIndex);
        }

        toast({
          title: 'Component moved',
          description: `${movedComponent.name} has been moved`,
          duration: 1500,
        });
      } catch (error) {
        console.error('Error moving component:', error);
        toast({
          title: 'Error',
          description: 'Failed to move component',
          variant: 'destructive',
        });
      }
    },
    [editorContent, selectedComponent, addToHistory, toast]
  );

  // Handle saving template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: 'Template name required',
        description: 'Please provide a name for your template.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Generate HTML from components
      const html = generateHTML(editorContent);

      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you would send data to your API
      const savedTemplate = {
        id: template?.id || `template-${Date.now()}`,
        name: templateName,
        description: templateDescription,
        content: editorContent.map(c => c.content).join(''),
        html,
        components: editorContent,
        category: templateCategory,
        createdAt: template?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      setTemplate(savedTemplate);
      setIsSaving(false);
      setShowSuccessMessage(true);

      toast({
        title: 'Template saved',
        description: 'Your template has been saved successfully.',
      });

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving template:', error);
      setIsSaving(false);
      setShowErrorMessage(true);

      toast({
        title: 'Save failed',
        description: 'There was a problem saving your template.',
        variant: 'destructive',
      });

      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
    }
  };

  // Generate HTML from components
  const generateHTML = (components: EmailComponent[]) => {
    // This is a simplified version - in a real implementation,
    // you would generate proper HTML with all styles and structure
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${templateName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        @media only screen and (max-width: 480px) {
          .container { width: 100% !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${components.map(c => c.content).join('')}
      </div>
    </body>
    </html>
    `;
  };

  // Handle selecting a preset
  const handleSelectPreset = (preset: any) => {
    setIsSelectingPreset(false);
    // In a real implementation, you would load preset components
    toast({
      title: 'Preset selected',
      description: `${preset.name} preset loaded`,
    });
  };

  // Regenerate AI suggestions
  const refreshAISuggestions = () => {
    setIsGeneratingAI(true);
    setAiSuggestions([]);

    // Generate new suggestions
    setTimeout(() => {
      generateAISuggestions(editorContent);
    }, 500);
  };

  // If still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading template...</p>
      </div>
    );
  }

  // If selecting a preset
  if (isSelectingPreset) {
    return (
      <PresetSelector
        onSelectPreset={handleSelectPreset}
        onStartFromScratch={() => setIsSelectingPreset(false)}
        onCancel={() => changeSection('templates')}
      />
    );
  }

  // Mobile menu for small screens
  const renderMobileMenu = () => (
    <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <DrawerContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Template Editor</h3>

          <div className="space-y-2">
            <Label htmlFor="mobile-template-name">Template Name</Label>
            <Input
              id="mobile-template-name"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="e.g., Welcome Email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile-template-category">Category</Label>
            <Select value={templateCategory} onValueChange={setTemplateCategory}>
              <SelectTrigger id="mobile-template-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {['custom', 'onboarding', 'newsletter', 'marketing', 'transactional'].map(
                  category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Edit Mode</Label>
            <ToggleGroup
              type="single"
              value={editMode}
              onValueChange={value => setEditMode(value as any)}
            >
              <ToggleGroupItem value="select" aria-label="Select mode">
                <MousePointer className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="resize" aria-label="Resize mode">
                <PencilRuler className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="text" aria-label="Text edit mode">
                <TextCursorInput className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>

            <Button variant="outline" onClick={() => changeSection('templates')}>
              Cancel
            </Button>

            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={currentHistoryIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRedo}
              disabled={currentHistoryIndex >= historySteps.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => setIsSelectingPreset(true)}>
              <LayoutGrid className="h-4 w-4" />
            </Button>

            <Button
              variant={showAISuggestions ? 'secondary' : 'outline'}
              size="icon"
              onClick={() => {
                setRightPanelTab('ai');
                setShowAISuggestions(!showAISuggestions);
              }}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );

  // Main editor view
  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeSection('templates')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-2xl md:text-3xl font-bold">
              {template ? `Editing: ${template.name}` : 'Create Template'}
            </h1>
            <p className="text-muted-foreground">
              {template
                ? 'Modify your email template'
                : 'Design a new email template with drag-and-drop components'}
            </p>
          </div>
          <div className="md:hidden">
            <h1 className="text-xl font-bold">
              {template ? `Editing: ${template.name}` : 'Create Template'}
            </h1>
          </div>
        </div>

        {/* Top toolbar - Hidden on mobile */}
        <div className="hidden md:flex gap-2 flex-wrap justify-end">
          {/* Edit mode selector */}
          <div className="border rounded-md">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editMode === 'select' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setEditMode('select')}
                    className="h-9 w-9 rounded-r-none"
                  >
                    <MousePointer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Select Mode</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editMode === 'resize' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setEditMode('resize')}
                    className="h-9 w-9 rounded-l-none rounded-r-none"
                  >
                    <PencilRuler className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Resize Mode</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editMode === 'text' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setEditMode('text')}
                    className="h-9 w-9 rounded-l-none"
                  >
                    <TextCursorInput className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Text Edit Mode</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Preview toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPreview(!showPreview)}
                  className="relative"
                  aria-label={showPreview ? 'Hide preview' : 'Show preview'}
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showPreview ? 'Hide preview' : 'Show preview'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Undo/Redo */}
          <div className="flex items-center border rounded-md">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUndo}
                    disabled={currentHistoryIndex <= 0}
                    className="h-9 w-9 rounded-r-none"
                    aria-label="Undo"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRedo}
                    disabled={currentHistoryIndex >= historySteps.length - 1}
                    className="h-9 w-9 rounded-l-none"
                    aria-label="Redo"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* AI suggestions button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showAISuggestions ? 'secondary' : 'outline'}
                  size="icon"
                  onClick={() => {
                    setRightPanelTab('ai');
                    setShowAISuggestions(!showAISuggestions);
                  }}
                  className="relative"
                >
                  <Sparkles className="h-4 w-4" />
                  {aiSuggestions.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {aiSuggestions.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI Suggestions</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Device preview selector (only visible when preview is active) */}
          {showPreview && (
            <div className="flex items-center border rounded-md">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setPreviewMode('desktop')}
                      className="h-9 w-9 rounded-r-none"
                    >
                      <Laptop className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desktop</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setPreviewMode('tablet')}
                      className="h-9 w-9 rounded-l-none rounded-r-none"
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tablet</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setPreviewMode('mobile')}
                      className="h-9 w-9 rounded-l-none"
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mobile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Template presets button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSelectingPreset(true)}
                  className="h-9 w-9"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Template presets</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Sidebar collapse */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-9 w-9"
                >
                  {sidebarCollapsed ? (
                    <PanelLeft className="h-4 w-4" />
                  ) : (
                    <PanelRight className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Save actions */}
          <Button variant="outline" onClick={() => changeSection('templates')} className="ml-2">
            Cancel
          </Button>

          <Button
            onClick={handleSaveTemplate}
            disabled={isSaving || showSuccessMessage || showErrorMessage}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : showSuccessMessage ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : showErrorMessage ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Error!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main editor grid */}
      {showPreview ? (
        <PreviewPanel
          editorContent={editorContent}
          previewMode={previewMode}
          previewIframeRef={previewIframeRef}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Left sidebar: Components and template details */}
          {!sidebarCollapsed && (
            <div className="md:col-span-3 space-y-4 hidden md:block">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={templateName}
                      onChange={e => setTemplateName(e.target.value)}
                      placeholder="e.g., Welcome Email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      value={templateDescription}
                      onChange={e => setTemplateDescription(e.target.value)}
                      placeholder="e.g., For new customer onboarding"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Category</Label>
                    <Select value={templateCategory} onValueChange={setTemplateCategory}>
                      <SelectTrigger id="template-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {['custom', 'onboarding', 'newsletter', 'marketing', 'transactional'].map(
                          category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Components panel */}
              <ComponentPanel
                onDragStart={() => {}}
                onSelectPreset={() => setIsSelectingPreset(true)}
              />
            </div>
          )}

          {/* Middle: Email editor canvas */}
          <div
            className={cn(
              'md:col-span-9',
              sidebarCollapsed && 'md:col-span-12',
              !showAISuggestions && 'lg:col-span-9',
              sidebarCollapsed && !showAISuggestions && 'lg:col-span-10',
              showAISuggestions && 'lg:col-span-6',
              sidebarCollapsed && showAISuggestions && 'lg:col-span-8'
            )}
          >
            <Card className="overflow-hidden h-full">
              <CardHeader className="pb-3 flex flex-row justify-between items-center">
                <CardTitle className="text-lg">Email Designer</CardTitle>

                {/* Mobile editor controls */}
                <div className="flex items-center gap-2 md:hidden">
                  <ToggleGroup
                    type="single"
                    value={editMode}
                    onValueChange={value => setEditMode(value as any)}
                  >
                    <ToggleGroupItem value="select" aria-label="Select mode">
                      <MousePointer className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="resize" aria-label="Resize mode">
                      <PencilRuler className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="text" aria-label="Text edit mode">
                      <TextCursorInput className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Text formatting toolbar - Visible when in text editing mode and something is selected */}
                {editMode === 'text' && selectedComponent !== null && (
                  <div className="border-b p-1 flex items-center gap-1 flex-wrap bg-muted/50">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1"></div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1"></div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Image className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1 hidden sm:block"></div>
                    <Select defaultValue="16px">
                      <SelectTrigger className="h-8 w-[70px] text-xs hidden sm:flex">
                        <SelectValue placeholder="16px" />
                      </SelectTrigger>
                      <SelectContent>
                        {['12px', '14px', '16px', '18px', '20px', '24px', '30px'].map(size => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select defaultValue="Arial">
                      <SelectTrigger className="h-8 w-[100px] text-xs hidden md:flex">
                        <SelectValue placeholder="Arial" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New'].map(
                          font => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hidden sm:flex">
                          <Palette className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40">
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            '#000000',
                            '#ff0000',
                            '#00ff00',
                            '#0000ff',
                            '#ffff00',
                            '#ff00ff',
                            '#00ffff',
                            '#ffffff',
                            '#888888',
                            '#f1f1f1',
                          ].map(color => (
                            <div
                              key={color}
                              className="w-6 h-6 rounded cursor-pointer border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div className="ml-auto">
                      <Button size="sm" className="h-8" onClick={() => finishTextEditing()}>
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                    </div>
                  </div>
                )}

                <EditorCanvas
                  components={editorContent}
                  selectedComponent={selectedComponent}
                  editMode={editMode}
                  resizingComponent={resizingComponent}
                  activeTextEditor={activeTextEditor}
                  onSelectComponent={handleElementSelect}
                  onStartTextEditing={startTextEditing}
                  onStartResizing={startResizing}
                  onResize={handleResize}
                  onFinishResizing={finishResizing}
                  onDragOver={() => {}}
                  onDrop={() => {}}
                  onDragStart={() => {}}
                  onRemoveComponent={handleRemoveComponent}
                  onDuplicateComponent={handleDuplicateComponent}
                  onMoveComponent={handleMoveComponent}
                  onChooseTemplate={() => setIsSelectingPreset(true)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right panel: AI suggestions */}
          {showAISuggestions && (
            <div className="hidden lg:block lg:col-span-3">
              <Card className="overflow-hidden h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      AI Suggestions
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowAISuggestions(false)}
                    >
                      <PanelRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    AI-powered recommendations to improve your template
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <AISuggestionsPanel
                    suggestions={aiSuggestions}
                    isLoading={isGeneratingAI}
                    onApplySuggestion={applyAISuggestion}
                    onRefresh={refreshAISuggestions}
                    focusedSuggestion={aiSuggestionFocus}
                    onFocusSuggestion={setAiSuggestionFocus}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Mobile menu */}
      {renderMobileMenu()}
    </div>
  );
}

/**
 * AI Suggestions Panel Component
 */
function AISuggestionsPanel({
  suggestions,
  isLoading,
  onApplySuggestion,
  onRefresh,
  focusedSuggestion,
  onFocusSuggestion,
}: {
  suggestions: AISuggestion[];
  isLoading: boolean;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  onRefresh: () => void;
  focusedSuggestion: string | null;
  onFocusSuggestion: (id: string | null) => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex gap-1 items-center">
          <Badge className="bg-yellow-500 text-white">AI</Badge>
          <span className="text-sm font-medium">{suggestions.length} suggestions</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Analyzing your template...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Our AI is generating personalized suggestions
            </p>
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <Sun className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No suggestions available</p>
            <p className="text-xs text-muted-foreground mt-2">
              Your template looks great! Try refreshing if you've made changes.
            </p>
            <Button className="mt-4" size="sm" onClick={onRefresh}>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Suggestions
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-auto flex-1">
          {suggestions.map(suggestion => (
            <div
              key={suggestion.id}
              className={cn(
                'p-4 border-b hover:bg-accent/50 transition-colors cursor-pointer',
                focusedSuggestion === suggestion.id && 'bg-accent'
              )}
              onClick={() =>
                onFocusSuggestion(suggestion.id === focusedSuggestion ? null : suggestion.id)
              }
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Badge
                    className={cn(
                      'mr-2',
                      suggestion.type === 'design' && 'bg-blue-500',
                      suggestion.type === 'content' && 'bg-green-500',
                      suggestion.type === 'structure' && 'bg-purple-500'
                    )}
                  >
                    {suggestion.type}
                  </Badge>
                  <h4 className="font-medium">{suggestion.title}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={e => {
                    e.stopPropagation();
                    onApplySuggestion(suggestion);
                  }}
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>

              {suggestion.preview && focusedSuggestion === suggestion.id && (
                <div className="mt-3">
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img
                      src={suggestion.preview}
                      alt="Suggestion Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <Button
                    className="w-full mt-3"
                    onClick={e => {
                      e.stopPropagation();
                      onApplySuggestion(suggestion);
                    }}
                  >
                    Apply Suggestion
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
