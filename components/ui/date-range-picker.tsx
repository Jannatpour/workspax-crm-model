'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isValid,
  startOfDay,
  endOfDay,
  isToday,
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export interface DateRangePickerProps {
  /**
   * The currently selected date range
   */
  dateRange?: DateRange;

  /**
   * Callback when date range changes
   */
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;

  /**
   * Align the popover to start, center, or end
   * @default "center"
   */
  align?: 'start' | 'center' | 'end';

  /**
   * Placeholder to display when no date range is selected
   */
  placeholder?: string;

  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;

  /**
   * The format to display the date range
   */
  format?: string;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Minimum selectable date
   */
  fromDate?: Date;

  /**
   * Maximum selectable date
   */
  toDate?: Date;

  /**
   * Show preset date ranges like "Last 7 days", "This month", etc.
   */
  showPresets?: boolean;

  /**
   * Allow manual input with typing
   */
  allowInput?: boolean;

  /**
   * Allow selecting time in addition to dates
   */
  includeTime?: boolean;

  /**
   * Show a clear button to reset the selection
   */
  allowClear?: boolean;

  /**
   * The number of months to display at once
   */
  numberOfMonths?: number;
}

/**
 * Preset date ranges for quick selection
 */
const DEFAULT_PRESETS = [
  {
    name: 'Today',
    getValue: () => {
      const today = new Date();
      return {
        from: startOfDay(today),
        to: endOfDay(today),
      };
    },
  },
  {
    name: 'Yesterday',
    getValue: () => {
      const yesterday = addDays(new Date(), -1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
      };
    },
  },
  {
    name: 'Last 7 days',
    getValue: () => {
      const today = new Date();
      const weekAgo = addDays(today, -6);
      return {
        from: startOfDay(weekAgo),
        to: endOfDay(today),
      };
    },
  },
  {
    name: 'Last 30 days',
    getValue: () => {
      const today = new Date();
      const monthAgo = addDays(today, -29);
      return {
        from: startOfDay(monthAgo),
        to: endOfDay(today),
      };
    },
  },
  {
    name: 'This month',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        from: startOfDay(firstDay),
        to: endOfDay(lastDay),
      };
    },
  },
  {
    name: 'Last month',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        from: startOfDay(firstDay),
        to: endOfDay(lastDay),
      };
    },
  },
  {
    name: 'This year',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), 0, 1);
      const lastDay = new Date(today.getFullYear(), 11, 31);
      return {
        from: startOfDay(firstDay),
        to: endOfDay(lastDay),
      };
    },
  },
  {
    name: 'Last year',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear() - 1, 0, 1);
      const lastDay = new Date(today.getFullYear() - 1, 11, 31);
      return {
        from: startOfDay(firstDay),
        to: endOfDay(lastDay),
      };
    },
  },
];

/**
 * A date range picker component with presets and time selection
 */
export function CalendarDateRangePicker({
  dateRange,
  onDateRangeChange,
  align = 'center',
  placeholder = 'Select date range',
  disabled = false,
  format: formatString = 'MMM d, yyyy',
  className,
  fromDate,
  toDate,
  showPresets = true,
  allowInput = true,
  includeTime = false,
  allowClear = true,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(dateRange);
  const [startTime, setStartTime] = React.useState<{ hour: number; minute: number }>({
    hour: dateRange?.from ? dateRange.from.getHours() : 0,
    minute: dateRange?.from ? dateRange.from.getMinutes() : 0,
  });
  const [endTime, setEndTime] = React.useState<{ hour: number; minute: number }>({
    hour: dateRange?.to ? dateRange.to.getHours() : 23,
    minute: dateRange?.to ? dateRange.to.getMinutes() : 59,
  });
  const [inputValue, setInputValue] = React.useState<string>(
    formatDateRange(dateRange, formatString)
  );

  // Hours options for the time selector
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  // Minutes options for the time selector (increments of 5)
  const minutes = React.useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []);

  // Update selected range when the prop changes
  React.useEffect(() => {
    setSelectedRange(dateRange);
    setInputValue(formatDateRange(dateRange, formatString));

    if (dateRange?.from) {
      setStartTime({
        hour: dateRange.from.getHours(),
        minute: dateRange.from.getMinutes(),
      });
    }

    if (dateRange?.to) {
      setEndTime({
        hour: dateRange.to.getHours(),
        minute: dateRange.to.getMinutes(),
      });
    }
  }, [dateRange, formatString]);

  // Handle date range selection from the calendar
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range) return;

    // Apply time to the selected dates if time is included
    let newRange = range;

    if (includeTime && range.from) {
      const fromDate = new Date(range.from);
      fromDate.setHours(startTime.hour, startTime.minute, 0, 0);

      let toDate = range.to ? new Date(range.to) : new Date(range.from);
      toDate.setHours(endTime.hour, endTime.minute, 0, 0);

      // Ensure 'to' date is after 'from' date
      if (range.to && isBefore(toDate, fromDate)) {
        toDate = new Date(fromDate);
        toDate.setHours(23, 59, 59, 999);
      }

      newRange = {
        from: fromDate,
        to: toDate,
      };
    }

    setSelectedRange(newRange);

    // Only update the parent when both from and to are selected
    if (newRange.from && newRange.to) {
      if (onDateRangeChange) {
        onDateRangeChange(newRange);
      }
      setInputValue(formatDateRange(newRange, formatString));
    }
  };

  // Handle start time change
  const handleStartTimeChange = (type: 'hour' | 'minute', value: number) => {
    const newStartTime = {
      ...startTime,
      [type]: value,
    };
    setStartTime(newStartTime);

    if (selectedRange?.from) {
      const fromDate = new Date(selectedRange.from);
      fromDate.setHours(newStartTime.hour, newStartTime.minute, 0, 0);

      const newRange = {
        ...selectedRange,
        from: fromDate,
      };

      setSelectedRange(newRange);

      if (selectedRange.to && onDateRangeChange) {
        onDateRangeChange(newRange);
      }

      setInputValue(formatDateRange(newRange, formatString));
    }
  };

  // Handle end time change
  const handleEndTimeChange = (type: 'hour' | 'minute', value: number) => {
    const newEndTime = {
      ...endTime,
      [type]: value,
    };
    setEndTime(newEndTime);

    if (selectedRange?.to) {
      const toDate = new Date(selectedRange.to);
      toDate.setHours(newEndTime.hour, newEndTime.minute, 0, 0);

      const newRange = {
        ...selectedRange,
        to: toDate,
      };

      setSelectedRange(newRange);

      if (selectedRange.from && onDateRangeChange) {
        onDateRangeChange(newRange);
      }

      setInputValue(formatDateRange(newRange, formatString));
    }
  };

  // Handle applying a preset range
  const handlePresetSelect = (preset: (typeof DEFAULT_PRESETS)[number]) => {
    const range = preset.getValue();

    if (includeTime) {
      // Preserve existing time settings
      if (range.from) {
        range.from.setHours(startTime.hour, startTime.minute, 0, 0);
      }

      if (range.to) {
        range.to.setHours(endTime.hour, endTime.minute, 0, 0);
      }
    }

    setSelectedRange(range);

    if (onDateRangeChange) {
      onDateRangeChange(range);
    }

    setInputValue(formatDateRange(range, formatString));
    setOpen(false);
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Parsing manual input would require complex date parsing logic
    // This is a basic implementation that doesn't attempt to parse the input
  };

  // Apply selected range when the popover closes
  const handlePopoverOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen && selectedRange?.from && selectedRange?.to) {
      // Apply the selected range when closing the popover
      if (onDateRangeChange) {
        onDateRangeChange(selectedRange);
      }
    }
  };

  // Clear the selection
  const handleClear = () => {
    setSelectedRange(undefined);
    setInputValue('');

    if (onDateRangeChange) {
      onDateRangeChange(undefined);
    }

    setOpen(false);
  };

  return (
    <div className={className}>
      <Popover open={open && !disabled} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          {allowInput ? (
            <div className="relative">
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
                className={cn('pl-10 pr-10', className)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              {inputValue && allowClear && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full rounded-l-none"
                  onClick={e => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground',
                className
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>
                {selectedRange ? formatDateRange(selectedRange, formatString) : placeholder}
              </span>
              {selectedRange && (
                <Badge variant="outline" className="ml-2">
                  {calculateDateDifference(selectedRange)}
                </Badge>
              )}
              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className={cn('w-auto', numberOfMonths > 1 ? 'min-w-[800px]' : 'min-w-[350px]')}
          align={align}
        >
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={selectedRange?.from}
                selected={selectedRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={numberOfMonths}
                disabled={date => {
                  if (fromDate && isBefore(date, fromDate)) return true;
                  if (toDate && isAfter(date, toDate)) return true;
                  return false;
                }}
              />
            </div>

            {includeTime && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label className="text-xs font-normal text-muted-foreground">Start Time</Label>
                  <div className="flex gap-2">
                    <Select
                      value={startTime.hour.toString()}
                      onValueChange={value => handleStartTimeChange('hour', parseInt(value))}
                      disabled={!selectedRange?.from}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map(hour => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={startTime.minute.toString()}
                      onValueChange={value => handleStartTimeChange('minute', parseInt(value))}
                      disabled={!selectedRange?.from}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map(minute => (
                          <SelectItem key={minute} value={minute.toString()}>
                            {minute.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-normal text-muted-foreground">End Time</Label>
                  <div className="flex gap-2">
                    <Select
                      value={endTime.hour.toString()}
                      onValueChange={value => handleEndTimeChange('hour', parseInt(value))}
                      disabled={!selectedRange?.to}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map(hour => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={endTime.minute.toString()}
                      onValueChange={value => handleEndTimeChange('minute', parseInt(value))}
                      disabled={!selectedRange?.to}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map(minute => (
                          <SelectItem key={minute} value={minute.toString()}>
                            {minute.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showPresets && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_PRESETS.map(preset => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedRange?.from && selectedRange?.to && (
                <span>{calculateDateDifference(selectedRange)}</span>
              )}
            </div>
            <div className="flex gap-2">
              {allowClear && (
                <Button variant="outline" size="sm" onClick={handleClear} disabled={!selectedRange}>
                  Clear
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                disabled={!selectedRange?.from || !selectedRange?.to}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Format a date range as a string
 */
function formatDateRange(dateRange: DateRange | undefined, formatString: string): string {
  if (!dateRange?.from) return '';

  if (dateRange.to) {
    const fromDate = format(dateRange.from, formatString);
    const toDate = format(dateRange.to, formatString);

    if (fromDate === toDate) {
      return fromDate;
    }

    return `${fromDate} - ${toDate}`;
  }

  return format(dateRange.from, formatString);
}

/**
 * Calculate the difference between dates in a human-readable format
 */
function calculateDateDifference(dateRange: DateRange): string {
  if (!dateRange.from || !dateRange.to) return '';

  // Check if it's the same day
  if (format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')) {
    return isToday(dateRange.from) ? 'Today' : '1 day';
  }

  // Calculate the difference in days
  const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays === 7) return '1 week';
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;

  return `${Math.ceil(diffDays / 365)} years`;
}

export default CalendarDateRangePicker;
