'use client';

import * as React from 'react';
import { format, isValid, parse } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
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

export interface DatePickerProps {
  /**
   * The selected date
   */
  date?: Date;

  /**
   * Callback when date is selected
   */
  onSelect?: (date: Date | undefined) => void;

  /**
   * Minimum selectable date
   */
  fromDate?: Date;

  /**
   * Maximum selectable date
   */
  toDate?: Date;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Format to display the date
   */
  format?: string;

  /**
   * Whether the date picker is disabled
   */
  disabled?: boolean;

  /**
   * Whether to show today button
   */
  showTodayButton?: boolean;

  /**
   * Allow manual input with typing
   */
  allowInput?: boolean;

  /**
   * Additional classname for the trigger button
   */
  className?: string;

  /**
   * ID for the form input element
   */
  id?: string;

  /**
   * Name for the form input element
   */
  name?: string;

  /**
   * Modes for calendar selection
   */
  mode?: 'single' | 'range' | 'multiple';

  /**
   * Allow clearing the selected date
   */
  allowClear?: boolean;
}

/**
 * A date picker component
 */
export function DatePicker({
  date,
  onSelect,
  fromDate,
  toDate,
  placeholder = 'Select date',
  format: formatString = 'PPP',
  disabled = false,
  showTodayButton = true,
  allowInput = true,
  className,
  id,
  name,
  mode = 'single',
  allowClear = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>(
    date && isValid(date) ? format(date, formatString) : ''
  );

  // Update input value when date prop changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setInputValue(format(date, formatString));
    } else if (!date) {
      setInputValue('');
    }
  }, [date, formatString]);

  // Handle date selection
  const handleSelect = (newDate: Date | undefined) => {
    if (onSelect) {
      onSelect(newDate);
    }
    if (newDate && isValid(newDate)) {
      setInputValue(format(newDate, formatString));
    }
    setOpen(false);
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Try to parse the entered value as a date
    if (value) {
      try {
        const parsedDate = parse(value, formatString, new Date());
        if (isValid(parsedDate)) {
          if (onSelect) {
            onSelect(parsedDate);
          }
        }
      } catch (error) {
        console.error('Failed to parse date:', error);
      }
    } else if (allowClear && onSelect) {
      onSelect(undefined);
    }
  };

  // Handle clicks on today button
  const handleTodayClick = () => {
    const today = new Date();
    if (onSelect) {
      onSelect(today);
    }
    setInputValue(format(today, formatString));
    setOpen(false);
  };

  // Handle clearing the date
  const handleClear = () => {
    if (onSelect) {
      onSelect(undefined);
    }
    setInputValue('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {allowInput ? (
            <div className="relative">
              <Input
                id={id}
                name={name}
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
                className={cn('pl-10', className)}
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <Button
              id={id}
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground',
                className
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date && isValid(date) ? format(date, formatString) : placeholder}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode={mode}
            selected={date}
            onSelect={handleSelect}
            disabled={currentDate => {
              if (fromDate && currentDate < fromDate) return true;
              if (toDate && currentDate > toDate) return true;
              return false;
            }}
            initialFocus
          />
          <div className="flex items-center justify-between p-2 border-t border-border">
            {showTodayButton && (
              <Button type="button" variant="ghost" size="sm" onClick={handleTodayClick}>
                Today
              </Button>
            )}
            {allowClear && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!date}
              >
                Clear
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DatePicker;
