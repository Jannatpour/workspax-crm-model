'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { useDashboard } from '@/context/dashboard-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

// Import Lucide Icons - using only valid icons that exist in the package
import {
  LayoutGrid,
  ListFilter,
  FilePlus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Clock,
  Mail,
  Filter,
  Pencil,
  Plus,
  Image,
  Type,
  Code,
  Link,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Move,
  MoveHorizontal,
  Palette,
  Columns,
  Rows,
  Grid3x3,
  Table,
  Calendar,
  MapPin,
  User,
  Users,
  ThumbsUp,
  MessageCircle,
  Share,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  DollarSign,
  Tag,
  Gauge,
  Gift,
  Star,
  Award,
  Send,
  ExternalLink,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Quote,
  CornerUpLeft,
  ArrowLeft,
  Smartphone,
  Tablet,
  Laptop,
  Layout,
  FileText,
  FileImage,
  CloudUpload,
  Grid,
  Box,
  Maximize,
  Minimize,
  Settings,
  Info,
  HelpCircle,
  FileJson,
  Coffee,
  Check,
  AlertTriangle,
  Bookmark,
  BookOpen,
  PlusCircle,
  List as ListIcon,
  ListOrdered,
  Divide as DivideIcon,
} from 'lucide-react';

// Safe icon mapping to prevent undefined icon errors
const safeIcons = {
  LayoutGrid,
  ListFilter,
  FilePlus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Clock,
  Mail,
  Filter,
  Pencil,
  Plus,
  Image,
  Type,
  Code,
  Link,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Move,
  MoveHorizontal,
  Palette,
  Columns,
  Rows,
  Grid3x3,
  Table,
  Calendar,
  MapPin,
  User,
  Users,
  ThumbsUp,
  MessageCircle,
  Share,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  DollarSign,
  Tag,
  Gauge,
  Gift,
  Star,
  Award,
  Send,
  ExternalLink,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Quote,
  CornerUpLeft,
  ArrowLeft,
  Smartphone,
  Tablet,
  Laptop,
  Layout,
  FileText,
  FileImage,
  CloudUpload,
  Grid,
  Box,
  Maximize,
  Minimize,
  Settings,
  Info,
  HelpCircle,
  FileJson,
  Coffee,
  Check,
  AlertTriangle,
  Bookmark,
  BookOpen,
  PlusCircle,
  ListIcon,
  ListOrdered,
  DivideIcon,
};

type IconType = keyof typeof safeIcons;

// Function to safely get icon component
const getIcon = (name: IconType): React.FC<{ className?: string }> => {
  return safeIcons[name] || MoreVertical;
};

// Define types for components
interface ComponentCategory {
  id: string;
  name: string;
  icon: IconType;
}

interface EmailComponent {
  id: string;
  type: string;
  name: string;
  category: string;
  icon: IconType;
  preview: string;
  content: string;
  description?: string;
}

interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  components: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  html: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags?: string[];
  userId?: string;
  isDefault?: boolean;
}

interface PropertyDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'color' | 'number' | 'checkbox';
  options?: string[];
  defaultValue?: string | number | boolean;
}

// Define categories for email components
const componentCategories: ComponentCategory[] = [
  { id: 'layout', name: 'Layout', icon: 'Layout' },
  { id: 'content', name: 'Content', icon: 'Type' },
  { id: 'media', name: 'Media', icon: 'Image' },
  { id: 'buttons', name: 'Buttons', icon: 'ExternalLink' },
  { id: 'social', name: 'Social', icon: 'Share' },
  { id: 'misc', name: 'Other', icon: 'MoreVertical' },
];

// Components for the email editor
const EmailEditorComponents: EmailComponent[] = [
  // Layout Components
  {
    id: 'section',
    type: 'section',
    name: 'Section',
    category: 'layout',
    icon: 'Box',
    preview: '/components/section.png',
    description: 'A container for other components',
    content: `<div style="padding: 20px; background-color: #ffffff;"><p style="text-align: center; color: #666666;">Add content here</p></div>`,
  },
  {
    id: 'columns-2',
    type: 'columns-2',
    name: '2 Columns',
    category: 'layout',
    icon: 'Columns',
    preview: '/components/columns-2.png',
    description: 'Two-column layout',
    content: `<div style="display: flex; flex-wrap: wrap;"><div style="padding: 15px; width: 50%;"><p style="color: #666666;">Left Column</p></div><div style="padding: 15px; width: 50%;"><p style="color: #666666;">Right Column</p></div></div>`,
  },
  {
    id: 'columns-3',
    type: 'columns-3',
    name: '3 Columns',
    category: 'layout',
    icon: 'Grid3x3',
    preview: '/components/columns-3.png',
    description: 'Three-column layout',
    content: `<div style="display: flex; flex-wrap: wrap;"><div style="padding: 15px; width: 33.33%;"><p style="color: #666666;">Column 1</p></div><div style="padding: 15px; width: 33.33%;"><p style="color: #666666;">Column 2</p></div><div style="padding: 15px; width: 33.33%;"><p style="color: #666666;">Column 3</p></div></div>`,
  },
  {
    id: 'spacer',
    type: 'spacer',
    name: 'Spacer',
    category: 'layout',
    icon: 'MoveHorizontal',
    preview: '/components/spacer.png',
    description: 'Add vertical space',
    content: `<div style="height: 30px;"></div>`,
  },
  {
    id: 'divider',
    type: 'divider',
    name: 'Divider',
    category: 'layout',
    icon: 'DivideIcon',
    preview: '/components/divider.png',
    description: 'Horizontal divider line',
    content: `<div style="padding: 10px;"><hr style="border: 1px solid #f0f0f0;"></div>`,
  },

  // Content Components
  {
    id: 'header',
    type: 'header',
    name: 'Header',
    category: 'content',
    icon: 'Type',
    preview: '/components/header.png',
    description: 'Main heading text',
    content: `<div style="padding: 20px; text-align: center; background-color: #f8f9fa;"><h1 style="color: #333333; margin: 0; font-family: Arial, sans-serif; font-size: 28px;">Your Heading</h1></div>`,
  },
  {
    id: 'text',
    type: 'text',
    name: 'Text Block',
    category: 'content',
    icon: 'AlignLeft',
    preview: '/components/text.png',
    description: 'Paragraph of text',
    content: `<div style="padding: 15px;"><p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">Your text goes here. Edit this to add your content.</p></div>`,
  },
  {
    id: 'quote',
    type: 'quote',
    name: 'Quote',
    category: 'content',
    icon: 'Quote',
    preview: '/components/quote.png',
    description: 'Quotation or testimonial',
    content: `<div style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ccc;"><blockquote style="margin: 0; font-style: italic; color: #555;">"This is a quote. Edit this text to add your quote."</blockquote><p style="margin-top: 10px; margin-bottom: 0; text-align: right; font-size: 14px; color: #777;">- Author Name</p></div>`,
  },
  {
    id: 'list',
    type: 'list',
    name: 'Bullet List',
    category: 'content',
    icon: 'ListIcon',
    preview: '/components/list.png',
    description: 'Bulleted list of items',
    content: `<div style="padding: 15px;"><ul style="margin: 0; padding-left: 20px;"><li style="margin-bottom: 10px;">First item</li><li style="margin-bottom: 10px;">Second item</li><li style="margin-bottom: 10px;">Third item</li></ul></div>`,
  },

  // Media Components
  {
    id: 'image',
    type: 'image',
    name: 'Image',
    category: 'media',
    icon: 'Image',
    preview: '/components/image.png',
    description: 'Single image',
    content: `<div style="padding: 15px; text-align: center;"><img src="https://via.placeholder.com/600x200" alt="Image" style="max-width: 100%;"></div>`,
  },
  {
    id: 'video',
    type: 'video',
    name: 'Video Thumbnail',
    category: 'media',
    icon: 'Youtube',
    preview: '/components/video.png',
    description: 'Video thumbnail with play button',
    content: `<div style="padding: 15px; text-align: center;"><a href="#" style="display: block; position: relative;"><img src="https://via.placeholder.com/600x300" alt="Video thumbnail" style="max-width: 100%;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0,0,0,0.7); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="white"/></svg></div></a></div>`,
  },

  // Button Components
  {
    id: 'button',
    type: 'button',
    name: 'Button',
    category: 'buttons',
    icon: 'ExternalLink',
    preview: '/components/button.png',
    description: 'Call-to-action button',
    content: `<div style="padding: 15px; text-align: center;"><a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 16px; display: inline-block;">Click Me</a></div>`,
  },
  {
    id: 'button-outline',
    type: 'button-outline',
    name: 'Outline Button',
    category: 'buttons',
    icon: 'ExternalLink',
    preview: '/components/button-outline.png',
    description: 'Outlined call-to-action button',
    content: `<div style="padding: 15px; text-align: center;"><a href="#" style="background-color: transparent; color: #007bff; padding: 11px 23px; text-decoration: none; border-radius: 4px; border: 1px solid #007bff; font-family: Arial, sans-serif; font-size: 16px; display: inline-block;">Click Me</a></div>`,
  },
  {
    id: 'cta',
    type: 'cta',
    name: 'Call to Action',
    category: 'buttons',
    icon: 'ExternalLink',
    preview: '/components/cta.png',
    description: 'Full call-to-action section with button',
    content: `<div style="padding: 25px; text-align: center; background-color: #f8f9fa;"><h2 style="margin-top: 0; margin-bottom: 15px; color: #333; font-family: Arial, sans-serif;">Ready to Get Started?</h2><p style="margin-bottom: 20px; color: #555; font-family: Arial, sans-serif;">Join thousands of satisfied customers today.</p><a href="#" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; display: inline-block;">Sign Up Now</a></div>`,
  },

  // Social Components
  {
    id: 'social',
    type: 'social',
    name: 'Social Links',
    category: 'social',
    icon: 'Share',
    preview: '/components/social.png',
    description: 'Social media links',
    content: `<div style="padding: 15px; text-align: center;"><a href="#" style="margin: 0 5px; display: inline-block;"><img src="https://via.placeholder.com/30" alt="Facebook" style="width: 30px; height: 30px;"></a><a href="#" style="margin: 0 5px; display: inline-block;"><img src="https://via.placeholder.com/30" alt="Twitter" style="width: 30px; height: 30px;"></a><a href="#" style="margin: 0 5px; display: inline-block;"><img src="https://via.placeholder.com/30" alt="Instagram" style="width: 30px; height: 30px;"></a><a href="#" style="margin: 0 5px; display: inline-block;"><img src="https://via.placeholder.com/30" alt="LinkedIn" style="width: 30px; height: 30px;"></a></div>`,
  },
  {
    id: 'share-article',
    type: 'share-article',
    name: 'Share Article',
    category: 'social',
    icon: 'MessageCircle',
    preview: '/components/share-article.png',
    description: 'Article share links',
    content: `<div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;"><div style="display: flex; align-items: center;"><div style="flex: 1;"><h3 style="margin-top: 0; margin-bottom: 10px; color: #333;">Share This Article</h3><p style="margin-top: 0; margin-bottom: 0; color: #666;">Help spread the word about this article on social media.</p></div><div><a href="#" style="margin: 0 5px; display: inline-block;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#3b5998"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a><a href="#" style="margin: 0 5px; display: inline-block;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#1da1f2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a><a href="#" style="margin: 0 5px; display: inline-block;"><svg width="24" height="24" viewBox="0 0 24 24" fill="#0077b5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a></div></div></div>`,
  },

  // Misc Components
  {
    id: 'footer',
    type: 'footer',
    name: 'Footer',
    category: 'misc',
    icon: 'AlignRight',
    preview: '/components/footer.png',
    description: 'Email footer with copyright',
    content: `<div style="padding: 20px; text-align: center; background-color: #f8f9fa;"><p style="margin-bottom: 10px; color: #666; font-size: 14px;">© 2025 Your Company. All rights reserved.</p><p style="margin-top: 0; margin-bottom: 10px; color: #666; font-size: 14px;"><a href="#" style="color: #007bff; text-decoration: none;">Privacy Policy</a> • <a href="#" style="color: #007bff; text-decoration: none;">Terms of Service</a> • <a href="#" style="color: #007bff; text-decoration: none;">Unsubscribe</a></p></div>`,
  },
  {
    id: 'testimonial',
    type: 'testimonial',
    name: 'Testimonial',
    category: 'misc',
    icon: 'ThumbsUp',
    preview: '/components/testimonial.png',
    description: 'Customer testimonial with photo',
    content: `<div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;"><div style="text-align: center; margin-bottom: 15px;"><div style="display: inline-block; width: 70px; height: 70px; border-radius: 50%; overflow: hidden; margin-bottom: 10px;"><img src="https://via.placeholder.com/70" alt="Customer" style="width: 100%; height: 100%; object-fit: cover;"></div><p style="font-style: italic; color: #555; font-size: 16px; line-height: 1.6;">"This product has completely transformed how we work. I can't imagine going back to our old process!"</p><div style="font-weight: bold; color: #333;">Jane Smith</div><div style="color: #666; font-size: 14px;">CEO, Company Name</div></div></div>`,
  },
  {
    id: 'countdown',
    type: 'countdown',
    name: 'Countdown Timer',
    category: 'misc',
    icon: 'Clock',
    preview: '/components/countdown.png',
    description: 'Visual countdown timer',
    content: `<div style="padding: 20px; text-align: center; background-color: #f8f9fa;"><h3 style="margin-top: 0; margin-bottom: 15px; color: #333;">Limited Time Offer</h3><div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 15px;"><div style="background-color: #007bff; color: white; padding: 10px; min-width: 60px; border-radius: 5px;"><div style="font-size: 20px; font-weight: bold;">02</div><div style="font-size: 12px;">Days</div></div><div style="background-color: #007bff; color: white; padding: 10px; min-width: 60px; border-radius: 5px;"><div style="font-size: 20px; font-weight: bold;">12</div><div style="font-size: 12px;">Hours</div></div><div style="background-color: #007bff; color: white; padding: 10px; min-width: 60px; border-radius: 5px;"><div style="font-size: 20px; font-weight: bold;">45</div><div style="font-size: 12px;">Minutes</div></div><div style="background-color: #007bff; color: white; padding: 10px; min-width: 60px; border-radius: 5px;"><div style="font-size: 20px; font-weight: bold;">30</div><div style="font-size: 12px;">Seconds</div></div></div><p style="margin: 0; color: #666;">Hurry! This offer expires soon.</p></div>`,
  },
  {
    id: 'feature-list',
    type: 'feature-list',
    name: 'Feature List',
    category: 'misc',
    icon: 'ListOrdered',
    preview: '/components/feature-list.png',
    description: 'Numbered list of features',
    content: `<div style="padding: 20px;"><h3 style="margin-top: 0; margin-bottom: 15px; color: #333; text-align: center;">Key Features</h3><div style="display: flex; margin-bottom: 15px; align-items: center;"><div style="margin-right: 15px; width: 40px; height: 40px; background-color: #007bff; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</div><div><h4 style="margin-top: 0; margin-bottom: 5px; color: #333;">Feature One</h4><p style="margin: 0; color: #666;">A brief description of your first amazing feature.</p></div></div><div style="display: flex; margin-bottom: 15px; align-items: center;"><div style="margin-right: 15px; width: 40px; height: 40px; background-color: #007bff; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</div><div><h4 style="margin-top: 0; margin-bottom: 5px; color: #333;">Feature Two</h4><p style="margin: 0; color: #666;">A brief description of your second amazing feature.</p></div></div><div style="display: flex; align-items: center;"><div style="margin-right: 15px; width: 40px; height: 40px; background-color: #007bff; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">3</div><div><h4 style="margin-top: 0; margin-bottom: 5px; color: #333;">Feature Three</h4><p style="margin: 0; color: #666;">A brief description of your third amazing feature.</p></div></div></div>`,
  },
];

// Template for a new email
const newEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .content-area {
      min-height: 200px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    /* Mobile Styles */
    @media only screen and (max-width: 480px) {
      .container {
        width: 100% !important;
      }
      div[style*="width: 50%"] {
        width: 100% !important;
        display: block !important;
      }
      div[style*="width: 33.33%"] {
        width: 100% !important;
        display: block !important;
      }
    }
  </style>
</head>
<body>
  <div class="container" id="template-container">
    <!-- Content will be placed here -->
  </div>
</body>
</html>
`;

// Template preview presets
const templatePresets: TemplatePreset[] = [
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

// Mock template data
const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    description: 'A template for welcoming new users',
    content: 'Welcome to our platform! We are excited to have you onboard.',
    html: `<div style="text-align:center;"><h1>Welcome!</h1><p>We are excited to have you onboard.</p><div style="padding: 20px;"><a href="#" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Get Started</a></div></div>`,
    thumbnail: 'https://via.placeholder.com/300x200?text=Welcome+Email',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-15'),
    category: 'onboarding',
    tags: ['welcome', 'onboarding', 'new user'],
    isDefault: true,
  },
  {
    id: '2',
    name: 'Newsletter',
    description: 'Monthly newsletter template',
    content: 'Here are our updates for the month.',
    html: `<div style="text-align:center;"><h1>Monthly Newsletter</h1><p>Here are our updates for the month.</p><div style="display: flex;"><div style="width: 50%; padding: 10px;"><h3>Article 1</h3><p>Content for article 1</p></div><div style="width: 50%; padding: 10px;"><h3>Article 2</h3><p>Content for article 2</p></div></div></div>`,
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
    html: `<div style="text-align:center;"><h1>Special Offer!</h1><p>We have a great deal just for you.</p><div style="padding: 20px;"><a href="#" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Shop Now</a></div></div>`,
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
    html: `<div style="text-align:center;"><h1>You're Invited!</h1><p>Join us for a special event.</p><div style="padding: 20px;"><a href="#" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">RSVP Now</a></div></div>`,
    thumbnail: 'https://via.placeholder.com/300x200?text=Event',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-04-15'),
    category: 'events',
    tags: ['event', 'invitation', 'rsvp'],
    isDefault: true,
  },
];

// Component properties that can be edited
const componentEditableProperties: Record<string, PropertyDefinition[]> = {
  header: [
    { name: 'text', label: 'Heading Text', type: 'text' },
    {
      name: 'fontSize',
      label: 'Font Size',
      type: 'select',
      options: ['20px', '24px', '28px', '32px', '36px'],
    },
    { name: 'color', label: 'Text Color', type: 'color' },
    { name: 'backgroundColor', label: 'Background Color', type: 'color' },
    { name: 'alignment', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
  ],
  text: [
    { name: 'text', label: 'Text Content', type: 'textarea' },
    {
      name: 'fontSize',
      label: 'Font Size',
      type: 'select',
      options: ['14px', '16px', '18px', '20px'],
    },
    { name: 'color', label: 'Text Color', type: 'color' },
    { name: 'backgroundColor', label: 'Background Color', type: 'color' },
    { name: 'alignment', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
  ],
  button: [
    { name: 'text', label: 'Button Text', type: 'text' },
    { name: 'url', label: 'Button URL', type: 'text' },
    { name: 'backgroundColor', label: 'Background Color', type: 'color' },
    { name: 'textColor', label: 'Text Color', type: 'color' },
    {
      name: 'borderRadius',
      label: 'Border Radius',
      type: 'select',
      options: ['0px', '4px', '8px', '12px', 'pill'],
    },
    { name: 'alignment', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
  ],
  image: [
    { name: 'src', label: 'Image URL', type: 'text' },
    { name: 'alt', label: 'Alt Text', type: 'text' },
    { name: 'alignment', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'] },
    { name: 'link', label: 'Link URL (optional)', type: 'text' },
  ],
  quote: [
    { name: 'text', label: 'Quote Text', type: 'textarea' },
    { name: 'author', label: 'Author Name', type: 'text' },
    { name: 'backgroundColor', label: 'Background Color', type: 'color' },
    { name: 'borderColor', label: 'Border Color', type: 'color' },
  ],
  footer: [
    { name: 'text', label: 'Copyright Text', type: 'text' },
    { name: 'backgroundColor', label: 'Background Color', type: 'color' },
    { name: 'textColor', label: 'Text Color', type: 'color' },
  ],
  section: [
    { name: 'backgroundColor', label: 'Background Color', type: 'color' },
    {
      name: 'padding',
      label: 'Padding',
      type: 'select',
      options: ['10px', '15px', '20px', '30px', '40px'],
    },
  ],
  'columns-2': [
    { name: 'backgroundColor', label: 'Background Color', type: 'color' },
    {
      name: 'columnGap',
      label: 'Column Gap',
      type: 'select',
      options: ['0px', '10px', '20px', '30px'],
    },
  ],
  'columns-3': [
    { name: 'backgroundColor', label: 'Background Color', type: 'color' },
    {
      name: 'columnGap',
      label: 'Column Gap',
      type: 'select',
      options: ['0px', '10px', '20px', '30px'],
    },
  ],
  spacer: [
    {
      name: 'height',
      label: 'Height',
      type: 'select',
      options: ['10px', '20px', '30px', '40px', '50px'],
    },
  ],
  divider: [
    { name: 'color', label: 'Line Color', type: 'color' },
    { name: 'style', label: 'Line Style', type: 'select', options: ['solid', 'dashed', 'dotted'] },
    {
      name: 'thickness',
      label: 'Thickness',
      type: 'select',
      options: ['1px', '2px', '3px', '5px'],
    },
  ],
};

interface TemplatesOverviewProps {
  isCreating?: boolean;
}

/**
 * TemplatesOverview Component
 *
 * A comprehensive email template editor and management interface
 * that allows users to create, edit, and manage email templates
 * with a drag-and-drop interface.
 */
export function TemplatesOverview({ isCreating = false }: TemplatesOverviewProps) {
  const { currentWorkspace } = useWorkspace();
  const { changeSection, sectionParams } = useDashboard();
  const { toast } = useToast();
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // State initialization with proper typing
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [isEditing, setIsEditing] = useState(isCreating);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [editorContent, setEditorContent] = useState<EmailComponent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<number | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<EmailComponent | string | null>(null);
  const [activeComponentCategory, setActiveComponentCategory] = useState('layout');
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [historySteps, setHistorySteps] = useState<EmailComponent[][]>([[]]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [isSelectingPreset, setIsSelectingPreset] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyDefinition | null>(null);
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(true);
  const [categories, setCategories] = useState([
    'all',
    'onboarding',
    'newsletter',
    'marketing',
    'events',
    'transactional',
    'feedback',
    'custom',
  ]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save: Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditing) {
        e.preventDefault();
        handleSaveTemplate();
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && isEditing) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }

      // Toggle Preview: Ctrl/Cmd + P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && isEditing) {
        e.preventDefault();
        setShowPreview(!showPreview);
      }

      // Delete component: Delete key when a component is selected
      if (e.key === 'Delete' && selectedComponent !== null && isEditing) {
        e.preventDefault();
        handleRemoveComponent(selectedComponent);
      }

      // Cancel/Exit: Escape
      if (e.key === 'Escape' && isEditing) {
        // If property editor is open, close it first
        if (editingProperty) {
          setEditingProperty(null);
        }
        // If a component is selected, deselect it
        else if (selectedComponent !== null) {
          setSelectedComponent(null);
        }
        // Otherwise, prompt to cancel editing
        else if (confirm('Discard changes and exit the editor?')) {
          setIsEditing(false);
          setShowPreview(false);
          setCurrentTemplate(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, selectedComponent, editingProperty, showPreview, handleUndo, handleRedo]);

  // Initialize with isCreating prop
  useEffect(() => {
    if (isCreating) {
      handleCreateTemplate();
    }
  }, [isCreating]);

  // Check for sectionParams
  useEffect(() => {
    if (sectionParams?.action === 'create') {
      handleCreateTemplate();
    }
  }, [sectionParams]);

  // Setup autosave timer
  useEffect(() => {
    let autosaveTimer: NodeJS.Timeout;

    // Only set up autosave when editing and autosave is enabled
    if (isEditing && isAutosaveEnabled && editorContent.length > 0) {
      autosaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Autosave every 30 seconds
    }

    return () => {
      if (autosaveTimer) clearTimeout(autosaveTimer);
    };
  }, [isEditing, isAutosaveEnabled, editorContent, currentHistoryIndex]);

  // Generate HTML from components
  const generateTemplateHtml = useCallback(() => {
    if (editorContent.length === 0) return newEmailTemplate;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(newEmailTemplate, 'text/html');
      const container = doc.getElementById('template-container');

      if (container) {
        // Clear existing content
        container.innerHTML = '';

        // Add each component
        editorContent.forEach(component => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = component.content;
          const element = tempDiv.firstChild;
          if (element instanceof HTMLElement) {
            element.setAttribute('data-type', component.type);
            container.appendChild(element);
          }
        });
      }

      return doc.documentElement.outerHTML;
    } catch (error) {
      console.error('Error generating template HTML:', error);
      return newEmailTemplate;
    }
  }, [editorContent]);

  // Handle autosave
  const handleAutoSave = useCallback(() => {
    if (!isEditing || !isAutosaveEnabled || editorContent.length === 0 || !newTemplateName) {
      return;
    }

    try {
      // Generate HTML
      const html = generateTemplateHtml();

      // Create backup to localStorage
      const backupData = {
        name: newTemplateName,
        description: newTemplateDescription,
        content: editorContent,
        html,
        timestamp: new Date().toISOString(),
        templateId: currentTemplate?.id || `draft-${Date.now()}`,
      };

      localStorage.setItem('email_template_autosave', JSON.stringify(backupData));

      // Update last saved timestamp
      setLastSaved(new Date());
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }, [
    editorContent,
    newTemplateName,
    newTemplateDescription,
    currentTemplate,
    generateTemplateHtml,
  ]);

  // Check for autosave data on load
  useEffect(() => {
    try {
      const autosaveData = localStorage.getItem('email_template_autosave');

      if (autosaveData && !isEditing && !isCreating) {
        const parsedData = JSON.parse(autosaveData);
        const savedTime = new Date(parsedData.timestamp);
        const hoursSinceLastSave = (Date.now() - savedTime.getTime()) / (1000 * 60 * 60);

        // Only prompt if autosave is less than 24 hours old
        if (hoursSinceLastSave < 24) {
          const confirmRestore = window.confirm(
            `Found an unsaved template "${
              parsedData.name
            }" from ${savedTime.toLocaleString()}. Would you like to restore it?`
          );

          if (confirmRestore) {
            setIsEditing(true);
            setNewTemplateName(parsedData.name);
            setNewTemplateDescription(parsedData.description);
            setEditorContent(parsedData.content);
            setHistorySteps([parsedData.content]);
            setCurrentHistoryIndex(0);
            setCurrentTemplate(null);

            toast({
              title: 'Draft restored',
              description: 'Your unsaved changes have been restored.',
            });
          } else {
            // Clear autosave data if user declines
            localStorage.removeItem('email_template_autosave');
          }
        } else {
          // Clear old autosave data
          localStorage.removeItem('email_template_autosave');
        }
      }
    } catch (error) {
      console.error('Error checking autosave data:', error);
      // Clear possibly corrupted data
      localStorage.removeItem('email_template_autosave');
    }
  }, []);

  // Update preview when editorContent changes
  useEffect(() => {
    if (showPreview) {
      const timeoutId = setTimeout(() => {
        updatePreview();
      }, 100); // Slight delay to ensure DOM is ready
      return () => clearTimeout(timeoutId);
    }
  }, [editorContent, showPreview, previewMode]);

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

  // Undo and Redo functionality moved to before the keyboard shortcuts useEffect

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

  // Update preview iframe
  const updatePreview = useCallback(() => {
    if (!showPreview || !previewIframeRef.current) return;

    const iframe = previewIframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDoc) {
      // Generate HTML from components
      const html = generateTemplateHtml();

      // Write to iframe
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Apply responsive styles based on preview mode
      if (previewMode === 'mobile') {
        iframe.style.width = '375px';
      } else if (previewMode === 'tablet') {
        iframe.style.width = '768px';
      } else {
        iframe.style.width = '100%';
      }
    }
  }, [showPreview, previewMode, generateTemplateHtml]);

  // Handle creating a new template
  const handleCreateTemplate = useCallback(() => {
    setIsEditing(true);
    setCurrentTemplate(null);
    setEditorContent([]);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setHistorySteps([[]]);
    setCurrentHistoryIndex(0);
    setSelectedComponent(null);

    // Show template presets for selection
    setIsSelectingPreset(true);
  }, []);

  // Handle selecting a template preset
  const handleSelectPreset = useCallback(
    (preset: TemplatePreset) => {
      try {
        // Create components from preset
        const newContent = preset.components
          .map(componentId => {
            const component = EmailEditorComponents.find(c => c.id === componentId);
            if (component) {
              return {
                ...component,
                id: `${component.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              };
            }
            return null;
          })
          .filter(Boolean) as EmailComponent[];

        setEditorContent(newContent);
        setNewTemplateName(preset.name);
        setNewTemplateDescription(preset.description);
        setHistorySteps([[...newContent]]);
        setCurrentHistoryIndex(0);
        setIsSelectingPreset(false);

        toast({
          title: 'Template loaded',
          description: `${preset.name} template selected successfully`,
        });
      } catch (error) {
        console.error('Error selecting preset:', error);
        toast({
          title: 'Error selecting preset',
          description: 'There was a problem loading the template preset.',
          variant: 'destructive',
        });
        setIsSelectingPreset(false);
      }
    },
    [toast]
  );

  // Handle starting from scratch
  const handleStartFromScratch = useCallback(() => {
    setEditorContent([]);
    setNewTemplateName('New Template');
    setNewTemplateDescription('');
    setHistorySteps([[]]);
    setCurrentHistoryIndex(0);
    setIsSelectingPreset(false);

    toast({
      title: 'Blank template',
      description: 'Starting with a blank template',
      duration: 1500,
    });
  }, [toast]);

  // Handle editing an existing template
  const handleEditTemplate = useCallback(
    (template: EmailTemplate) => {
      try {
        setIsEditing(true);
        setCurrentTemplate(template);
        setNewTemplateName(template.name);
        setNewTemplateDescription(template.description || '');

        // Parse HTML content to recreate component structure
        const parser = new DOMParser();
        const doc = parser.parseFromString(template.html, 'text/html');
        const container = doc.querySelector('#template-container') || doc.body;
        const elements = container.querySelectorAll(
          '[data-type], div, a, img, h1, h2, h3, p, blockquote, ul'
        );

        const parsedContent: EmailComponent[] = [];

        elements.forEach((element, index) => {
          // Try to determine component type
          const dataType = element.getAttribute('data-type');
          let componentType = dataType || 'text';

          if (!dataType) {
            // Try to infer type from element structure
            if (element.tagName === 'H1' || element.tagName === 'H2') componentType = 'header';
            else if (element.tagName === 'IMG') componentType = 'image';
            else if (
              element.tagName === 'A' &&
              element.getAttribute('style')?.includes('background-color')
            )
              componentType = 'button';
            else if (element.tagName === 'BLOCKQUOTE') componentType = 'quote';
            else if (element.tagName === 'UL' || element.tagName === 'OL') componentType = 'list';
            else if (element.tagName === 'HR') componentType = 'divider';
          }

          // Find matching component
          const matchingComponent = EmailEditorComponents.find(c => c.type === componentType);

          if (matchingComponent && !element.closest('[data-parsed="true"]')) {
            // Mark this element as parsed to avoid nested duplicates
            element.setAttribute('data-parsed', 'true');

            parsedContent.push({
              ...matchingComponent,
              id: `${matchingComponent.id}-${Date.now()}-${index}`,
              content: element.outerHTML,
            });
          }
        });

        // If we couldn't parse any components, use a simplified approach with defaults
        if (parsedContent.length === 0) {
          const fallbackComponents: EmailComponent[] = [];

          // Add a header
          const headerComponent = EmailEditorComponents.find(c => c.id === 'header');
          if (headerComponent) {
            fallbackComponents.push({
              ...headerComponent,
              id: `header-${Date.now()}`,
            });
          }

          // Add content as text
          const textComponent = EmailEditorComponents.find(c => c.id === 'text');
          if (textComponent) {
            fallbackComponents.push({
              ...textComponent,
              id: `text-${Date.now()}`,
              content: `<div style="padding: 15px;"><p style="font-family: Arial, sans-serif;">${template.content}</p></div>`,
            });
          }

          // Add a button if not present
          const buttonComponent = EmailEditorComponents.find(c => c.id === 'button');
          if (buttonComponent) {
            fallbackComponents.push({
              ...buttonComponent,
              id: `button-${Date.now()}`,
            });
          }

          // Add a footer if not present
          const footerComponent = EmailEditorComponents.find(c => c.id === 'footer');
          if (footerComponent) {
            fallbackComponents.push({
              ...footerComponent,
              id: `footer-${Date.now()}`,
            });
          }

          setEditorContent(fallbackComponents);
          setHistorySteps([fallbackComponents]);
        } else {
          setEditorContent(parsedContent);
          setHistorySteps([parsedContent]);
        }

        setCurrentHistoryIndex(0);
        toast({
          title: 'Template loaded',
          description: `Now editing: ${template.name}`,
        });
      } catch (error) {
        console.error('Error parsing template HTML:', error);
        toast({
          title: 'Error loading template',
          description: 'There was a problem parsing the template HTML.',
          variant: 'destructive',
        });
        setEditorContent([]);
        setHistorySteps([[]]);
        setCurrentHistoryIndex(0);
      }
    },
    [toast]
  );

  // Handle exporting a template as HTML
  const handleExportTemplate = useCallback(
    (template: EmailTemplate) => {
      try {
        // Create a blob with the HTML content
        const blob = new Blob([template.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.html`;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: 'Template exported',
          description: 'Your template has been exported as HTML.',
        });
      } catch (error) {
        console.error('Error exporting template:', error);
        toast({
          title: 'Export failed',
          description: 'There was a problem exporting the template.',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  // Handle deleting a template
  const handleDeleteTemplate = useCallback(
    (id: string) => {
      try {
        // Check if it's a default template
        const template = templates.find(t => t.id === id);
        if (template?.isDefault) {
          // Show a confirmation dialog for default templates
          if (!window.confirm('This is a default template. Are you sure you want to delete it?')) {
            return;
          }
        }

        setTemplates(templates.filter(template => template.id !== id));
        toast({
          title: 'Template deleted',
          description: 'Template has been permanently deleted.',
        });
      } catch (error) {
        console.error('Error deleting template:', error);
        toast({
          title: 'Deletion failed',
          description: 'There was a problem deleting the template.',
          variant: 'destructive',
        });
      }
    },
    [templates, toast]
  );

  // Handle duplicating a template
  const handleDuplicateTemplate = useCallback(
    (template: EmailTemplate) => {
      try {
        const newTemplate: EmailTemplate = {
          ...template,
          id: `${template.id}-copy-${Date.now()}`,
          name: `${template.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: false,
        };

        setTemplates([...templates, newTemplate]);
        toast({
          title: 'Template duplicated',
          description: 'A copy of the template has been created.',
        });
      } catch (error) {
        console.error('Error duplicating template:', error);
        toast({
          title: 'Duplication failed',
          description: 'There was a problem duplicating the template.',
          variant: 'destructive',
        });
      }
    },
    [templates, toast]
  );

  // Generate HTML from components function moved to before handleAutoSave

  // Handle saving a template
  const handleSaveTemplate = useCallback(async () => {
    if (!newTemplateName.trim()) {
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
      const html = generateTemplateHtml();
      const extractedText = editorContent
        .map(component => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(component.content, 'text/html');
          return doc.body.textContent || '';
        })
        .join(' ')
        .substring(0, 200);

      // Simulate a delay for the save operation (remove in production)
      await new Promise(resolve => setTimeout(resolve, 800));

      if (currentTemplate) {
        // Update existing template
        const updatedTemplates = templates.map(template =>
          template.id === currentTemplate.id
            ? {
                ...template,
                name: newTemplateName,
                description: newTemplateDescription,
                content: extractedText,
                html,
                updatedAt: new Date(),
              }
            : template
        );

        setTemplates(updatedTemplates);
      } else {
        // Create new template
        const newTemplate: EmailTemplate = {
          id: `template-${Date.now()}`,
          name: newTemplateName,
          description: newTemplateDescription,
          content: extractedText,
          html,
          thumbnail: 'https://via.placeholder.com/300x200?text=Custom',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: false,
          category: 'custom',
          tags: [],
        };

        setTemplates([...templates, newTemplate]);
      }

      // Clear autosave data
      localStorage.removeItem('email_template_autosave');

      setIsSaving(false);
      setShowSuccessMessage(true);
      setLastSaved(new Date());

      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsEditing(false);
        setIsSelectingPreset(false);
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
  }, [
    newTemplateName,
    newTemplateDescription,
    generateTemplateHtml,
    currentTemplate,
    templates,
    editorContent,
    toast,
  ]);

  // Handle drag start
  const handleDragStart = useCallback((component: EmailComponent | string) => {
    setDraggedComponent(component);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();

      if (!draggedComponent) return;

      const newContent = [...editorContent];

      try {
        if (typeof draggedComponent === 'string') {
          // Reordering existing component
          const dragIndex = parseInt(draggedComponent);
          const componentToMove = newContent[dragIndex];

          // Ensure component exists
          if (!componentToMove) return;

          // Remove from original position
          newContent.splice(dragIndex, 1);

          // Insert at new position
          if (dragIndex < index) {
            newContent.splice(index - 1, 0, componentToMove);
          } else {
            newContent.splice(index, 0, componentToMove);
          }
        } else {
          // Adding new component
          const newId = `${(draggedComponent as EmailComponent).id}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          const newComponent = {
            ...(draggedComponent as EmailComponent),
            id: newId,
          };
          newContent.splice(index, 0, newComponent);
        }

        setEditorContent(newContent);
        addToHistory(newContent);
        setDraggedComponent(null);

        toast({
          title: 'Component added',
          description:
            typeof draggedComponent === 'string'
              ? 'Component reordered successfully'
              : 'New component added to template',
          duration: 1500,
        });
      } catch (error) {
        console.error('Error handling drop:', error);
        setDraggedComponent(null);
        toast({
          title: 'Error',
          description: 'Failed to add component',
          variant: 'destructive',
        });
      }
    },
    [draggedComponent, editorContent, addToHistory, toast]
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

  // Handle property change
  const handlePropertyChange = useCallback(
    (property: string, value: string) => {
      if (selectedComponent === null) return;

      try {
        const component = editorContent[selectedComponent];
        const parser = new DOMParser();
        const doc = parser.parseFromString(component.content, 'text/html');
        const element = doc.body.firstChild as HTMLElement;

        if (!element) return;

        // Determine what to update based on component type and property
        if (component.type === 'header' || component.type === 'text') {
          if (property === 'text') {
            // Find the text element (h1, h2, p, etc.)
            const textElement = element.querySelector('h1, h2, h3, p');
            if (textElement) {
              textElement.textContent = value;
            }
          } else if (property === 'fontSize') {
            const textElement = element.querySelector('h1, h2, h3, p');
            if (textElement) {
              textElement.style.fontSize = value;
            }
          } else if (property === 'color') {
            const textElement = element.querySelector('h1, h2, h3, p');
            if (textElement) {
              textElement.style.color = value;
            }
          } else if (property === 'backgroundColor') {
            element.style.backgroundColor = value;
          } else if (property === 'alignment') {
            element.style.textAlign = value;
          }
        } else if (component.type === 'button' || component.type === 'button-outline') {
          const button = element.querySelector('a');
          if (button) {
            if (property === 'text') {
              button.textContent = value;
            } else if (property === 'url') {
              button.setAttribute('href', value);
            } else if (property === 'backgroundColor') {
              button.style.backgroundColor = value;
            } else if (property === 'textColor') {
              button.style.color = value;
            } else if (property === 'borderRadius') {
              button.style.borderRadius = value === 'pill' ? '999px' : value;
            }
          }

          if (property === 'alignment') {
            element.style.textAlign = value;
          }
        } else if (component.type === 'image') {
          const img = element.querySelector('img');
          if (img) {
            if (property === 'src') {
              img.setAttribute('src', value);
            } else if (property === 'alt') {
              img.setAttribute('alt', value);
            }
          }

          if (property === 'alignment') {
            element.style.textAlign = value;
          }

          if (property === 'link') {
            // If there's already a link
            const existingLink = element.querySelector('a');
            if (existingLink && img) {
              if (value) {
                existingLink.setAttribute('href', value);
              } else {
                // If link value is empty, remove the link wrapper
                existingLink.replaceWith(img);
              }
            } else if (value && img) {
              // Create new link
              const link = doc.createElement('a');
              link.setAttribute('href', value);
              img.parentNode?.insertBefore(link, img);
              link.appendChild(img);
            }
          }
        } else if (component.type === 'quote') {
          if (property === 'text') {
            const quote = element.querySelector('blockquote');
            if (quote) {
              quote.textContent = value;
            }
          } else if (property === 'author') {
            const author = element.querySelector('p');
            if (author) {
              author.textContent = `- ${value}`;
            }
          } else if (property === 'backgroundColor') {
            element.style.backgroundColor = value;
          } else if (property === 'borderColor') {
            element.style.borderLeftColor = value;
          }
        } else if (component.type === 'divider') {
          const hr = element.querySelector('hr');
          if (hr) {
            if (property === 'color') {
              hr.style.borderColor = value;
            } else if (property === 'style') {
              hr.style.borderStyle = value;
            } else if (property === 'thickness') {
              hr.style.borderWidth = value;
            }
          }
        } else if (component.type === 'section') {
          if (property === 'backgroundColor') {
            element.style.backgroundColor = value;
          } else if (property === 'padding') {
            element.style.padding = value;
          }
        } else if (component.type === 'spacer') {
          if (property === 'height') {
            element.style.height = value;
          }
        } else if (component.type === 'footer') {
          if (property === 'text') {
            const copyright = element.querySelector('p');
            if (copyright) {
              copyright.textContent = value;
            }
          } else if (property === 'backgroundColor') {
            element.style.backgroundColor = value;
          } else if (property === 'textColor') {
            const paragraphs = element.querySelectorAll('p');
            paragraphs.forEach(p => {
              p.style.color = value;
            });
          }
        }

        // Update the component content
        const updatedContent = [...editorContent];
        updatedContent[selectedComponent] = {
          ...updatedContent[selectedComponent],
          content: element.outerHTML,
        };

        setEditorContent(updatedContent);
        addToHistory(updatedContent);
      } catch (error) {
        console.error('Error updating property:', error);
        toast({
          title: 'Error',
          description: 'Failed to update component property',
          variant: 'destructive',
        });
      }
    },
    [selectedComponent, editorContent, addToHistory, toast]
  );

  // Get editable properties for selected component
  const getEditableProperties = useCallback(() => {
    if (selectedComponent === null) return [];

    const component = editorContent[selectedComponent];
    const componentType = component.type;

    // Return the properties for this component type
    return componentEditableProperties[componentType] || [];
  }, [selectedComponent, editorContent]);

  // Get property value from component content
  const getPropertyValue = useCallback(
    (property: string) => {
      if (selectedComponent === null) return '';

      try {
        const component = editorContent[selectedComponent];
        const parser = new DOMParser();
        const doc = parser.parseFromString(component.content, 'text/html');
        const element = doc.body.firstChild as HTMLElement;

        if (!element) return '';

        // Extract value based on component type and property
        if (component.type === 'header' || component.type === 'text') {
          if (property === 'text') {
            const textElement = element.querySelector('h1, h2, h3, p');
            return textElement?.textContent || '';
          } else if (property === 'fontSize') {
            const textElement = element.querySelector('h1, h2, h3, p');
            return textElement?.style.fontSize || '';
          } else if (property === 'color') {
            const textElement = element.querySelector('h1, h2, h3, p');
            return textElement?.style.color || '';
          } else if (property === 'backgroundColor') {
            return element.style.backgroundColor || '';
          } else if (property === 'alignment') {
            return element.style.textAlign || '';
          }
        } else if (component.type === 'button' || component.type === 'button-outline') {
          const button = element.querySelector('a');
          if (button) {
            if (property === 'text') {
              return button.textContent || '';
            } else if (property === 'url') {
              return button.getAttribute('href') || '';
            } else if (property === 'backgroundColor') {
              return button.style.backgroundColor || '';
            } else if (property === 'textColor') {
              return button.style.color || '';
            } else if (property === 'borderRadius') {
              return button.style.borderRadius === '999px'
                ? 'pill'
                : button.style.borderRadius || '';
            }
          }

          if (property === 'alignment') {
            return element.style.textAlign || '';
          }
        } else if (component.type === 'image') {
          const img = element.querySelector('img');
          if (img) {
            if (property === 'src') {
              return img.getAttribute('src') || '';
            } else if (property === 'alt') {
              return img.getAttribute('alt') || '';
            }
          }

          if (property === 'alignment') {
            return element.style.textAlign || '';
          }

          if (property === 'link') {
            const link = element.querySelector('a');
            return link?.getAttribute('href') || '';
          }
        } else if (component.type === 'quote') {
          if (property === 'text') {
            const quote = element.querySelector('blockquote');
            return quote?.textContent || '';
          } else if (property === 'author') {
            const author = element.querySelector('p');
            if (author) {
              const text = author.textContent || '';
              return text.startsWith('- ') ? text.substring(2) : text;
            }
          } else if (property === 'backgroundColor') {
            return element.style.backgroundColor || '';
          } else if (property === 'borderColor') {
            return element.style.borderLeftColor || '';
          }
        } else if (component.type === 'section') {
          if (property === 'backgroundColor') {
            return element.style.backgroundColor || '';
          } else if (property === 'padding') {
            return element.style.padding || '';
          }
        } else if (component.type === 'spacer') {
          if (property === 'height') {
            return element.style.height || '';
          }
        } else if (component.type === 'divider') {
          const hr = element.querySelector('hr');
          if (hr) {
            if (property === 'color') {
              return hr.style.borderColor || '';
            } else if (property === 'style') {
              return hr.style.borderStyle || '';
            } else if (property === 'thickness') {
              return hr.style.borderWidth || '';
            }
          }
        } else if (component.type === 'footer') {
          if (property === 'text') {
            const copyright = element.querySelector('p');
            return copyright?.textContent || '';
          } else if (property === 'backgroundColor') {
            return element.style.backgroundColor || '';
          } else if (property === 'textColor') {
            const paragraph = element.querySelector('p');
            return paragraph?.style.color || '';
          }
        }
      } catch (error) {
        console.error('Error getting property value:', error);
      }

      return '';
    },
    [selectedComponent, editorContent]
  );

  // Render property editor based on property type
  const renderPropertyEditor = useCallback(
    (property: PropertyDefinition) => {
      const value = getPropertyValue(property.name);

      switch (property.type) {
        case 'text':
          return (
            <Input
              id={`property-${property.name}`}
              type="text"
              value={value}
              onChange={e => handlePropertyChange(property.name, e.target.value)}
              placeholder={property.label}
            />
          );
        case 'textarea':
          return (
            <Textarea
              id={`property-${property.name}`}
              value={value}
              onChange={e => handlePropertyChange(property.name, e.target.value)}
              placeholder={property.label}
              rows={4}
            />
          );
        case 'select':
          return (
            <Select value={value} onValueChange={val => handlePropertyChange(property.name, val)}>
              <SelectTrigger id={`property-${property.name}`}>
                <SelectValue placeholder={property.label} />
              </SelectTrigger>
              <SelectContent>
                {property.options?.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'color':
          return (
            <div className="flex gap-2 items-center">
              <div
                className="w-6 h-6 border rounded-md cursor-pointer"
                style={{ backgroundColor: value || '#ffffff' }}
                onClick={() => setEditingProperty(property)}
              />
              <Input
                id={`property-${property.name}`}
                type="text"
                value={value}
                onChange={e => handlePropertyChange(property.name, e.target.value)}
                placeholder={property.label}
              />
              {editingProperty?.name === property.name && (
                <Dialog open={true} onOpenChange={() => setEditingProperty(null)}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Choose a color</DialogTitle>
                      <DialogDescription>Select a color or enter a hex code</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-10 gap-2">
                      {[
                        '#000000',
                        '#ffffff',
                        '#f44336',
                        '#e91e63',
                        '#9c27b0',
                        '#673ab7',
                        '#3f51b5',
                        '#2196f3',
                        '#03a9f4',
                        '#00bcd4',
                        '#009688',
                        '#4caf50',
                        '#8bc34a',
                        '#cddc39',
                        '#ffeb3b',
                        '#ffc107',
                        '#ff9800',
                        '#ff5722',
                        '#795548',
                        '#9e9e9e',
                        '#607d8b',
                        '#f5f5f5',
                        '#eeeeee',
                        '#e0e0e0',
                        '#bdbdbd',
                        '#757575',
                        '#616161',
                        '#424242',
                        '#212121',
                      ].map((color, index) => (
                        <div
                          key={`${color}-${index}`}
                          className="w-6 h-6 border rounded-md cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            handlePropertyChange(property.name, color);
                            setEditingProperty(null);
                          }}
                        />
                      ))}
                    </div>
                    <DialogFooter className="mt-4">
                      <Button variant="outline" onClick={() => setEditingProperty(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          handlePropertyChange(property.name, value);
                          setEditingProperty(null);
                        }}
                      >
                        Apply
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          );
        case 'number':
          return (
            <Input
              id={`property-${property.name}`}
              type="number"
              value={value}
              onChange={e => handlePropertyChange(property.name, e.target.value)}
              placeholder={property.label}
            />
          );
        case 'checkbox':
          return (
            <div className="flex items-center space-x-2">
              <input
                id={`property-${property.name}`}
                type="checkbox"
                checked={value === 'true'}
                onChange={e =>
                  handlePropertyChange(property.name, e.target.checked ? 'true' : 'false')
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor={`property-${property.name}`}
                className="text-sm font-medium text-gray-700"
              >
                {property.label}
              </label>
            </div>
          );
        default:
          return (
            <Input
              id={`property-${property.name}`}
              type="text"
              value={value}
              onChange={e => handlePropertyChange(property.name, e.target.value)}
              placeholder={property.label}
            />
          );
      }
    },
    [getPropertyValue, handlePropertyChange, editingProperty]
  );

  // Template selection screen
  if (isSelectingPreset) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Choose a Template</h1>
            <p className="text-muted-foreground">Start with a preset or design from scratch</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setIsSelectingPreset(false);
              if (currentTemplate) {
                setCurrentTemplate(null);
              }
            }}
            className="flex gap-1.5 items-center"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-dashed bg-muted/30"
            onClick={handleStartFromScratch}
          >
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <Plus className="h-12 w-12 text-blue-300" />
            </div>
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-lg">Start from Scratch</CardTitle>
              <CardDescription>Create a custom template with a blank canvas</CardDescription>
            </CardHeader>
          </Card>

          {templatePresets.map(preset => (
            <Card
              key={preset.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectPreset(preset)}
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

  // Template editor view
  if (isEditing) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {currentTemplate ? `Editing: ${currentTemplate.name}` : 'Create Template'}
            </h1>
            <p className="text-muted-foreground">
              {currentTemplate
                ? 'Modify your email template'
                : 'Design a new email template with drag-and-drop components'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
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
            <div className="hidden sm:flex items-center border rounded-md">
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

            {/* Device preview selector (only visible when preview is active) */}
            {showPreview && (
              <div className="hidden sm:flex items-center border rounded-md">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setPreviewMode('desktop')}
                        className="h-9 w-9 rounded-r-none"
                        aria-label="Desktop preview"
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
                        aria-label="Tablet preview"
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
                        aria-label="Mobile preview"
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mobile</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* Autosave toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden md:flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-9"
                      onClick={() => setIsAutosaveEnabled(!isAutosaveEnabled)}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isAutosaveEnabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                      <span className="text-xs text-muted-foreground">
                        {isAutosaveEnabled ? 'Autosave on' : 'Autosave off'}
                      </span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isAutosaveEnabled ? 'Disable autosave' : 'Enable autosave'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Template presets button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsSelectingPreset(true)}
                    className="h-9 w-9"
                    aria-label="Template presets"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Template presets</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Save actions */}
            <Button
              variant="outline"
              onClick={() => {
                if (editorContent.length > 0 && !currentTemplate) {
                  // Show confirmation for unsaved new template
                  if (window.confirm('Discard this template? All changes will be lost.')) {
                    setIsEditing(false);
                    setShowPreview(false);
                    setCurrentTemplate(null);
                  }
                } else {
                  setIsEditing(false);
                  setShowPreview(false);
                  setCurrentTemplate(null);
                  toast({
                    title: 'Changes discarded',
                    description: 'Your changes were not saved.',
                  });
                }
              }}
              className="ml-2"
            >
              Cancel
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>Save template (Ctrl+S)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Main editor grid */}
        <div
          className={cn(
            'grid gap-6',
            showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-12'
          )}
        >
          {/* Left side: Components and properties */}
          {!showPreview && (
            <div className="md:col-span-3 space-y-4">
              {/* Template details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Template Details</CardTitle>
                  <CardDescription>Basic information about your template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={newTemplateName}
                      onChange={e => setNewTemplateName(e.target.value)}
                      placeholder="e.g., Welcome Email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      value={newTemplateDescription}
                      onChange={e => setNewTemplateDescription(e.target.value)}
                      placeholder="e.g., For new customer onboarding"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Category</Label>
                    <Select
                      value={currentTemplate?.category || 'custom'}
                      onValueChange={value => {
                        if (currentTemplate) {
                          setCurrentTemplate({
                            ...currentTemplate,
                            category: value,
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="template-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(c => c !== 'all')
                          .map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Last saved information */}
                  {lastSaved && (
                    <div className="text-xs text-muted-foreground flex items-center mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}

                  {/* Keyboard shortcuts */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="shortcuts">
                      <AccordionTrigger className="text-sm text-muted-foreground">
                        Keyboard shortcuts
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-xs space-y-1 pt-2">
                          <div className="flex justify-between">
                            <span>Save template</span>
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+S</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Undo</span>
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+Z</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Redo</span>
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+Y</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Toggle preview</span>
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+P</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Delete component</span>
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Delete</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Exit/Cancel</span>
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Component selector or property editor */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  {selectedComponent !== null ? (
                    <>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Edit Component</CardTitle>
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDuplicateComponent(selectedComponent)}
                                  className="h-7 w-7"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Duplicate component</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedComponent(null)}
                                  className="h-7 w-7"
                                >
                                  <CornerUpLeft className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Back to components</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <CardDescription>
                        Customize the{' '}
                        {editorContent[selectedComponent]?.name.toLowerCase() || 'selected'}{' '}
                        component
                      </CardDescription>
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-lg">Components</CardTitle>
                      <CardDescription>
                        Drag and drop components to build your template
                      </CardDescription>
                    </>
                  )}
                </CardHeader>

                <div className={cn('border-t', selectedComponent === null && 'px-2 py-2')}>
                  {selectedComponent !== null ? (
                    <div className="p-4 space-y-4">
                      {getEditableProperties().map(property => (
                        <div key={property.name} className="space-y-2">
                          <Label htmlFor={`property-${property.name}`}>{property.label}</Label>
                          {renderPropertyEditor(property)}
                        </div>
                      ))}

                      {getEditableProperties().length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="mb-2">No editable properties available</p>
                          <p className="text-sm">This component cannot be customized.</p>
                        </div>
                      )}

                      <div className="pt-4 flex justify-between">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveComponent(selectedComponent)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedComponent(null)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Category tabs */}
                      <div className="flex overflow-x-auto pb-1 mb-1">
                        {componentCategories.map(category => {
                          // Use a safe and direct approach - manually render the icon based on name
                          const IconToRender = safeIcons[category.icon] || MoreVertical;

                          return (
                            <Button
                              key={category.id}
                              variant={
                                activeComponentCategory === category.id ? 'secondary' : 'ghost'
                              }
                              size="sm"
                              className="flex-shrink-0 px-3"
                              onClick={() => setActiveComponentCategory(category.id)}
                            >
                              {/* Direct rendering of the icon component */}
                              <IconToRender className="h-4 w-4 mr-1.5" />
                              {category.name}
                            </Button>
                          );
                        })}
                      </div>

                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-2 pb-2">
                          {EmailEditorComponents.filter(
                            component => component.category === activeComponentCategory
                          ).map(component => {
                            // Direct rendering using the icon from our safe icons object
                            const IconToRender = safeIcons[component.icon] || Box;

                            return (
                              <div
                                key={component.id}
                                draggable
                                onDragStart={() => handleDragStart(component)}
                                className="cursor-move rounded-md border border-border p-3 hover:bg-accent group flex items-center gap-3 relative"
                              >
                                <IconToRender className="h-5 w-5 text-muted-foreground" />
                                <span>{component.name}</span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute right-3" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {component.description || component.name}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Right side: Email editor or preview */}
          <div className={showPreview ? 'w-full' : 'md:col-span-9'}>
            <Card className="overflow-hidden h-full">
              <CardHeader className="pb-3 flex-row justify-between items-center space-y-0">
                <CardTitle className="text-lg">
                  {showPreview ? 'Email Preview' : 'Email Designer'}
                </CardTitle>
                {showPreview && (
                  <div className="flex sm:hidden items-center border rounded-md">
                    <Button
                      variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setPreviewMode('desktop')}
                      className="h-9 w-9 rounded-r-none"
                      aria-label="Desktop preview"
                    >
                      <Laptop className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setPreviewMode('tablet')}
                      className="h-9 w-9 rounded-l-none rounded-r-none"
                      aria-label="Tablet preview"
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setPreviewMode('mobile')}
                      className="h-9 w-9 rounded-l-none"
                      aria-label="Mobile preview"
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-0">
                {showPreview ? (
                  <div
                    className={cn(
                      'border-t flex items-center justify-center bg-slate-50 p-4 h-[700px]',
                      previewMode === 'desktop'
                        ? 'px-4'
                        : previewMode === 'tablet'
                        ? 'px-10'
                        : 'px-16'
                    )}
                  >
                    <div
                      className={cn(
                        'border shadow-sm bg-white h-full overflow-auto transition-all',
                        previewMode === 'desktop'
                          ? 'w-full'
                          : previewMode === 'tablet'
                          ? 'w-[768px]'
                          : 'w-[375px]'
                      )}
                    >
                      <iframe
                        ref={previewIframeRef}
                        className="w-full h-full"
                        title="Email Preview"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-t h-[700px] overflow-auto bg-slate-50"
                    onDragOver={handleDragOver}
                  >
                    <div className="max-w-2xl mx-auto border-x border-dashed border-gray-300 min-h-full bg-white">
                      {editorContent.length === 0 ? (
                        <div
                          className="flex items-center justify-center h-full text-center p-8 text-muted-foreground"
                          onDragOver={handleDragOver}
                          onDrop={e => handleDrop(e, 0)}
                        >
                          <div>
                            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Your Email is Empty</h3>
                            <p className="mb-4">
                              Drag components from the left sidebar to add them to your template.
                            </p>
                            <Button variant="outline" onClick={() => setIsSelectingPreset(true)}>
                              <LayoutGrid className="h-4 w-4 mr-2" />
                              Choose a Template
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Initial drop zone */}
                          <div
                            className="h-4 w-full transition-all duration-200 hover:h-12 flex items-center justify-center"
                            onDragOver={handleDragOver}
                            onDrop={e => handleDrop(e, 0)}
                          >
                            <div className="w-full h-0.5 bg-blue-500 opacity-0 hover:opacity-100"></div>
                          </div>

                          {/* Components */}
                          {editorContent.map((component, index) => (
                            <div key={component.id} className="relative group">
                              <div
                                dangerouslySetInnerHTML={{ __html: component.content }}
                                onClick={() => setSelectedComponent(index)}
                                className={cn(
                                  'relative transition-all',
                                  selectedComponent === index &&
                                    'outline outline-2 outline-blue-500'
                                )}
                              />

                              {/* Component controls */}
                              <div className="absolute top-1 right-1 hidden group-hover:flex bg-white border rounded-md shadow-sm">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setSelectedComponent(index)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Edit component</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDuplicateComponent(index)}
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      Duplicate component
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => handleRemoveComponent(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Remove component</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 cursor-move"
                                        draggable
                                        onDragStart={() => handleDragStart(`${index}`)}
                                      >
                                        <MoveHorizontal className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">Move component</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              {/* Component type label */}
                              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                  {component.name}
                                </div>
                              </div>

                              {/* Drop zone between components */}
                              <div
                                className="h-4 w-full transition-all duration-200 hover:h-12 flex items-center justify-center"
                                onDragOver={handleDragOver}
                                onDrop={e => handleDrop(e, index + 1)}
                              >
                                <div className="w-full h-0.5 bg-blue-500 opacity-0 hover:opacity-100"></div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Template library view (default)
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Design and manage reusable email templates</p>
        </div>
        <Button onClick={handleCreateTemplate} className="gap-1.5">
          <FilePlus className="h-4 w-4" />
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
            <Mail className="h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="mb-4 mt-2 text-muted-foreground">
              {searchQuery
                ? `No templates match "${searchQuery}". Try a different search.`
                : "You haven't created any templates yet. Create your first one to get started."}
            </p>
            <Button onClick={handleCreateTemplate}>
              <FilePlus className="mr-2 h-4 w-4" />
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
                    <Button size="sm" className="h-8" onClick={() => handleEditTemplate(template)}>
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
                <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
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
