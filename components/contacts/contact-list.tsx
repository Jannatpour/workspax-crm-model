import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useHotkeys } from 'react-hotkeys-hook';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/sonner';
import {
  Search,
  Mail,
  MoreHorizontal,
  UserPlus,
  Import,
  Star,
  Download,
  Filter,
  Users,
  Tag,
  Trash2,
  User,
  Phone,
  Building,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  CheckCheck,
  Plus,
  PencilLine,
  MoreVertical,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  FileText,
  BarChart,
  History,
  AlertTriangle,
  CheckCircle2,
  Trash,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import useContactAI from '@/hooks/useContactAI';
import useContactGroups from '@/hooks/useContactGroups';
import useContactAnalytics from '@/hooks/useContactAnalytics';
import useContactPermissions from '@/hooks/useContactPermissions';
import useScreenSize from '@/hooks/useScreenSize';
import { cn } from '@/lib/utils';

import { sortContacts, filterContacts, getInitials, formatPhone } from '@/lib/contact-utils';

// =============================================
// Type Definitions
// =============================================

/**
 * Engagement score type representing the level of interaction with a contact
 */
type EngagementScore = 'high' | 'medium' | 'low' | 'none';

/**
 * Contact status in the CRM system
 */
type ContactStatus = 'active' | 'inactive' | 'lead' | 'customer' | 'prospect' | 'archived';

/**
 * Tag object representing a label that can be applied to contacts
 */
interface Tag {
  id: string;
  name: string;
  color: string;
}

/**
 * Contact Group representing a collection of contacts
 */
interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  count: number;
  isSmartGroup?: boolean;
  smartCriteria?: Record<string, unknown>;
}

/**
 * Activity representing an interaction with a contact
 */
interface ContactActivity {
  id: string;
  contactId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'other';
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

/**
 * Contact model with all properties
 */
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  isStarred?: boolean;
  avatarUrl?: string;
  tags?: Tag[];
  status?: ContactStatus;
  engagementScore?: EngagementScore;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  notes?: string;
  groups?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    other?: Record<string, string>;
  };
  customFields?: Record<string, string | number | unknown>;
  createdAt: string;
  updatedAt: string;
  aiSuggestions?: {
    tags?: Tag[];
    groups?: string[];
    followUpDate?: string;
    similarContacts?: string[];
    insights?: string[];
  };
  activities?: ContactActivity[];
  duplicationScore?: number;
  potentialDuplicates?: string[];
  accessLevel?: 'private' | 'team' | 'public';
  owner?: string;
  metaData?: Record<string, string | number | unknown>;
}

/**
 * Props for the ContactList component
 */
interface ContactListProps {
  /**
   * Array of contact objects to display in the list
   */
  contacts: Contact[];

  /**
   * Initial loading state
   */
  initialLoading?: boolean;

  /**
   * Callback when import button is clicked
   */
  onImport?: () => void;

  /**
   * Callback to delete contacts by IDs
   */
  onDelete?: (ids: string[]) => void;

  /**
   * Callback to email contacts by IDs
   */
  onEmail?: (ids: string[]) => void;

  /**
   * Callback to toggle star status
   */
  onStar?: (id: string, starred: boolean) => void;

  /**
   * Callback to export contacts by IDs
   */
  onExport?: (ids: string[], format: 'csv' | 'vcf' | 'json') => void;

  /**
   * Callback to refresh the contacts list
   */
  onRefresh?: () => Promise<void>;

  /**
   * Callback when contact is moved to a group
   */
  onMoveToGroup?: (contactIds: string[], groupId: string) => Promise<void>;

  /**
   * Callback when a new tag is applied to contacts
   */
  onTagContacts?: (contactIds: string[], tagIds: string[]) => Promise<void>;

  /**
   * Callback to merge duplicate contacts
   */
  onMergeContacts?: (contacts: string[]) => Promise<void>;

  /**
   * Optional callback when a contact is updated
   */
  onContactUpdated?: (contact: Contact) => void;

  /**
   * Available tags for contacts
   */
  availableTags?: Tag[];

  /**
   * Callback to create a new tag
   */
  onCreateTag?: (name: string, color: string) => Promise<Tag>;

  /**
   * Enable AI features
   */
  enableAI?: boolean;

  /**
   * AI model context for advanced features
   */
  aiModelContext?: string;

  /**
   * Available contact groups
   */
  availableGroups?: ContactGroup[];

  /**
   * Enable advanced filtering
   */
  enableAdvancedFiltering?: boolean;

  /**
   * Enable contact analytics
   */
  enableAnalytics?: boolean;

  /**
   * Default view mode
   */
  defaultViewMode?: 'table' | 'cards' | 'compact';

  /**
   * Custom CSS className
   */
  className?: string;

  /**
   * Custom data test ID for testing
   */
  dataTestId?: string;
}

/**
 * Filter options for contacts
 */
interface FilterOptions {
  status?: ContactStatus[];
  tags?: string[];
  groups?: string[];
  engagementScore?: EngagementScore[];
  dateRange?: {
    field: 'createdAt' | 'updatedAt' | 'lastContactedAt' | 'nextFollowUpDate';
    start: string | null;
    end: string | null;
  };
  customFields?: Record<string, string | number | unknown>;
}

/**
 * Sort options for contacts
 */
interface SortOptions {
  field:
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'company'
    | 'createdAt'
    | 'updatedAt'
    | 'lastContactedAt'
    | 'engagementScore';
  direction: 'asc' | 'desc';
}

/**
 * Contact list view mode
 */
type ViewMode = 'table' | 'cards' | 'compact';

/**
 * Status indicator for contacts
 */
const ContactStatusIndicator = ({ status }: { status: ContactStatus }) => {
  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-400';
      case 'lead':
        return 'bg-blue-500';
      case 'customer':
        return 'bg-purple-500';
      case 'prospect':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-red-300';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
      <span className="text-xs capitalize">{status}</span>
    </div>
  );
};

/**
 * Tag badge component for contacts
 */
const TagBadge = ({ tag, onRemove }: { tag: Tag; onRemove?: () => void }) => {
  return (
    <Badge
      variant="outline"
      className="gap-1 h-5 px-1.5 text-xs flex items-center"
      style={{
        backgroundColor: `${tag.color}10`,
        borderColor: tag.color,
        color: tag.color,
      }}
    >
      {tag.name}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-3 w-3 p-0 text-muted-foreground hover:bg-transparent"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-2 w-2" />
        </Button>
      )}
    </Badge>
  );
};

/**
 * Engagement score indicator component
 */
const EngagementScoreIndicator = ({ score }: { score: EngagementScore }) => {
  const getScoreColor = (score: EngagementScore) => {
    switch (score) {
      case 'high':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-orange-500';
      case 'none':
      default:
        return 'bg-gray-300';
    }
  };

  const getScoreWidth = (score: EngagementScore) => {
    switch (score) {
      case 'high':
        return 'w-full';
      case 'medium':
        return 'w-2/3';
      case 'low':
        return 'w-1/3';
      case 'none':
      default:
        return 'w-0';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full rounded-full ${getScoreColor(
                score
              )} ${getScoreWidth(score)}`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{score} engagement</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Loading skeleton for contact list
 */
const ContactListSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-[300px]" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[120px]" />
        </div>
      </div>

      <div className="border rounded-md">
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-8" />
          </div>

          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 py-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  );
};

/**
 * Empty state component when no contacts are found
 */
const EmptyState = ({
  query,
  onAdd,
  onImport,
}: {
  query?: string;
  onAdd?: () => void;
  onImport?: () => void;
}) => {
  return (
    <div className="border rounded-md py-16 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-primary/10 p-3 rounded-full mb-4">
        <Users className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {query ? `No contacts matching "${query}"` : 'No contacts yet'}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {query
          ? "Try adjusting your search or filters to find what you're looking for."
          : 'Add your first contact to get started, or import contacts from another service.'}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {onAdd && (
          <Button onClick={onAdd}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        )}
        {onImport && (
          <Button variant="outline" onClick={onImport}>
            <Import className="h-4 w-4 mr-2" />
            Import Contacts
          </Button>
        )}
        {query && (
          <Button variant="outline" onClick={() => (window.location.search = '')}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Card view for contacts
 */
const ContactCard = ({
  contact,
  isSelected,
  onSelect,
  onStar,
  onEmail,
  onDelete,
  onAction,
}: {
  contact: Contact;
  isSelected: boolean;
  onSelect: () => void;
  onStar: (id: string, starred: boolean) => void;
  onEmail?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  onAction?: (action: string, contact: Contact) => void;
  selectedAction?: string;
}) => {
  return (
    <Card
      className={cn(
        'transition-all',
        isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50'
      )}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect()}
            aria-label={`Select ${contact.firstName} ${contact.lastName}`}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onStar(contact.id, !contact.isStarred)}
          >
            <Star
              className={`h-4 w-4 ${
                contact.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              }`}
            />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          {contact.status && (
            <Badge variant="outline" className="h-6 capitalize text-xs">
              {contact.status}
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/contacts/${contact.id}`} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  View Contact
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/contacts/${contact.id}/edit`} className="cursor-pointer">
                  <PencilLine className="h-4 w-4 mr-2" />
                  Edit Contact
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEmail && onEmail([contact.id])}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction && onAction('add-note', contact)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction && onAction('view-history', contact)}>
                <History className="h-4 w-4 mr-2" />
                View History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete && onDelete([contact.id])}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            {contact.avatarUrl ? (
              <AvatarImage
                src={contact.avatarUrl}
                alt={`${contact.firstName} ${contact.lastName}`}
              />
            ) : (
              <AvatarFallback>
                {getInitials(`${contact.firstName} ${contact.lastName}`)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <Link
              href={`/dashboard/contacts/${contact.id}`}
              className="font-medium text-sm hover:underline"
            >
              {contact.firstName} {contact.lastName}
            </Link>
            {contact.title && <p className="text-sm text-muted-foreground">{contact.title}</p>}
          </div>
        </div>

        <div className="space-y-2 mt-3">
          <div className="flex items-center text-sm">
            <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <a href={`mailto:${contact.email}`} className="text-sm hover:underline truncate">
              {contact.email}
            </a>
          </div>

          {contact.phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                {formatPhone(contact.phone)}
              </a>
            </div>
          )}

          {contact.company && (
            <div className="flex items-center text-sm">
              <Building className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span>{contact.company}</span>
            </div>
          )}
        </div>

        {contact.tags && contact.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5 mt-1">
              {contact.tags.slice(0, 3).map(tag => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
              {contact.tags.length > 3 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="h-5 px-1.5 text-xs">
                        +{contact.tags.length - 3}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {contact.tags.slice(3).map(tag => (
                          <TagBadge key={tag.id} tag={tag} />
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}

        {contact.lastContactedAt && (
          <div className="mt-3 text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last contacted: {new Date(contact.lastContactedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
      {contact.engagementScore && (
        <CardFooter className="p-3 pt-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Engagement</span>
          <EngagementScoreIndicator score={contact.engagementScore} />
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Confirmation dialog for bulk actions
 */
const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  onConfirm,
  destructive = false,
  contactCount = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => void;
  destructive?: boolean;
  contactCount?: number;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description.replace('{count}', contactCount.toString())}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Filter dialog component
 */
const FilterDialog = ({
  open,
  onOpenChange,
  filterOptions,
  onFilterChange,
  availableTags = [],
  availableGroups = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableTags?: Tag[];
  availableGroups?: ContactGroup[];
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filterOptions);

  // Reset local filters when the dialog opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filterOptions);
    }
  }, [open, filterOptions]);

  const handleStatusChange = (status: ContactStatus) => {
    setLocalFilters(prev => {
      const currentStatuses = prev.status || [];
      return {
        ...prev,
        status: currentStatuses.includes(status)
          ? currentStatuses.filter(s => s !== status)
          : [...currentStatuses, status],
      };
    });
  };

  const handleTagChange = (tagId: string) => {
    setLocalFilters(prev => {
      const currentTags = prev.tags || [];
      return {
        ...prev,
        tags: currentTags.includes(tagId)
          ? currentTags.filter(t => t !== tagId)
          : [...currentTags, tagId],
      };
    });
  };

  const handleGroupChange = (groupId: string) => {
    setLocalFilters(prev => {
      const currentGroups = prev.groups || [];
      return {
        ...prev,
        groups: currentGroups.includes(groupId)
          ? currentGroups.filter(g => g !== groupId)
          : [...currentGroups, groupId],
      };
    });
  };

  const handleEngagementChange = (score: EngagementScore) => {
    setLocalFilters(prev => {
      const currentScores = prev.engagementScore || [];
      return {
        ...prev,
        engagementScore: currentScores.includes(score)
          ? currentScores.filter(s => s !== score)
          : [...currentScores, score],
      };
    });
  };

  const handleDateRangeChange = (
    field: 'createdAt' | 'updatedAt' | 'lastContactedAt' | 'nextFollowUpDate',
    start: string | null,
    end: string | null
  ) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        field,
        start,
        end,
      },
    }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    onOpenChange(false);
  };

  const handleResetFilters = () => {
    const emptyFilters: FilterOptions = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
    onOpenChange(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.status && localFilters.status.length) count += 1;
    if (localFilters.tags && localFilters.tags.length) count += 1;
    if (localFilters.groups && localFilters.groups.length) count += 1;
    if (localFilters.engagementScore && localFilters.engagementScore.length) count += 1;
    if (localFilters.dateRange && (localFilters.dateRange.start || localFilters.dateRange.end))
      count += 1;
    if (localFilters.customFields && Object.keys(localFilters.customFields).length) count += 1;
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filter Contacts</span>
            <Badge variant="secondary" className="ml-2">
              {getActiveFilterCount()} active
            </Badge>
          </DialogTitle>
          <DialogDescription>Filter your contacts by various criteria.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {/* Status filter */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {['active', 'inactive', 'lead', 'customer', 'prospect', 'archived'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={(localFilters.status || []).includes(status as ContactStatus)}
                      onCheckedChange={() => handleStatusChange(status as ContactStatus)}
                    />
                    <Label htmlFor={`status-${status}`} className="capitalize">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags filter */}
            {availableTags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={(localFilters.tags || []).includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      style={{
                        backgroundColor: (localFilters.tags || []).includes(tag.id)
                          ? tag.color
                          : 'transparent',
                        borderColor: tag.color,
                        color: (localFilters.tags || []).includes(tag.id) ? 'white' : tag.color,
                      }}
                      onClick={() => handleTagChange(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {availableTags.length > 0 && <Separator />}

            {/* Groups filter */}
            {availableGroups.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm">Groups</h4>
                <div className="space-y-2">
                  {availableGroups.map(group => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={(localFilters.groups || []).includes(group.id)}
                        onCheckedChange={() => handleGroupChange(group.id)}
                      />
                      <Label htmlFor={`group-${group.id}`} className="flex items-center">
                        {group.name}
                        {group.isSmartGroup && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Sparkles className="h-3 w-3 ml-1 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Smart Group</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Badge variant="outline" className="ml-2 h-5 text-xs">
                          {group.count}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableGroups.length > 0 && <Separator />}

            {/* Engagement score filter */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Engagement Score</h4>
              <div className="grid grid-cols-2 gap-2">
                {['high', 'medium', 'low', 'none'].map(score => (
                  <div key={score} className="flex items-center space-x-2">
                    <Checkbox
                      id={`score-${score}`}
                      checked={(localFilters.engagementScore || []).includes(
                        score as EngagementScore
                      )}
                      onCheckedChange={() => handleEngagementChange(score as EngagementScore)}
                    />
                    <Label htmlFor={`score-${score}`} className="capitalize">
                      {score}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Date range filter */}
            <div>
              <h4 className="font-medium mb-2 text-sm">Date Range</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="date-field" className="min-w-[80px]">
                    Date field
                  </Label>
                  <select
                    id="date-field"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={localFilters.dateRange?.field || 'createdAt'}
                    onChange={e =>
                      handleDateRangeChange(
                        e.target.value as
                          | 'createdAt'
                          | 'updatedAt'
                          | 'lastContactedAt'
                          | 'nextFollowUpDate',
                        localFilters.dateRange?.start || null,
                        localFilters.dateRange?.end || null
                      )
                    }
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="updatedAt">Updated Date</option>
                    <option value="lastContactedAt">Last Contacted</option>
                    <option value="nextFollowUpDate">Next Follow-up</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="date-start" className="min-w-[80px]">
                    Start date
                  </Label>
                  <Input
                    id="date-start"
                    type="date"
                    value={localFilters.dateRange?.start || ''}
                    onChange={e =>
                      handleDateRangeChange(
                        localFilters.dateRange?.field || 'createdAt',
                        e.target.value || null,
                        localFilters.dateRange?.end || null
                      )
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor="date-end" className="min-w-[80px]">
                    End date
                  </Label>
                  <Input
                    id="date-end"
                    type="date"
                    value={localFilters.dateRange?.end || ''}
                    onChange={e =>
                      handleDateRangeChange(
                        localFilters.dateRange?.field || 'createdAt',
                        localFilters.dateRange?.start || null,
                        e.target.value || null
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleResetFilters}>
            Reset Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * AI Recommendations Dialog
 */
const AIRecommendationsDialog = ({
  open,
  onOpenChange,
  selectedContacts,
  allContacts,
  onApplyRecommendation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContacts: Contact[];
  allContacts: Contact[];
  onApplyRecommendation: (type: string, data: string | number | unknown) => void;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<{
    suggestedTags: Tag[];
    suggestedGroups: string[];
    similarContacts: Contact[];
    potentialDuplicates: Contact[];
    followUpRecommendations: { contactId: string; date: string; reason: string }[];
    insights: string[];
  } | null>(null);

  // Simulated AI recommendations loading
  useEffect(() => {
    if (open) {
      setLoading(true);
      // Simulate API call to get AI recommendations
      setTimeout(() => {
        setRecommendations({
          suggestedTags: [
            { id: 'tag1', name: 'VIP', color: '#FF5630' },
            { id: 'tag2', name: 'Decision Maker', color: '#36B37E' },
            { id: 'tag3', name: 'Technical', color: '#6554C0' },
          ],
          suggestedGroups: ['group1', 'group3'],
          similarContacts: allContacts.slice(0, 3),
          potentialDuplicates:
            selectedContacts.length > 0 ? [{ ...allContacts[0], duplicationScore: 0.85 }] : [],
          followUpRecommendations: [
            {
              contactId: selectedContacts[0]?.id || '',
              date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              reason: 'Based on previous engagement patterns and recent activity',
            },
          ],
          insights: [
            'These contacts are most active during mornings (8-10am)',
            'Email open rates are 35% higher than average',
            'Response time averages 2.3 days',
            'Communication frequency: Monthly',
          ],
        });
        setLoading(false);
      }, 1200);
    }
  }, [open, selectedContacts, allContacts]);

  const handleApply = (type: string, data: string | number | unknown) => {
    onApplyRecommendation(type, data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            AI Recommendations
          </DialogTitle>
          <DialogDescription>
            {selectedContacts.length > 0
              ? `AI-powered insights and recommendations for ${
                  selectedContacts.length
                } selected contact${selectedContacts.length > 1 ? 's' : ''}.`
              : 'AI-powered insights and recommendations for your contacts.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[220px]" />
              </div>
            </div>
            <Progress value={65} className="h-1" />
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {/* Suggested Tags */}
              {recommendations?.suggestedTags && recommendations.suggestedTags.length > 0 && (
                <div className="border rounded-md p-3">
                  <div className="flex items-center mb-2">
                    <Tag className="h-4 w-4 mr-2 text-primary" />
                    <h3 className="font-medium">Suggested Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recommendations.suggestedTags.map(tag => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApply('tags', recommendations.suggestedTags)}
                  >
                    Apply Tags
                  </Button>
                </div>
              )}

              {/* Follow-up Recommendations */}
              {recommendations?.followUpRecommendations &&
                recommendations.followUpRecommendations.length > 0 && (
                  <div className="border rounded-md p-3">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-medium">Follow-up Recommendations</h3>
                    </div>
                    <div className="space-y-2 mb-3">
                      {recommendations.followUpRecommendations.map((rec, index) => (
                        <div key={index} className="text-sm">
                          <p>
                            <span className="font-medium">Suggested follow-up:</span>{' '}
                            {new Date(rec.date).toLocaleDateString()}
                          </p>
                          <p className="text-muted-foreground text-xs">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleApply('followUp', recommendations.followUpRecommendations)
                      }
                    >
                      Schedule Follow-ups
                    </Button>
                  </div>
                )}

              {/* Insights */}
              {recommendations?.insights && recommendations.insights.length > 0 && (
                <div className="border rounded-md p-3">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                    <h3 className="font-medium">Insights</h3>
                  </div>
                  <ul className="space-y-1 mb-3 list-disc list-inside text-sm">
                    {recommendations.insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Potential Duplicates */}
              {recommendations?.potentialDuplicates &&
                recommendations.potentialDuplicates.length > 0 && (
                  <div className="border rounded-md p-3">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                      <h3 className="font-medium">Potential Duplicates</h3>
                    </div>
                    <div className="space-y-2 mb-3">
                      {recommendations.potentialDuplicates.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              {contact.avatarUrl ? (
                                <AvatarImage
                                  src={contact.avatarUrl}
                                  alt={`${contact.firstName} ${contact.lastName}`}
                                />
                              ) : (
                                <AvatarFallback>
                                  {getInitials(`${contact.firstName} ${contact.lastName}`)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {contact.firstName} {contact.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{contact.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="h-5">
                            {contact.duplicationScore &&
                              `${Math.round(contact.duplicationScore * 100)}% match`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApply('merge', recommendations.potentialDuplicates)}
                    >
                      Review & Merge
                    </Button>
                  </div>
                )}

              {/* Similar Contacts */}
              {recommendations?.similarContacts && recommendations.similarContacts.length > 0 && (
                <div className="border rounded-md p-3">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <h3 className="font-medium">Similar Contacts</h3>
                  </div>
                  <div className="space-y-2 mb-3">
                    {recommendations.similarContacts.map(contact => (
                      <div key={contact.id} className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          {contact.avatarUrl ? (
                            <AvatarImage
                              src={contact.avatarUrl}
                              alt={`${contact.firstName} ${contact.lastName}`}
                            />
                          ) : (
                            <AvatarFallback>
                              {getInitials(`${contact.firstName} ${contact.lastName}`)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="text-sm">
                          <span className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </span>
                          {contact.company && (
                            <span className="text-muted-foreground ml-1">· {contact.company}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApply('group', recommendations.similarContacts)}
                  >
                    Create Group
                  </Button>
                </div>
              )}
            </div>
            <ScrollBar />
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Tag Management Dialog
 */
const TagManagementDialog = ({
  open,
  onOpenChange,
  availableTags = [],
  selectedContactIds = [],
  onTagContacts,
  onCreateTag,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTags: Tag[];
  selectedContactIds: string[];
  onTagContacts?: (contactIds: string[], tagIds: string[]) => Promise<void>;
  onCreateTag?: (name: string, color: string) => Promise<Tag>;
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreatingTag, setIsCreatingTag] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>('');
  const [newTagColor, setNewTagColor] = useState<string>('#6366F1'); // Default color
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset selected tags when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTags([]);
      setIsCreatingTag(false);
      setNewTagName('');
    }
  }, [open]);

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleApplyTags = async () => {
    if (selectedTags.length === 0 || !onTagContacts) return;

    try {
      setIsSubmitting(true);
      await onTagContacts(selectedContactIds, selectedTags);
      onOpenChange(false);
    } catch (error) {
      console.error('Error applying tags:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;

    try {
      setIsSubmitting(true);
      const newTag = await onCreateTag(newTagName.trim(), newTagColor);
      setSelectedTags(prev => [...prev, newTag.id]);
      setIsCreatingTag(false);
      setNewTagName('');
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedColors = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#0EA5E9', // Sky
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            {selectedContactIds.length > 0
              ? `Apply tags to ${selectedContactIds.length} selected contact${
                  selectedContactIds.length > 1 ? 's' : ''
                }.`
              : 'Select contacts first to apply tags.'}
          </DialogDescription>
        </DialogHeader>

        {isCreatingTag ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="Enter tag name"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tag Color</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map(color => (
                  <div
                    key={color}
                    className={`h-6 w-6 rounded-full cursor-pointer ${
                      newTagColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsCreatingTag(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTag} disabled={!newTagName.trim() || isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Tag'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Available Tags</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingTag(true)}
                  className="h-8 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New Tag
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableTags.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No tags available. Create your first tag.
                  </div>
                ) : (
                  availableTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      style={{
                        backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                        borderColor: tag.color,
                        color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                      }}
                      onClick={() => toggleTagSelection(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApplyTags}
                disabled={
                  selectedTags.length === 0 || selectedContactIds.length === 0 || isSubmitting
                }
              >
                {isSubmitting ? 'Applying...' : 'Apply Tags'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main ContactList component
 */
export default function ContactList({
  contacts,
  initialLoading = false,
  onImport,
  onDelete,
  onEmail,
  onStar,
  onExport,
  onRefresh,
  onMoveToGroup,
  onTagContacts,
  onMergeContacts,
  onContactUpdated,
  availableTags = [],
  onCreateTag,
  enableAI = false,
  aiModelContext,
  availableGroups = [],
  enableAdvancedFiltering = false,
  enableAnalytics = false,
  defaultViewMode = 'table',
  className = '',
  dataTestId,
}: ContactListProps) {
  // ----- State -----
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'lastName',
    direction: 'asc',
  });
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [showFilterDialog, setShowFilterDialog] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState<boolean>(false);
  const [showTagsDialog, setShowTagsDialog] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'vcf' | 'json'>('csv');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [activeActionContact, setActiveActionContact] = useState<Contact | null>(null);

  // ----- Refs -----
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ----- Hooks -----
  const router = useRouter();
  const { toast } = useToast();
  const { isSmallScreen, isMediumScreen } = useScreenSize();
  const { canDelete, canEdit, canExport } = useContactPermissions();

  // AI hooks
  const { getContactRecommendations, enrichContact, findSimilarContacts, isEnriching } =
    useContactAI(aiModelContext);

  // Contact groups hook
  const { groups, addContactToGroup, removeContactFromGroup, createGroup } = useContactGroups();

  // Analytics hook
  const { getContactMetrics, trackContactViewed, trackContactAction } = useContactAnalytics();

  // ----- Computed Values -----

  // Apply filters and search to contacts
  const filteredContacts = useMemo(() => {
    // First filter by search query
    const searchFiltered = filterContacts(contacts, searchQuery, filterOptions);

    // Then sort the filtered results
    return sortContacts(searchFiltered, sortOptions.field, sortOptions.direction);
  }, [contacts, searchQuery, filterOptions, sortOptions]);

  // Paginate contacts
  const paginatedContacts = useMemo(() => {
    const indexOfLastContact = currentPage * itemsPerPage;
    const indexOfFirstContact = indexOfLastContact - itemsPerPage;
    return filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  }, [filteredContacts, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredContacts.length / itemsPerPage);
  }, [filteredContacts.length, itemsPerPage]);

  // Get contacts for the selected IDs
  const selectedContactObjects = useMemo(() => {
    return contacts.filter(contact => selectedContacts.includes(contact.id));
  }, [contacts, selectedContacts]);

  // Set up virtualization for large contact lists
  const rowVirtualizer = useVirtualizer({
    count: viewMode === 'table' ? paginatedContacts.length : 0,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 56, // Estimated row height
    overscan: 5,
  });

  // ----- Effects -----

  // Reset page when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterOptions]);

  // Handle keyboard shortcuts
  useHotkeys('ctrl+f', e => {
    e.preventDefault();
    searchInputRef.current?.focus();
  });

  useHotkeys('ctrl+a', e => {
    e.preventDefault();
    if (paginatedContacts.length > 0) {
      if (selectedContacts.length === paginatedContacts.length) {
        setSelectedContacts([]);
      } else {
        setSelectedContacts(paginatedContacts.map(contact => contact.id));
      }
    }
  });

  // ----- Event Handlers -----

  // Toggle selection of a single contact
  const toggleSelectContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(contactId => contactId !== id) : [...prev, id]
    );

    // Track selection for analytics
    trackContactAction('select', id);
  };

  // Toggle selection of all contacts on current page
  const toggleSelectAll = () => {
    if (selectedContacts.length === paginatedContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(paginatedContacts.map(contact => contact.id));
    }
  };

  // Handle starring a contact
  const handleStarContact = (id: string, starred: boolean) => {
    if (onStar) {
      onStar(id, starred);
    }

    // Track star action for analytics
    trackContactAction('star', id);
  };

  // Handle refreshing the contact list
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        toast({
          title: 'Contacts refreshed',
          description: 'Contact list has been updated with the latest data.',
        });
      } catch (error) {
        toast({
          title: 'Refresh failed',
          description: 'There was an error refreshing the contacts.',
          variant: 'destructive',
        });
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Handle adding a new contact
  const handleAddContact = () => {
    router.push('/dashboard/contacts/new');
  };

  // Handle deleting selected contacts
  const handleDeleteSelected = () => {
    setShowDeleteConfirmation(true);
  };

  // Confirm deletion of contacts
  const confirmDeleteContacts = () => {
    if (onDelete && selectedContacts.length > 0) {
      onDelete(selectedContacts);
      setSelectedContacts([]);
      toast({
        title: `${selectedContacts.length} contact${
          selectedContacts.length > 1 ? 's' : ''
        } deleted`,
        description: 'The selected contacts have been removed.',
      });
    }
  };

  // Handle emailing selected contacts
  const handleEmailSelected = () => {
    if (onEmail && selectedContacts.length > 0) {
      onEmail(selectedContacts);

      // Track email action for analytics
      trackContactAction('email', selectedContacts.join(','));
    }
  };

  // Handle exporting selected contacts
  const handleExportSelected = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: 'No contacts selected',
        description: 'Please select contacts to export.',
        variant: 'destructive',
      });
      return;
    }

    setShowExportDialog(true);
  };

  // Confirm export of contacts
  const confirmExportContacts = () => {
    if (onExport && selectedContacts.length > 0) {
      onExport(selectedContacts, exportFormat);
      toast({
        title: `${selectedContacts.length} contact${
          selectedContacts.length > 1 ? 's' : ''
        } exported`,
        description: `Contacts have been exported as ${exportFormat.toUpperCase()}.`,
      });
      setShowExportDialog(false);
    }
  };

  // Handle moving contacts to a group
  const handleMoveToGroup = async (groupId: string) => {
    if (onMoveToGroup && selectedContacts.length > 0) {
      try {
        await onMoveToGroup(selectedContacts, groupId);
        toast({
          title: `${selectedContacts.length} contact${
            selectedContacts.length > 1 ? 's' : ''
          } moved`,
          description: 'Contacts have been added to the selected group.',
        });
      } catch (error) {
        toast({
          title: 'Error moving contacts',
          description: 'There was an error moving the contacts to the group.',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle applying tags to contacts
  const handleTagContacts = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: 'No contacts selected',
        description: 'Please select contacts to tag.',
        variant: 'destructive',
      });
      return;
    }

    setShowTagsDialog(true);
  };

  // Handle applying AI recommendations
  const handleApplyAIRecommendation = (type: string, data: any) => {
    switch (type) {
      case 'tags':
        // Apply suggested tags
        if (onTagContacts && selectedContacts.length > 0) {
          onTagContacts(
            selectedContacts,
            data.map((tag: Tag) => tag.id)
          );
          toast({
            title: 'Tags applied',
            description: 'AI-recommended tags have been applied to the selected contacts.',
          });
        }
        break;
      case 'followUp':
        // Set follow-up dates
        toast({
          title: 'Follow-ups scheduled',
          description: 'AI-recommended follow-up dates have been scheduled.',
        });
        break;
      case 'merge':
        // Handle potential duplicates
        if (onMergeContacts && selectedContacts.length > 0 && data.length > 0) {
          onMergeContacts([...selectedContacts, ...data.map((c: Contact) => c.id)]);
          toast({
            title: 'Contacts merged',
            description: 'Duplicate contacts have been merged successfully.',
          });
        }
        break;
      case 'group':
        // Create a group from similar contacts
        toast({
          title: 'Group created',
          description: 'A new group has been created with similar contacts.',
        });
        break;
      default:
        break;
    }
  };

  // Handle contact-specific actions
  const handleContactAction = (action: string, contact: Contact) => {
    setActiveAction(action);
    setActiveActionContact(contact);

    // Track action for analytics
    trackContactAction(action, contact.id);

    switch (action) {
      case 'add-note':
        // Handle adding a note
        toast({
          title: 'Add note',
          description: `Add a note to ${contact.firstName} ${contact.lastName}.`,
        });
        break;
      case 'view-history':
        // Handle viewing history
        toast({
          title: 'View history',
          description: `View history for ${contact.firstName} ${contact.lastName}.`,
        });
        break;
      default:
        break;
    }
  };

  // Helper function to handle sort changes
  const handleSortChange = (field: SortOptions['field']) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ----- Render Functions -----

  // Render table view
  const renderTableView = () => {
    return (
      <div
        ref={tableContainerRef}
        className="border rounded-md overflow-auto"
        style={{ maxHeight: 'calc(100vh - 250px)' }}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    paginatedContacts.length > 0 &&
                    selectedContacts.length === paginatedContacts.length
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all contacts"
                />
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSortChange('lastName')}
                >
                  Name
                  {sortOptions.field === 'lastName' &&
                    (sortOptions.direction === 'asc' ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    ))}
                </div>
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSortChange('email')}
                >
                  Email
                  {sortOptions.field === 'email' &&
                    (sortOptions.direction === 'asc' ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    ))}
                </div>
              </TableHead>
              <TableHead className={isSmallScreen ? 'hidden' : ''}>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSortChange('company')}
                >
                  Company
                  {sortOptions.field === 'company' &&
                    (sortOptions.direction === 'asc' ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    ))}
                </div>
              </TableHead>
              <TableHead className={isMediumScreen ? 'hidden' : ''}>Title</TableHead>
              <TableHead className={isSmallScreen ? 'hidden' : ''}>Phone</TableHead>
              {enableAdvancedFiltering && (
                <TableHead className={isMediumScreen ? 'hidden' : ''}>Status</TableHead>
              )}
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={enableAdvancedFiltering ? 8 : 7}
                  className="text-center py-10 h-[200px]"
                >
                  {filteredContacts.length === 0 && searchQuery ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Search className="h-8 w-8 text-muted-foreground mb-2" />
                      <p>No contacts found matching "{searchQuery}"</p>
                      <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
                        Clear search
                      </Button>
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Users className="h-8 w-8 text-muted-foreground mb-2" />
                      <p>No contacts found</p>
                      <Button variant="link" onClick={handleAddContact} className="mt-2">
                        Add your first contact
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p>No contacts on this page</p>
                      <Button variant="link" onClick={() => setCurrentPage(1)} className="mt-2">
                        Go to first page
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              <tbody
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const contact = paginatedContacts[virtualRow.index];
                  return (
                    <TableRow
                      key={contact.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleSelectContact(contact.id)}
                          aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleStarContact(contact.id, !contact.isStarred)}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                contact.isStarred
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </Button>
                          <Avatar className="h-8 w-8 mr-2">
                            {contact.avatarUrl ? (
                              <AvatarImage
                                src={contact.avatarUrl}
                                alt={`${contact.firstName} ${contact.lastName}`}
                              />
                            ) : (
                              <AvatarFallback>
                                {getInitials(`${contact.firstName} ${contact.lastName}`)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <Link
                            href={`/dashboard/contacts/${contact.id}`}
                            className="font-medium hover:underline"
                            onClick={() => trackContactViewed(contact.id)}
                          >
                            {contact.firstName} {contact.lastName}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:underline text-muted-foreground"
                        >
                          {contact.email}
                        </a>
                      </TableCell>
                      <TableCell className={isSmallScreen ? 'hidden' : ''}>
                        {contact.company || '-'}
                      </TableCell>
                      <TableCell className={isMediumScreen ? 'hidden' : ''}>
                        {contact.title || '-'}
                      </TableCell>
                      <TableCell className={isSmallScreen ? 'hidden' : ''}>
                        {contact.phone ? (
                          <a
                            href={`tel:${contact.phone}`}
                            className="hover:underline text-muted-foreground"
                          >
                            {formatPhone(contact.phone)}
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      {enableAdvancedFiltering && (
                        <TableCell className={isMediumScreen ? 'hidden' : ''}>
                          {contact.status ? (
                            <ContactStatusIndicator status={contact.status} />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/contacts/${contact.id}`}>
                                <User className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            {canEdit && (
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/contacts/${contact.id}/edit`}>
                                  <PencilLine className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onEmail && onEmail([contact.id])}>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleContactAction('add-note', contact)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Add Note
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleContactAction('view-history', contact)}
                            >
                              <History className="h-4 w-4 mr-2" />
                              View History
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {canDelete && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDelete && onDelete([contact.id])}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Render card view
  const renderCardView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedContacts.length === 0 ? (
          <div className="col-span-full">
            <EmptyState query={searchQuery} onAdd={handleAddContact} onImport={onImport} />
          </div>
        ) : (
          paginatedContacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isSelected={selectedContacts.includes(contact.id)}
              onSelect={() => toggleSelectContact(contact.id)}
              onStar={handleStarContact}
              onEmail={onEmail}
              onDelete={onDelete}
              onAction={handleContactAction}
              selectedAction={activeAction}
            />
          ))
        )}
      </div>
    );
  };

  // Render compact view
  const renderCompactView = () => {
    return (
      <div className="border rounded-md divide-y">
        {paginatedContacts.length === 0 ? (
          <EmptyState query={searchQuery} onAdd={handleAddContact} onImport={onImport} />
        ) : (
          paginatedContacts.map(contact => (
            <div
              key={contact.id}
              className={`flex items-center py-2 px-3 hover:bg-muted/50 ${
                selectedContacts.includes(contact.id) ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center w-12">
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={() => toggleSelectContact(contact.id)}
                  aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                  className="mr-2"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 mr-1"
                  onClick={() => handleStarContact(contact.id, !contact.isStarred)}
                >
                  <Star
                    className={`h-3 w-3 ${
                      contact.isStarred
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              </div>

              <div className="flex-1 min-w-0 flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  {contact.avatarUrl ? (
                    <AvatarImage
                      src={contact.avatarUrl}
                      alt={`${contact.firstName} ${contact.lastName}`}
                    />
                  ) : (
                    <AvatarFallback className="text-xs">
                      {getInitials(`${contact.firstName} ${contact.lastName}`)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <Link
                      href={`/dashboard/contacts/${contact.id}`}
                      className="font-medium text-sm hover:underline truncate mr-2"
                    >
                      {contact.firstName} {contact.lastName}
                    </Link>

                    {contact.status && (
                      <Badge variant="outline" className="h-5 text-xs">
                        {contact.status}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 mr-1" />
                    <span className="truncate">{contact.email}</span>

                    {contact.company && (
                      <>
                        <span className="mx-1">•</span>
                        <Building className="h-3 w-3 mr-1" />
                        <span className="truncate">{contact.company}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEmail && onEmail([contact.id])}
                >
                  <Mail className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/contacts/${contact.id}`}>View</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/contacts/${contact.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete && onDelete([contact.id])}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // ----- Main Render -----

  if (initialLoading) {
    return <ContactListSkeleton />;
  }

  return (
    <div className={`space-y-4 ${className}`} data-testid={dataTestId}>
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contacts..."
              className="pl-8 w-[240px] sm:w-[300px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              ref={searchInputRef}
            />
          </div>

          {enableAdvancedFiltering && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterDialog(true)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.keys(filterOptions).length > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 w-5 p-0 flex items-center justify-center ml-1.5 absolute -top-1.5 -right-1.5"
                >
                  {
                    Object.keys(filterOptions).filter(k =>
                      Array.isArray(filterOptions[k as keyof FilterOptions])
                        ? (filterOptions[k as keyof FilterOptions] as any[]).length > 0
                        : !!filterOptions[k as keyof FilterOptions]
                    ).length
                  }
                </Badge>
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={`${sortOptions.field}-${sortOptions.direction}`}
                onValueChange={value => {
                  const [field, direction] = value.split('-') as [
                    SortOptions['field'],
                    'asc' | 'desc'
                  ];
                  setSortOptions({ field, direction });
                }}
              >
                <DropdownMenuRadioItem value="firstName-asc">
                  First Name (A-Z)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="firstName-desc">
                  First Name (Z-A)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="lastName-asc">Last Name (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="lastName-desc">Last Name (Z-A)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="email-asc">Email (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="email-desc">Email (Z-A)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="company-asc">Company (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="company-desc">Company (Z-A)</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="createdAt-desc">Newest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="createdAt-asc">Oldest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="lastContactedAt-desc">
                  Recently Contacted
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="engagementScore-desc">
                  Highest Engagement
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={viewMode}
                onValueChange={value => setViewMode(value as ViewMode)}
              >
                <DropdownMenuRadioItem value="table">
                  <FileText className="h-4 w-4 mr-2" />
                  Table View
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="cards">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Card View
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="compact">
                  <AlignJustify className="h-4 w-4 mr-2" />
                  Compact View
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Items per page</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={itemsPerPage.toString()}
                onValueChange={value => setItemsPerPage(parseInt(value))}
              >
                <DropdownMenuRadioItem value="10">10 items</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="25">25 items</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="50">50 items</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="100">100 items</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedContacts.length > 0 && (
            <Badge variant="secondary" className="h-8 px-3 gap-1">
              <CheckCheck className="h-3.5 w-3.5" />
              {selectedContacts.length} selected
            </Badge>
          )}

          {selectedContacts.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEmailSelected}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email Selected
                </DropdownMenuItem>

                {canExport && (
                  <DropdownMenuItem onClick={handleExportSelected}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </DropdownMenuItem>
                )}

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    Move to Group
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {availableGroups.length === 0 ? (
                        <DropdownMenuItem disabled>No groups available</DropdownMenuItem>
                      ) : (
                        availableGroups.map(group => (
                          <DropdownMenuItem
                            key={group.id}
                            onClick={() => handleMoveToGroup(group.id)}
                          >
                            {group.name}
                            {group.isSmartGroup && (
                              <Sparkles className="h-3 w-3 ml-1 text-yellow-500" />
                            )}
                          </DropdownMenuItem>
                        ))
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          toast({
                            title: 'Create Group',
                            description: `Create a new group with ${selectedContacts.length} contacts.`,
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Group
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem onClick={handleTagContacts}>
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Tags
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {enableAI && (
                  <DropdownMenuItem onClick={() => setShowAIRecommendations(true)}>
                    <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                    AI Recommendations
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailSelected}
            disabled={selectedContacts.length === 0}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>

          <Button variant="outline" size="sm" onClick={onImport}>
            <Import className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button asChild variant="default" size="sm">
            <Link href="/dashboard/contacts/new">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Link>
          </Button>
        </div>
      </div>

      {enableAnalytics && filteredContacts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Engagement</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold mr-2">68%</p>
                  <Badge variant="success" className="text-xs">
                    +5%
                  </Badge>
                </div>
              </div>
              <BarChart className="h-8 w-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Status</p>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.status === 'active').length}
                  <span className="text-sm text-muted-foreground ml-1">/{contacts.length}</span>
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/40" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Need Follow-up</p>
                <p className="text-2xl font-bold">
                  {
                    contacts.filter(
                      c => c.nextFollowUpDate && new Date(c.nextFollowUpDate) <= new Date()
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/40" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Render the correct view based on viewMode */}
      <div>
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'cards' && renderCardView()}
        {viewMode === 'compact' && renderCompactView()}
      </div>

      {/* Pagination */}
      {filteredContacts.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of{' '}
            {filteredContacts.length} contacts
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {totalPages <= 7 ? (
                // Display all pages if there are 7 or fewer
                Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))
              ) : (
                // Display first, last, and pages around current
                <>
                  {/* First page */}
                  <PaginationItem>
                    <PaginationLink isActive={1 === currentPage} onClick={() => setCurrentPage(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>

                  {/* Ellipsis or second page */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Pages around current */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page =
                      Math.max(
                        2,
                        Math.min(
                          currentPage - Math.floor(Math.min(5, totalPages) / 2),
                          totalPages - Math.min(5, totalPages)
                        )
                      ) + i;
                    return page > 1 && page < totalPages ? page : null;
                  })
                    .filter(Boolean)
                    .map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page!)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {/* Ellipsis or second-to-last page */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Last page */}
                  <PaginationItem>
                    <PaginationLink
                      isActive={totalPages === currentPage}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Dialogs */}
      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        filterOptions={filterOptions}
        onFilterChange={setFilterOptions}
        availableTags={availableTags}
        availableGroups={availableGroups}
      />

      <ConfirmationDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        title="Delete Contacts"
        description="Are you sure you want to delete {count} selected contacts? This action cannot be undone."
        actionLabel="Delete"
        onConfirm={confirmDeleteContacts}
        destructive={true}
        contactCount={selectedContacts.length}
      />

      <ConfirmationDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title="Export Contacts"
        description="Choose a format to export {count} selected contacts."
        actionLabel="Export"
        onConfirm={confirmExportContacts}
        contactCount={selectedContacts.length}
      />

      {enableAI && (
        <AIRecommendationsDialog
          open={showAIRecommendations}
          onOpenChange={setShowAIRecommendations}
          selectedContacts={selectedContactObjects}
          allContacts={contacts}
          onApplyRecommendation={handleApplyAIRecommendation}
        />
      )}

      <TagManagementDialog
        open={showTagsDialog}
        onOpenChange={setShowTagsDialog}
        availableTags={availableTags}
        selectedContactIds={selectedContacts}
        onTagContacts={onTagContacts}
        onCreateTag={onCreateTag}
      />
    </div>
  );
}

// Utility function imports - these would normally be imported from utils
const LayoutGrid = ({ className, ...props }: React.ComponentProps<typeof LucideIcon>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

type LucideIcon = React.ForwardRefExoticComponent<
  React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
>;

// This component would be imported from @/components/ui/badge
const Badge = ({
  variant = 'default',
  className,
  ...props
}: {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline:
      'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};

// This would be defined in @/components/ui/label
const Label = ({
  htmlFor,
  className,
  children,
}: {
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
    >
      {children}
    </label>
  );
};
