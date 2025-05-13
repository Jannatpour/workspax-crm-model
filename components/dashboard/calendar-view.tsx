'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  addHours,
  differenceInMinutes,
  getHours,
  getMinutes,
  setHours,
  isAfter,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
  getDay,
  isWithinInterval,
  isToday,
  formatISO,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Clock,
  User,
  MapPin,
  Tag,
  Filter,
  Search,
  X,
  Grid,
  MenuSquare,
  LayoutList,
  Loader2,
  RefreshCw,
  Star,
  Download,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useDebounce } from '@/hooks/use-debounce';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { ColorPicker } from '@/components/ui/color-picker';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Types ==================================================================

/**
 * Event category with display properties
 */
interface EventCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  isDefault?: boolean;
}

/**
 * User or contact reference for events
 */
interface EventParticipant {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: 'organizer' | 'required' | 'optional';
  response?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
}

/**
 * Location information for events
 */
interface EventLocation {
  address?: string;
  title: string;
  url?: string;
  isOnline?: boolean;
  joinUrl?: string;
}

/**
 * Event reminders configuration
 */
interface EventReminder {
  id: string;
  time: number; // minutes before event
  type: 'email' | 'notification' | 'sms';
  sent?: boolean;
}

/**
 * Recurrence pattern for repeating events
 */
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  count?: number;
  until?: string;
  byWeekDay?: number[];
  byMonthDay?: number[];
}

/**
 * Calendar event model
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO string
  end: string; // ISO string
  allDay?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  categoryId?: string;
  location?: EventLocation;
  participants?: EventParticipant[];
  reminders?: EventReminder[];
  color?: string;
  isPrivate?: boolean;
  isReadOnly?: boolean;
  createdBy?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  originalId?: string; // for recurring event instances
  status?: 'confirmed' | 'tentative' | 'cancelled';
  externalId?: string; // for synced events
  source?: string; // e.g., 'google', 'outlook', etc.
  url?: string; // external link
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  timezone?: string;
  isStarred?: boolean;
  customData?: Record<string, any>;
}

/**
 * Calendar source (integration)
 */
interface CalendarSource {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'apple' | 'local' | 'other';
  color: string;
  isVisible: boolean;
  isDefault?: boolean;
  isReadOnly?: boolean;
}

/**
 * Props for the CalendarView component
 */
export interface CalendarViewProps {
  /**
   * Events to display on the calendar
   */
  events: CalendarEvent[];

  /**
   * Available event categories
   */
  categories?: EventCategory[];

  /**
   * Calendar sources/integrations
   */
  calendarSources?: CalendarSource[];

  /**
   * Current loading state of events
   */
  isLoading?: boolean;

  /**
   * Default view mode
   */
  defaultView?: 'month' | 'week' | 'day' | 'agenda';

  /**
   * Initial date to focus the calendar on
   */
  initialDate?: Date;

  /**
   * Whether to allow creating new events
   */
  allowCreation?: boolean;

  /**
   * Whether to allow editing events
   */
  allowEditing?: boolean;

  /**
   * Whether to allow deleting events
   */
  allowDeletion?: boolean;

  /**
   * Whether to allow dragging events to reschedule
   */
  allowDragAndDrop?: boolean;

  /**
   * Callback fired when an event is created
   */
  onEventCreate?: (
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<CalendarEvent>;

  /**
   * Callback fired when an event is updated
   */
  onEventUpdate?: (event: CalendarEvent) => Promise<CalendarEvent>;

  /**
   * Callback fired when an event is deleted
   */
  onEventDelete?: (eventId: string) => Promise<boolean>;

  /**
   * Callback fired when the visible date range changes
   */
  onDateRangeChange?: (start: Date, end: Date) => void;

  /**
   * Callback fired when the view mode changes
   */
  onViewChange?: (view: 'month' | 'week' | 'day' | 'agenda') => void;

  /**
   * Callback fired when events are requested to be refreshed
   */
  onRefreshRequest?: () => Promise<void>;

  /**
   * Custom component to render for each event
   */
  eventRenderer?: (
    event: CalendarEvent,
    props: { className?: string; isCompact?: boolean }
  ) => React.ReactNode;

  /**
   * Function to format event times
   */
  formatEventTime?: (event: CalendarEvent) => string;

  /**
   * Allow toggling between a dark/light theme
   */
  allowThemeToggle?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Additional CSS styles
   */
  style?: React.CSSProperties;

  /**
   * Additional test ID for testing
   */
  testId?: string;
}

/**
 * Shape of the event creation form
 */
const eventFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    start: z.date(),
    end: z.date(),
    allDay: z.boolean().default(false),
    categoryId: z.string().optional(),
    isPrivate: z.boolean().default(false),
    locationTitle: z.string().optional(),
    locationAddress: z.string().optional(),
    isOnlineEvent: z.boolean().default(false),
    onlineEventUrl: z.string().optional(),
    isRecurring: z.boolean().default(false),
    color: z.string().optional(),
  })
  .refine(data => isBefore(data.start, data.end), {
    message: 'End time must be after start time',
    path: ['end'],
  });

type EventFormValues = z.infer<typeof eventFormSchema>;

// Helper functions ==================================================================

/**
 * Get contrast color (black or white) based on background color
 */
const getContrastColor = (hexColor: string): string => {
  // Remove the hash at the start if it's there
  hexColor = hexColor.replace(/^#/, '');

  // Parse the color
  let r, g, b;
  if (hexColor.length === 3) {
    r = parseInt(hexColor[0] + hexColor[0], 16);
    g = parseInt(hexColor[1] + hexColor[1], 16);
    b = parseInt(hexColor[2] + hexColor[2], 16);
  } else {
    r = parseInt(hexColor.substring(0, 2), 16);
    g = parseInt(hexColor.substring(2, 4), 16);
    b = parseInt(hexColor.substring(4, 6), 16);
  }

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Format a date range for display
 */
const formatDateRange = (start: Date, end: Date, allDay: boolean = false): string => {
  if (allDay) {
    if (isSameDay(start, end)) {
      return format(start, 'MMM d, yyyy');
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }

  if (isSameDay(start, end)) {
    return `${format(start, 'MMM d, yyyy h:mm a')} - ${format(end, 'h:mm a')}`;
  }

  return `${format(start, 'MMM d, yyyy h:mm a')} - ${format(end, 'MMM d, yyyy h:mm a')}`;
};

/**
 * Calculate event position and height for day/week view
 */
const calculateEventPosition = (
  event: CalendarEvent,
  dayStart: number = 0,
  dayEnd: number = 24,
  cellHeight: number = 60
): { top: number; height: number } => {
  const start = parseISO(event.start);
  const end = parseISO(event.end);

  if (event.allDay) {
    return { top: 0, height: cellHeight };
  }

  const startHour = Math.max(dayStart, getHours(start) + getMinutes(start) / 60);
  const endHour = Math.min(dayEnd, getHours(end) + getMinutes(end) / 60);

  const top = (startHour - dayStart) * cellHeight;
  const height = Math.max((endHour - startHour) * cellHeight, 30); // Minimum height of 30px

  return { top, height };
};

/**
 * Determine if two events overlap in time
 */
const eventsOverlap = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
  const start1 = parseISO(event1.start);
  const end1 = parseISO(event1.end);
  const start2 = parseISO(event2.start);
  const end2 = parseISO(event2.end);

  return (
    (isAfter(start1, start2) && isBefore(start1, end2)) ||
    (isAfter(end1, start2) && isBefore(end1, end2)) ||
    (isBefore(start1, start2) && isAfter(end1, end2)) ||
    isSameDay(start1, start2) ||
    isSameDay(end1, end2)
  );
};

/**
 * Calculate positioning of overlapping events
 */
const calculateEventColumnPosition = (
  event: CalendarEvent,
  dayEvents: CalendarEvent[]
): { left: string; width: string } => {
  if (event.allDay) {
    return { left: '0%', width: '100%' };
  }

  // Find overlapping events
  const overlappingEvents = dayEvents.filter(
    e => e.id !== event.id && !e.allDay && eventsOverlap(event, e)
  );

  if (overlappingEvents.length === 0) {
    return { left: '0%', width: '100%' };
  }

  // Count how many events are in the same column group
  const columnCount = overlappingEvents.length + 1;

  // Determine this event's position in the group
  // (for a real implementation, this would need a more sophisticated algorithm)
  // This is a simplified approach
  const columnIndex = overlappingEvents.findIndex(e => e.id > event.id) + 1;
  const columnPosition = columnIndex === -1 ? 0 : columnIndex;

  const width = `${98 / columnCount}%`;
  const left = `${(columnPosition * 100) / columnCount}%`;

  return { left, width };
};

/**
 * Get events for a specific day
 */
const getEventsForDay = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return events.filter(event => {
    const eventStart = parseISO(event.start);
    const eventEnd = parseISO(event.end);

    return (
      isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
      isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
      (isBefore(eventStart, dayStart) && isAfter(eventEnd, dayEnd))
    );
  });
};

/**
 * Format time in 12-hour format
 */
const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

// Sub-components ==================================================================

/**
 * Event creation/editing dialog
 */
const EventDialog = ({
  open,
  onOpenChange,
  event,
  categories = [],
  onCreate,
  onUpdate,
  onDelete,
  isReadOnly = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent;
  categories?: EventCategory[];
  onCreate?: (
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<CalendarEvent>;
  onUpdate?: (event: CalendarEvent) => Promise<CalendarEvent>;
  onDelete?: (eventId: string) => Promise<boolean>;
  isReadOnly?: boolean;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description || '',
          start: parseISO(event.start),
          end: parseISO(event.end),
          allDay: event.allDay || false,
          categoryId: event.categoryId,
          isPrivate: event.isPrivate || false,
          locationTitle: event.location?.title || '',
          locationAddress: event.location?.address || '',
          isOnlineEvent: event.location?.isOnline || false,
          onlineEventUrl: event.location?.joinUrl || '',
          isRecurring: event.isRecurring || false,
          color: event.color,
        }
      : {
          title: '',
          description: '',
          start: new Date(),
          end: addHours(new Date(), 1),
          allDay: false,
          isPrivate: false,
          isOnlineEvent: false,
          isRecurring: false,
        },
  });

  // Reset form when dialog opens/closes or event changes
  useEffect(() => {
    if (open) {
      if (event) {
        form.reset({
          title: event.title,
          description: event.description || '',
          start: parseISO(event.start),
          end: parseISO(event.end),
          allDay: event.allDay || false,
          categoryId: event.categoryId,
          isPrivate: event.isPrivate || false,
          locationTitle: event.location?.title || '',
          locationAddress: event.location?.address || '',
          isOnlineEvent: event.location?.isOnline || false,
          onlineEventUrl: event.location?.joinUrl || '',
          isRecurring: event.isRecurring || false,
          color: event.color,
        });
      } else {
        form.reset({
          title: '',
          description: '',
          start: new Date(),
          end: addHours(new Date(), 1),
          allDay: false,
          isPrivate: false,
          isOnlineEvent: false,
          isRecurring: false,
        });
      }
    }
  }, [open, event, form]);

  // Watch form values
  const watchAllDay = form.watch('allDay');
  const watchIsOnlineEvent = form.watch('isOnlineEvent');
  const watchIsRecurring = form.watch('isRecurring');

  // Adjust end time when start time changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'start' && value.start) {
        const currentEnd = form.getValues('end');
        const newStart = value.start as Date;

        // Preserve duration when changing start time
        const currentDuration = differenceInMinutes(currentEnd, form.getValues('start'));

        // Update end time to maintain the same duration
        if (currentDuration > 0) {
          const newEnd = addMinutes(newStart, currentDuration);
          form.setValue('end', newEnd);
        } else {
          // If duration is negative or zero, set end to 1 hour after start
          form.setValue('end', addHours(newStart, 1));
        }
      }

      if (name === 'allDay' && value.allDay) {
        // If switching to all-day, adjust times
        const currentStart = form.getValues('start');
        const currentEnd = form.getValues('end');

        form.setValue('start', startOfDay(currentStart));

        // If end is on the same day, move it to end of day
        // Otherwise, keep it on its current day
        if (isSameDay(currentStart, currentEnd)) {
          form.setValue('end', endOfDay(currentStart));
        } else {
          form.setValue('end', endOfDay(currentEnd));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);

      const eventData = {
        title: data.title,
        description: data.description,
        start: formatISO(data.start),
        end: formatISO(data.end),
        allDay: data.allDay,
        categoryId: data.categoryId,
        isPrivate: data.isPrivate,
        isRecurring: data.isRecurring,
        color: data.color,
        location: {
          title: data.locationTitle || '',
          address: data.locationAddress,
          isOnline: data.isOnlineEvent,
          joinUrl: data.onlineEventUrl,
        },
      };

      if (event) {
        // Update existing event
        if (onUpdate) {
          await onUpdate({
            ...event,
            ...eventData,
            updatedAt: formatISO(new Date()),
          });

          toast({
            title: 'Event updated',
            description: 'Your event has been updated successfully.',
          });
        }
      } else {
        // Create new event
        if (onCreate) {
          await onCreate({
            ...eventData,
          });

          toast({
            title: 'Event created',
            description: 'Your event has been created successfully.',
          });
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Failed to save event',
        description: 'There was an error saving your event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle event deletion
  const handleDelete = async () => {
    if (!event || !onDelete) return;

    try {
      setIsDeleting(true);

      await onDelete(event.id);

      toast({
        title: 'Event deleted',
        description: 'Your event has been deleted successfully.',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Failed to delete event',
        description: 'There was an error deleting your event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly ? 'Event Details' : event ? 'Edit Event' : 'Create Event'}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? 'View event details'
              : event
              ? 'Make changes to your event'
              : 'Add a new event to your calendar'}
          </DialogDescription>
        </DialogHeader>

        {isReadOnly ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{event?.title}</h3>

              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {formatDateRange(
                    parseISO(event?.start || ''),
                    parseISO(event?.end || ''),
                    event?.allDay
                  )}
                </span>
              </div>

              {event?.location && (
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    {event.location.title}
                    {event.location.address && ` - ${event.location.address}`}
                    {event.location.isOnline && (
                      <a
                        href={event.location.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline"
                      >
                        Join online
                      </a>
                    )}
                  </span>
                </div>
              )}

              {event?.categoryId && (
                <div className="flex items-center mt-2 text-sm">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Badge
                    variant="outline"
                    className="bg-primary/10"
                    style={{
                      backgroundColor: `${event.color || '#3b82f6'}20`,
                      borderColor: event.color || '#3b82f6',
                      color: event.color || '#3b82f6',
                    }}
                  >
                    {categories.find(c => c.id === event.categoryId)?.name || 'Category'}
                  </Badge>
                </div>
              )}

              {event?.participants && event.participants.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Participants</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.participants.map(participant => (
                      <div key={participant.id} className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          {participant.avatarUrl ? (
                            <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                          ) : (
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        <span className="text-sm">{participant.name}</span>

                        {participant.response && (
                          <Badge
                            variant={
                              participant.response === 'accepted'
                                ? 'default'
                                : participant.response === 'declined'
                                ? 'destructive'
                                : 'outline'
                            }
                            className="text-xs"
                          >
                            {participant.response}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event?.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {event?.isRecurring && (
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span>
                    {event.recurrenceRule?.frequency === 'daily' && 'Repeats daily'}
                    {event.recurrenceRule?.frequency === 'weekly' && 'Repeats weekly'}
                    {event.recurrenceRule?.frequency === 'monthly' && 'Repeats monthly'}
                    {event.recurrenceRule?.frequency === 'yearly' && 'Repeats yearly'}
                    {event.recurrenceRule?.interval > 1 &&
                      ` every ${
                        event.recurrenceRule.interval
                      } ${event.recurrenceRule.frequency.slice(0, -2)}s`}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              {(onUpdate || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {onUpdate && (
                      <DropdownMenuItem
                        onClick={() => {
                          onOpenChange(false);
                          // Need to add a small delay to avoid animation issues
                          setTimeout(() => {
                            onOpenChange(true);
                          }, 100);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start</FormLabel>
                      <FormControl>
                        {watchAllDay ? (
                          <DatePicker date={field.value} onSelect={field.onChange} />
                        ) : (
                          <DateTimePicker date={field.value} onSelect={field.onChange} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End</FormLabel>
                      <FormControl>
                        {watchAllDay ? (
                          <DatePicker
                            date={field.value}
                            onSelect={field.onChange}
                            fromDate={form.watch('start')}
                          />
                        ) : (
                          <DateTimePicker
                            date={field.value}
                            onSelect={field.onChange}
                            fromDate={form.watch('start')}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="allDay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">All day</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Private</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No category</SelectItem>
                          {categories.map(category => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        color={field.value || '#3b82f6'}
                        onChange={field.onChange}
                        presetColors={[
                          '#3b82f6', // Blue
                          '#10b981', // Green
                          '#f97316', // Orange
                          '#ef4444', // Red
                          '#8b5cf6', // Purple
                          '#f59e0b', // Amber
                          '#ec4899', // Pink
                          '#6b7280', // Gray
                        ]}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Event description" rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="location" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="locationTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Location name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locationAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isOnlineEvent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Online event</FormLabel>
                      </FormItem>
                    )}
                  />

                  {watchIsOnlineEvent && (
                    <FormField
                      control={form.control}
                      name="onlineEventUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Link</FormLabel>
                          <FormControl>
                            <Input placeholder="Meeting URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                <TabsContent value="recurrence" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Recurring event</FormLabel>
                      </FormItem>
                    )}
                  />

                  {watchIsRecurring && (
                    <div className="space-y-4 p-4 border rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Recurrence options will be supported in a future update.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter className="pt-4">
                {event && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                )}

                <Button type="submit" disabled={isSubmitting || isDeleting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Calendar Month View
 */
const MonthView = ({
  events,
  currentDate,
  categories = [],
  onEventClick,
  onDateClick,
  onDragEnd,
  allowDragAndDrop = false,
}: {
  events: CalendarEvent[];
  currentDate: Date;
  categories?: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onDragEnd?: (event: CalendarEvent, start: Date, end: Date) => void;
  allowDragAndDrop?: boolean;
}) => {
  // Calculate month days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Split days into weeks
  const weeks = [];
  let week = [];

  for (let i = 0; i < days.length; i++) {
    week.push(days[i]);

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  // Calculate cell height based on max events
  const maxEventsPerDay = Math.max(
    ...days.map(day => {
      const dayEvents = getEventsForDay(events, day);
      return dayEvents.length;
    })
  );

  // Calculate appropriate row height
  const getRowHeight = (): string => {
    if (maxEventsPerDay <= 3) return '120px';
    if (maxEventsPerDay <= 5) return '150px';
    return '180px';
  };

  return (
    <div className="bg-background border rounded-md overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div
            key={day}
            className={cn(
              'h-10 flex items-center justify-center text-sm font-medium',
              index === 0 || index === 6 ? 'text-muted-foreground' : ''
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div>
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 border-b last:border-b-0"
            style={{ height: getRowHeight() }}
          >
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(events, day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isWeekend = [0, 6].includes(getDay(day));

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    'border-r last:border-r-0 p-1.5 relative',
                    isCurrentMonth ? 'bg-background' : 'bg-muted/20',
                    isWeekend ? 'bg-muted/10' : ''
                  )}
                  onClick={() => onDateClick(day)}
                >
                  <div
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                      isToday ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </div>

                  <div className="mt-1 space-y-1 max-h-[calc(100%-36px)] overflow-hidden">
                    {dayEvents.length > 0 && (
                      <div className="space-y-1">
                        {dayEvents
                          .sort((a, b) => {
                            if (a.allDay && !b.allDay) return -1;
                            if (!a.allDay && b.allDay) return 1;
                            return new Date(a.start).getTime() - new Date(b.start).getTime();
                          })
                          .slice(0, 3)
                          .map(event => {
                            // Check if event continues from previous day
                            const eventStart = parseISO(event.start);
                            const eventEnd = parseISO(event.end);
                            const isMultiDay = !isSameDay(eventStart, eventEnd);
                            const isEventStart = isSameDay(eventStart, day);
                            const isEventEnd = isSameDay(eventEnd, day);
                            const continuesFromPrevDay = isMultiDay && !isEventStart;
                            const continuesToNextDay = isMultiDay && !isEventEnd;

                            const eventCategory = categories.find(c => c.id === event.categoryId);
                            const eventColor = event.color || eventCategory?.color || '#3b82f6';

                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  'text-xs px-2 py-0.5 rounded truncate flex-1 cursor-pointer',
                                  event.allDay ? 'font-medium' : '',
                                  continuesFromPrevDay ? 'rounded-l-none ml-0' : '',
                                  continuesToNextDay ? 'rounded-r-none mr-0' : ''
                                )}
                                style={{
                                  backgroundColor: `${eventColor}1a`,
                                  color: eventColor,
                                  borderLeft: `3px solid ${eventColor}`,
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  onEventClick(event);
                                }}
                              >
                                {!event.allDay && (
                                  <span className="mr-1 font-medium">
                                    {format(parseISO(event.start), 'h:mm a')}
                                  </span>
                                )}
                                <span className="truncate">{event.title}</span>
                              </div>
                            );
                          })}

                        {dayEvents.length > 3 && (
                          <div
                            className="text-xs text-muted-foreground px-2 cursor-pointer hover:underline"
                            onClick={e => {
                              e.stopPropagation();
                              onDateClick(day);
                            }}
                          >
                            + {dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Calendar Week View
 */
const WeekView = ({
  events,
  currentDate,
  categories = [],
  onEventClick,
  onDateClick,
  onTimeSlotClick,
  allowDragAndDrop = false,
}: {
  events: CalendarEvent[];
  currentDate: Date;
  categories?: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onTimeSlotClick: (date: Date) => void;
  allowDragAndDrop?: boolean;
}) => {
  // Get week dates
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Time slots
  const hourSlots = [];
  for (let i = 0; i < 24; i++) {
    hourSlots.push(i);
  }

  return (
    <div className="bg-background border rounded-md overflow-hidden">
      {/* All-day events section */}
      <div className="grid grid-cols-8 border-b">
        <div className="h-12 border-r flex items-center justify-center text-sm font-medium text-muted-foreground">
          All day
        </div>

        {days.map((day, index) => {
          const isToday = isSameDay(day, new Date());
          const isWeekend = [0, 6].includes(getDay(day));
          const allDayEvents = getEventsForDay(events, day).filter(e => e.allDay);

          return (
            <div
              key={index}
              className={cn(
                'p-1.5 relative border-r last:border-r-0',
                isWeekend ? 'bg-muted/10' : '',
                isToday ? 'bg-primary/5' : ''
              )}
              onClick={() => onDateClick(day)}
            >
              <div
                className={cn(
                  'flex items-center justify-center text-sm',
                  isToday ? 'font-medium text-primary' : ''
                )}
              >
                <span className="sr-only">{format(day, 'EEEE')}</span>
                <span>{format(day, 'EEE d')}</span>
              </div>

              <div className="mt-1 space-y-1">
                {allDayEvents.slice(0, 2).map(event => {
                  const eventCategory = categories.find(c => c.id === event.categoryId);
                  const eventColor = event.color || eventCategory?.color || '#3b82f6';

                  // Check if event spans multiple days
                  const eventStart = parseISO(event.start);
                  const eventEnd = parseISO(event.end);
                  const isMultiDay = !isSameDay(eventStart, eventEnd);
                  const isEventStart = isSameDay(eventStart, day);
                  const isEventEnd = isSameDay(eventEnd, day);
                  const continuesFromPrevDay = isMultiDay && !isEventStart;
                  const continuesToNextDay = isMultiDay && !isEventEnd;

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'text-xs px-2 py-0.5 rounded truncate cursor-pointer',
                        continuesFromPrevDay ? 'rounded-l-none ml-0' : '',
                        continuesToNextDay ? 'rounded-r-none mr-0' : ''
                      )}
                      style={{
                        backgroundColor: `${eventColor}1a`,
                        color: eventColor,
                        borderLeft: `3px solid ${eventColor}`,
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <span className="truncate">{event.title}</span>
                    </div>
                  );
                })}

                {allDayEvents.length > 2 && (
                  <div
                    className="text-xs text-muted-foreground truncate cursor-pointer hover:underline"
                    onClick={e => {
                      e.stopPropagation();
                      onDateClick(day);
                    }}
                  >
                    + {allDayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-8">
        {/* Time labels */}
        <div className="border-r">
          {hourSlots.map(hour => (
            <div key={hour} className="h-12 border-b last:border-b-0 relative">
              <span className="absolute -top-3 left-2 text-xs text-muted-foreground w-8 text-right">
                {hour === 0
                  ? '12 AM'
                  : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                  ? '12 PM'
                  : `${hour - 12} PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIndex) => {
          const isToday = isSameDay(day, new Date());
          const isWeekend = [0, 6].includes(getDay(day));
          const timeEvents = getEventsForDay(events, day).filter(e => !e.allDay);

          return (
            <div
              key={dayIndex}
              className={cn(
                'relative border-r last:border-r-0',
                isWeekend ? 'bg-muted/10' : '',
                isToday ? 'bg-primary/5' : ''
              )}
            >
              {/* Hour cells */}
              {hourSlots.map(hour => {
                const timeSlot = setHours(day, hour);

                return (
                  <div
                    key={hour}
                    className="h-12 border-b last:border-b-0 relative"
                    onClick={() => onTimeSlotClick(timeSlot)}
                  >
                    {/* Empty slot */}
                  </div>
                );
              })}

              {/* Events */}
              {timeEvents.map(event => {
                const eventCategory = categories.find(c => c.id === event.categoryId);
                const eventColor = event.color || eventCategory?.color || '#3b82f6';

                const eventStart = parseISO(event.start);
                const eventEnd = parseISO(event.end);

                // Only show events for this day
                if (!isSameDay(eventStart, day) && !isSameDay(eventEnd, day)) {
                  if (!(isBefore(eventStart, day) && isAfter(eventEnd, day))) {
                    return null;
                  }
                }

                // Calculate event position and size
                const { top, height } = calculateEventPosition(event, 0, 24, 12 * 4);
                const { left, width } = calculateEventColumnPosition(event, timeEvents);

                // Adjust start time display if event starts on a different day
                const showStartsEarlier = !isSameDay(eventStart, day) && isBefore(eventStart, day);

                // Adjust end time display if event ends on a different day
                const showEndsLater = !isSameDay(eventEnd, day) && isAfter(eventEnd, day);

                return (
                  <div
                    key={event.id}
                    className="absolute rounded-md overflow-hidden shadow-sm border border-background cursor-pointer"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: left,
                      width: width,
                      backgroundColor: `${eventColor}1a`,
                      borderLeft: `3px solid ${eventColor}`,
                      zIndex: showStartsEarlier || showEndsLater ? 2 : 1,
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <div className="p-1 h-full flex flex-col overflow-hidden">
                      <div className="text-xs font-medium truncate" style={{ color: eventColor }}>
                        {showStartsEarlier ? (
                          <span className="mr-1">&laquo;</span>
                        ) : (
                          <span className="mr-1">{format(eventStart, 'h:mm a')}</span>
                        )}
                        {event.title}
                      </div>

                      {height > 50 && event.location?.title && (
                        <div className="text-xs text-muted-foreground truncate mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 inline" />
                          {event.location.title}
                        </div>
                      )}

                      {showEndsLater && (
                        <div className="mt-auto text-xs text-right">
                          <span className="mr-1">&raquo;</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Calendar Day View
 */
const DayView = ({
  events,
  currentDate,
  categories = [],
  onEventClick,
  onTimeSlotClick,
  allowDragAndDrop = false,
}: {
  events: CalendarEvent[];
  currentDate: Date;
  categories?: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date) => void;
  allowDragAndDrop?: boolean;
}) => {
  // Time slots
  const hourSlots = [];
  for (let i = 0; i < 24; i++) {
    hourSlots.push(i);
  }

  // Get events for the day
  const dayEvents = getEventsForDay(events, currentDate);
  const allDayEvents = dayEvents.filter(e => e.allDay);
  const timeEvents = dayEvents.filter(e => !e.allDay);

  return (
    <div className="bg-background border rounded-md overflow-hidden">
      {/* All-day events section */}
      <div className="grid grid-cols-[100px_1fr] border-b">
        <div className="h-12 border-r flex items-center justify-center text-sm font-medium text-muted-foreground">
          All day
        </div>

        <div className="p-1.5 relative">
          <div className="flex items-center justify-center text-sm font-medium">
            <span>{format(currentDate, 'EEEE, MMMM d')}</span>
            {isToday(currentDate) && (
              <Badge variant="default" className="ml-2 h-5 px-1.5 text-xs">
                Today
              </Badge>
            )}
          </div>

          <div className="mt-1 space-y-1">
            {allDayEvents.map(event => {
              const eventCategory = categories.find(c => c.id === event.categoryId);
              const eventColor = event.color || eventCategory?.color || '#3b82f6';

              return (
                <div
                  key={event.id}
                  className="text-xs px-2 py-0.5 rounded truncate cursor-pointer"
                  style={{
                    backgroundColor: `${eventColor}1a`,
                    color: eventColor,
                    borderLeft: `3px solid ${eventColor}`,
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <span className="truncate">{event.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[100px_1fr]">
        {/* Time labels */}
        <div className="border-r">
          {hourSlots.map(hour => (
            <div key={hour} className="h-12 border-b last:border-b-0 relative">
              <span className="absolute -top-3 left-2 text-xs text-muted-foreground w-8 text-right">
                {hour === 0
                  ? '12 AM'
                  : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                  ? '12 PM'
                  : `${hour - 12} PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Events column */}
        <div className="relative">
          {/* Hour cells */}
          {hourSlots.map(hour => {
            const timeSlot = setHours(currentDate, hour);

            return (
              <div
                key={hour}
                className="h-12 border-b last:border-b-0 relative"
                onClick={() => onTimeSlotClick(timeSlot)}
              >
                {/* Empty slot */}
              </div>
            );
          })}

          {/* Events */}
          {timeEvents.map(event => {
            const eventCategory = categories.find(c => c.id === event.categoryId);
            const eventColor = event.color || eventCategory?.color || '#3b82f6';

            const eventStart = parseISO(event.start);
            const eventEnd = parseISO(event.end);

            // Calculate event position and size
            const { top, height } = calculateEventPosition(event, 0, 24, 12 * 4);
            const { left, width } = calculateEventColumnPosition(event, timeEvents);

            // Adjust start time display if event starts on a different day
            const showStartsEarlier =
              !isSameDay(eventStart, currentDate) && isBefore(eventStart, currentDate);

            // Adjust end time display if event ends on a different day
            const showEndsLater =
              !isSameDay(eventEnd, currentDate) && isAfter(eventEnd, currentDate);

            return (
              <div
                key={event.id}
                className="absolute rounded-md overflow-hidden shadow-sm border border-background cursor-pointer"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  left: left,
                  width: width,
                  backgroundColor: `${eventColor}1a`,
                  borderLeft: `3px solid ${eventColor}`,
                }}
                onClick={() => onEventClick(event)}
              >
                <div className="p-1 h-full flex flex-col overflow-hidden">
                  <div className="text-xs font-medium truncate" style={{ color: eventColor }}>
                    {showStartsEarlier ? (
                      <span className="mr-1">&laquo;</span>
                    ) : (
                      <span className="mr-1">{format(eventStart, 'h:mm a')}</span>
                    )}
                    {event.title}
                  </div>

                  {height > 50 && (
                    <>
                      {event.location?.title && (
                        <div className="text-xs text-muted-foreground truncate mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 inline" />
                          {event.location.title}
                        </div>
                      )}

                      {event.participants && event.participants.length > 0 && (
                        <div className="text-xs text-muted-foreground truncate mt-1 flex items-center">
                          <User className="h-3 w-3 mr-1 inline" />
                          {event.participants.length}{' '}
                          {event.participants.length === 1 ? 'participant' : 'participants'}
                        </div>
                      )}
                    </>
                  )}

                  {showEndsLater && (
                    <div className="mt-auto text-xs text-right">
                      <span className="mr-1">&raquo;</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Current time indicator */}
          {isToday(currentDate) && (
            <div
              className="absolute h-[2px] w-full bg-red-500 z-10"
              style={{
                top: `${((getHours(new Date()) * 60 + getMinutes(new Date())) / 60) * 12}px`,
              }}
            >
              <div className="absolute -left-2.5 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Calendar Agenda View
 */
const AgendaView = ({
  events,
  currentDate,
  categories = [],
  onEventClick,
  onRefresh,
}: {
  events: CalendarEvent[];
  currentDate: Date;
  categories?: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onRefresh?: () => Promise<void>;
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter and sort events starting from today
  const agendaEvents = useMemo(() => {
    return events
      .filter(event => isAfter(parseISO(event.end), startOfDay(currentDate)))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events, currentDate]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {};

    agendaEvents.forEach(event => {
      const eventStart = parseISO(event.start);
      const dateKey = format(eventStart, 'yyyy-MM-dd');

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(event);
    });

    return groups;
  }, [agendaEvents]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;

    try {
      setIsRefreshing(true);
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-background border rounded-md overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h3 className="text-lg font-medium">Upcoming Events</h3>

        {onRefresh && (
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      <ScrollArea className="h-[600px]">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="p-8 text-center">
            <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
            <p className="text-sm text-muted-foreground">You don't have any events scheduled.</p>
          </div>
        ) : (
          <div>
            {Object.keys(groupedEvents).map(dateKey => {
              const date = parseISO(dateKey);
              const isCurrentDay = isSameDay(date, new Date());
              const isPastDay = isBefore(date, startOfDay(new Date()));
              const events = groupedEvents[dateKey];

              return (
                <div key={dateKey} className="border-b last:border-b-0">
                  <div
                    className={cn(
                      'px-4 py-2 font-medium flex items-center',
                      isCurrentDay ? 'bg-primary/10' : 'bg-muted/20'
                    )}
                  >
                    <span className="w-10 text-center text-lg">{format(date, 'd')}</span>
                    <div className="ml-4">
                      <div className="text-sm">{format(date, 'EEEE')}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(date, 'MMMM yyyy')}
                      </div>
                    </div>

                    {isCurrentDay && (
                      <Badge variant="default" className="ml-2">
                        Today
                      </Badge>
                    )}
                  </div>

                  <div>
                    {events.map(event => {
                      const eventCategory = categories.find(c => c.id === event.categoryId);
                      const eventColor = event.color || eventCategory?.color || '#3b82f6';
                      const eventStart = parseISO(event.start);
                      const eventEnd = parseISO(event.end);
                      const isMultiDay = !isSameDay(eventStart, eventEnd);

                      return (
                        <div
                          key={event.id}
                          className="px-4 py-3 hover:bg-muted/10 cursor-pointer border-l-4 flex items-start"
                          style={{ borderLeftColor: eventColor }}
                          onClick={() => onEventClick(event)}
                        >
                          <div className="w-10 text-center text-xs text-muted-foreground">
                            {event.allDay ? (
                              <span>All day</span>
                            ) : (
                              <span>{format(eventStart, 'h:mm a')}</span>
                            )}
                          </div>

                          <div className="ml-4 flex-1 min-w-0">
                            <div className="font-medium">{event.title}</div>

                            <div className="text-sm text-muted-foreground mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1 inline" />
                              {event.allDay
                                ? isMultiDay
                                  ? `${format(eventStart, 'MMM d')} - ${format(eventEnd, 'MMM d')}`
                                  : 'All day'
                                : isMultiDay
                                ? `${format(eventStart, 'MMM d, h:mm a')} - ${format(
                                    eventEnd,
                                    'MMM d, h:mm a'
                                  )}`
                                : `${format(eventStart, 'h:mm a')} - ${format(eventEnd, 'h:mm a')}`}
                            </div>

                            {event.location?.title && (
                              <div className="text-sm text-muted-foreground mt-0.5 flex items-center">
                                <MapPin className="h-3 w-3 mr-1 inline" />
                                {event.location.title}
                                {event.location.isOnline && (
                                  <Badge variant="outline" className="ml-2 h-5 text-xs">
                                    Online
                                  </Badge>
                                )}
                              </div>
                            )}

                            {eventCategory && (
                              <div className="mt-1">
                                <Badge
                                  variant="outline"
                                  className="h-5 text-xs"
                                  style={{
                                    backgroundColor: `${eventColor}1a`,
                                    borderColor: eventColor,
                                    color: eventColor,
                                  }}
                                >
                                  {eventCategory.name}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {event.isRecurring && (
                            <div className="ml-2">
                              <RefreshCw className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}

                          {event.isStarred && (
                            <div className="ml-2">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

/**
 * Main CalendarView component
 */
export function CalendarView({
  events = [],
  categories = [],
  calendarSources = [],
  isLoading = false,
  defaultView = 'month',
  initialDate,
  allowCreation = true,
  allowEditing = true,
  allowDeletion = true,
  allowDragAndDrop = true,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateRangeChange,
  onViewChange,
  onRefreshRequest,
  eventRenderer,
  formatEventTime,
  allowThemeToggle = false,
  className,
  style,
  testId,
}: CalendarViewProps) {
  // State
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>(defaultView);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [showEventDialog, setShowEventDialog] = useState<boolean>(false);
  const [isEventDialogReadOnly, setIsEventDialogReadOnly] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [visibleSources, setVisibleSources] = useState<string[]>(
    calendarSources.filter(source => source.isVisible).map(source => source.id)
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { toast } = useToast();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  // Filtered events based on visible calendar sources and search query
  const filteredEvents = useMemo(() => {
    // Default visible events (if no calendar sources are provided)
    if (calendarSources.length === 0) {
      if (!debouncedSearchQuery) {
        return events;
      }

      return events.filter(event => {
        const searchText = debouncedSearchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(searchText) ||
          (event.description || '').toLowerCase().includes(searchText) ||
          (event.location?.title || '').toLowerCase().includes(searchText)
        );
      });
    }

    // Filter by visible sources and search query
    let filtered = events.filter(event => !event.source || visibleSources.includes(event.source));

    if (debouncedSearchQuery) {
      const searchText = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(event => {
        return (
          event.title.toLowerCase().includes(searchText) ||
          (event.description || '').toLowerCase().includes(searchText) ||
          (event.location?.title || '').toLowerCase().includes(searchText)
        );
      });
    }

    return filtered;
  }, [events, calendarSources, visibleSources, debouncedSearchQuery]);

  // Calculate visible date range
  const visibleDateRange = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (view) {
      case 'month':
        start = startOfWeek(startOfMonth(currentDate));
        end = endOfWeek(endOfMonth(currentDate));
        break;
      case 'week':
        start = startOfWeek(currentDate);
        end = endOfWeek(currentDate);
        break;
      case 'day':
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
        break;
      case 'agenda':
      default:
        start = startOfDay(currentDate);
        end = addMonths(currentDate, 3);
        break;
    }

    return { start, end };
  }, [currentDate, view]);

  // Notify parent when date range changes
  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(visibleDateRange.start, visibleDateRange.end);
    }
  }, [visibleDateRange, onDateRangeChange]);

  // Notify parent when view changes
  useEffect(() => {
    if (onViewChange) {
      onViewChange(view);
    }
  }, [view, onViewChange]);

  // Navigate to today
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Navigate to previous period
  const goToPrevious = useCallback(() => {
    switch (view) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'agenda':
        setCurrentDate(subDays(currentDate, 7));
        break;
    }
  }, [currentDate, view]);

  // Navigate to next period
  const goToNext = useCallback(() => {
    switch (view) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'agenda':
        setCurrentDate(addDays(currentDate, 7));
        break;
    }
  }, [currentDate, view]);

  // Format date range for header
  const formattedDateRange = useMemo(() => {
    const { start, end } = visibleDateRange;

    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'agenda':
        return `From ${format(start, 'MMM d, yyyy')}`;
    }
  }, [visibleDateRange, view, currentDate]);

  // Handle event click
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogReadOnly(true);
    setShowEventDialog(true);
  }, []);

  // Handle date click
  const handleDateClick = useCallback(
    (date: Date) => {
      setCurrentDate(date);

      if (view === 'month') {
        setView('day');
      }
    },
    [view]
  );

  // Handle time slot click for creating a new event
  const handleTimeSlotClick = useCallback(
    (date: Date) => {
      if (!allowCreation) return;

      const eventStart = date;
      const eventEnd = addHours(date, 1);

      setSelectedEvent(undefined);
      setIsEventDialogReadOnly(false);
      setIsCreating(true);
      setShowEventDialog(true);

      // Pre-fill form with selected time slot
      // This would be handled by the EventDialog component
    },
    [allowCreation]
  );

  // Handle event create button click
  const handleCreateEventClick = useCallback(() => {
    setSelectedEvent(undefined);
    setIsEventDialogReadOnly(false);
    setIsCreating(true);
    setShowEventDialog(true);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((newView: 'month' | 'week' | 'day' | 'agenda') => {
    setView(newView);
  }, []);

  // Handle refresh request
  const handleRefresh = useCallback(async () => {
    if (onRefreshRequest) {
      try {
        await onRefreshRequest();
        toast({
          title: 'Calendar refreshed',
          description: 'Your calendar has been updated with the latest events.',
        });
      } catch (error) {
        console.error('Error refreshing calendar:', error);
        toast({
          title: 'Refresh failed',
          description: 'There was an error refreshing your calendar.',
          variant: 'destructive',
        });
      }
    }
  }, [onRefreshRequest, toast]);

  // Toggle calendar source visibility
  const toggleCalendarSource = useCallback((sourceId: string) => {
    setVisibleSources(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)} style={style} data-testid={testId}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>

        <div className="bg-background border rounded-md overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-10 flex items-center justify-center">
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>

          <div>
            {Array.from({ length: 5 }).map((_, weekIndex) => (
              <div
                key={weekIndex}
                className="grid grid-cols-7 border-b last:border-b-0"
                style={{ height: '120px' }}
              >
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="border-r last:border-r-0 p-1.5 relative">
                    <Skeleton className="h-5 w-5 rounded-full" />

                    <div className="mt-1 space-y-1">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)} style={style} data-testid={testId}>
      {/* Calendar Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold">{formattedDateRange}</h2>

          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" onClick={goToPrevious} aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToToday} aria-label="Today">
              <div className="h-4 w-4 flex items-center justify-center text-xs font-medium">
                {format(new Date(), 'd')}
              </div>
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-8 w-[200px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* View selector */}
          <Tabs
            value={view}
            onValueChange={value => handleViewChange(value as any)}
            className="hidden md:flex"
          >
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Mobile view selector */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {view === 'month' && <Grid className="h-4 w-4 mr-2" />}
                  {view === 'week' && <MenuSquare className="h-4 w-4 mr-2" />}
                  {view === 'day' && <CalendarIcon className="h-4 w-4 mr-2" />}
                  {view === 'agenda' && <LayoutList className="h-4 w-4 mr-2" />}
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleViewChange('month')}>
                  <Grid className="h-4 w-4 mr-2" />
                  Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange('week')}>
                  <MenuSquare className="h-4 w-4 mr-2" />
                  Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange('day')}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange('agenda')}>
                  <LayoutList className="h-4 w-4 mr-2" />
                  Agenda
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Calendar sources */}
          {calendarSources.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Calendars
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Calendars</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {calendarSources.map(source => (
                  <DropdownMenuCheckboxItem
                    key={source.id}
                    checked={visibleSources.includes(source.id)}
                    onCheckedChange={() => toggleCalendarSource(source.id)}
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: source.color }}
                    />
                    {source.name}
                    {source.isReadOnly && (
                      <Badge variant="outline" className="ml-2 h-5 text-xs">
                        Read-only
                      </Badge>
                    )}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {onRefreshRequest && (
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>

              {allowThemeToggle && (
                <DropdownMenuItem>
                  <button className="flex items-center w-full">
                    <span className="mr-2">🌙</span>
                    Toggle theme
                  </button>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>View Options</DropdownMenuLabel>

              <DropdownMenuRadioGroup value={view} onValueChange={v => handleViewChange(v as any)}>
                <DropdownMenuRadioItem value="month">
                  <Grid className="h-4 w-4 mr-2" />
                  Month
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="week">
                  <MenuSquare className="h-4 w-4 mr-2" />
                  Week
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="day">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Day
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="agenda">
                  <LayoutList className="h-4 w-4 mr-2" />
                  Agenda
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create event button */}
          {allowCreation && (
            <Button onClick={handleCreateEventClick}>
              <Plus className="h-4 w-4 mr-2" />
              {isSmallScreen ? 'Add' : 'Create Event'}
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Views */}
      {debouncedSearchQuery && filteredEvents.length === 0 ? (
        <div className="bg-background border rounded-md p-8 text-center">
          <Search className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No events match your search for "{debouncedSearchQuery}"
          </p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear search
          </Button>
        </div>
      ) : (
        <>
          {/* Month View */}
          {view === 'month' && (
            <MonthView
              events={filteredEvents}
              currentDate={currentDate}
              categories={categories}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onDragEnd={allowDragAndDrop && allowEditing ? undefined : undefined}
              allowDragAndDrop={allowDragAndDrop && allowEditing}
            />
          )}

          {/* Week View */}
          {view === 'week' && (
            <WeekView
              events={filteredEvents}
              currentDate={currentDate}
              categories={categories}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onTimeSlotClick={handleTimeSlotClick}
              allowDragAndDrop={allowDragAndDrop && allowEditing}
            />
          )}

          {/* Day View */}
          {view === 'day' && (
            <DayView
              events={filteredEvents}
              currentDate={currentDate}
              categories={categories}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleTimeSlotClick}
              allowDragAndDrop={allowDragAndDrop && allowEditing}
            />
          )}

          {/* Agenda View */}
          {view === 'agenda' && (
            <AgendaView
              events={filteredEvents}
              currentDate={currentDate}
              categories={categories}
              onEventClick={handleEventClick}
              onRefresh={onRefreshRequest}
            />
          )}
        </>
      )}

      {/* Event Dialog */}
      <EventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        event={selectedEvent}
        categories={categories}
        onCreate={onEventCreate}
        onUpdate={allowEditing ? onEventUpdate : undefined}
        onDelete={allowDeletion ? onEventDelete : undefined}
        isReadOnly={isEventDialogReadOnly}
      />
    </div>
  );
}

// These components would typically be imported from a UI library
// For this example, they are mocked
const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60000);
};

function ColorPicker({
  color,
  onChange,
  presetColors,
}: {
  color: string;
  onChange: (color: string) => void;
  presetColors: string[];
}) {
  return (
    <div>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: color }} />
        <Input
          type="text"
          value={color}
          onChange={e => onChange(e.target.value)}
          className="w-24"
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {presetColors.map(presetColor => (
          <div
            key={presetColor}
            className={`w-6 h-6 rounded-md cursor-pointer ${
              color === presetColor ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
            style={{ backgroundColor: presetColor }}
            onClick={() => onChange(presetColor)}
          />
        ))}
      </div>
    </div>
  );
}

function DatePicker({
  date,
  onSelect,
  fromDate,
}: {
  date: Date;
  onSelect: (date: Date) => void;
  fromDate?: Date;
}) {
  return (
    <div className="flex items-center border rounded-md h-9 px-3">
      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
      <span>{format(date, 'PPP')}</span>
    </div>
  );
}

function TimePicker({ date, onSelect }: { date: Date; onSelect: (date: Date) => void }) {
  return (
    <div className="flex items-center border rounded-md h-9 px-3">
      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
      <span>{format(date, 'p')}</span>
    </div>
  );
}

function DateTimePicker({ date, fromDate }: { date: Date; fromDate?: Date }) {
  return (
    <div className="flex items-center border rounded-md h-9 px-3">
      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
      <span>{format(date, 'PPp')}</span>
    </div>
  );
}

export default CalendarView;
