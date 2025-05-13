'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { format, parse, setHours, setMinutes, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

export interface TimePickerProps {
  /**
   * The selected date/time
   */
  date?: Date;

  /**
   * Callback when time is selected
   */
  onSelect?: (date: Date | undefined) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Format to display the time
   */
  format?: string;

  /**
   * Whether the time picker is disabled
   */
  disabled?: boolean;

  /**
   * Whether to use a 24-hour format
   */
  use24Hour?: boolean;

  /**
   * The step for minutes selection
   */
  minuteStep?: number;

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
   * Allow seconds selection
   */
  includeSeconds?: boolean;

  /**
   * Maximum selectable time
   */
  maxTime?: Date;

  /**
   * Minimum selectable time
   */
  minTime?: Date;
}

/**
 * A time picker component
 */
export function TimePicker({
  date = new Date(),
  onSelect,
  placeholder = 'Select time',
  format: formatString = 'h:mm a',
  disabled = false,
  use24Hour = false,
  minuteStep = 15,
  allowInput = true,
  className,
  id,
  name,
  includeSeconds = false,
  maxTime,
  minTime,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>(
    date ? format(date, formatString) : ''
  );
  const [selectedHour, setSelectedHour] = React.useState<number>(date ? date.getHours() : 12);
  const [selectedMinute, setSelectedMinute] = React.useState<number>(
    date ? Math.floor(date.getMinutes() / minuteStep) * minuteStep : 0
  );
  const [selectedSecond, setSelectedSecond] = React.useState<number>(date ? date.getSeconds() : 0);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'AM' | 'PM'>(
    date ? (date.getHours() >= 12 ? 'PM' : 'AM') : 'AM'
  );

  // Generate arrays for hours, minutes, and seconds options
  const hours = React.useMemo(() => {
    if (use24Hour) {
      return Array.from({ length: 24 }, (_, i) => i);
    }
    return Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
  }, [use24Hour]);

  const minutes = React.useMemo(() => {
    return Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => i * minuteStep);
  }, [minuteStep]);

  const seconds = React.useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i);
  }, []);

  // Update input value and selected values when date prop changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setInputValue(format(date, formatString));
      setSelectedHour(use24Hour ? date.getHours() : date.getHours() % 12 || 12);
      setSelectedMinute(Math.floor(date.getMinutes() / minuteStep) * minuteStep);
      setSelectedSecond(date.getSeconds());
      setSelectedPeriod(date.getHours() >= 12 ? 'PM' : 'AM');
    } else {
      setInputValue('');
    }
  }, [date, formatString, use24Hour, minuteStep]);

  // Update the time based on selections
  const updateTime = React.useCallback(() => {
    if (!date) return;

    let hours = selectedHour;

    // Convert 12-hour format to 24-hour if needed
    if (!use24Hour) {
      if (selectedPeriod === 'PM' && selectedHour < 12) {
        hours = selectedHour + 12;
      } else if (selectedPeriod === 'AM' && selectedHour === 12) {
        hours = 0;
      }
    }

    // Create new date with selected time
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(selectedMinute);

    if (includeSeconds) {
      newDate.setSeconds(selectedSecond);
    } else {
      newDate.setSeconds(0);
    }

    // Check if time is within bounds
    if ((minTime && newDate < minTime) || (maxTime && newDate > maxTime)) {
      return;
    }

    if (onSelect) {
      onSelect(newDate);
    }

    setInputValue(format(newDate, formatString));
  }, [
    date,
    selectedHour,
    selectedMinute,
    selectedSecond,
    selectedPeriod,
    onSelect,
    formatString,
    use24Hour,
    includeSeconds,
    minTime,
    maxTime,
  ]);

  // Apply time changes and close the popover
  const applyTimeChange = () => {
    updateTime();
    setOpen(false);
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      try {
        // Try to parse the input as a time
        const today = new Date();
        const parsedDate = parse(value, formatString, today);

        if (isValid(parsedDate)) {
          setSelectedHour(use24Hour ? parsedDate.getHours() : parsedDate.getHours() % 12 || 12);
          setSelectedMinute(Math.floor(parsedDate.getMinutes() / minuteStep) * minuteStep);
          setSelectedSecond(parsedDate.getSeconds());
          setSelectedPeriod(parsedDate.getHours() >= 12 ? 'PM' : 'AM');

          if (onSelect) {
            onSelect(parsedDate);
          }
        }
      } catch (error) {
        console.error('Failed to parse time:', error);
      }
    }
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
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <Clock className="mr-2 h-4 w-4" />
              {date && isValid(date) ? format(date, formatString) : placeholder}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="hour">Hour</Label>
                <Select
                  value={selectedHour.toString()}
                  onValueChange={value => setSelectedHour(parseInt(value))}
                >
                  <SelectTrigger id="hour" aria-label="Hour">
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
              </div>

              <div className="flex flex-col space-y-1">
                <Label htmlFor="minute">Minute</Label>
                <Select
                  value={selectedMinute.toString()}
                  onValueChange={value => setSelectedMinute(parseInt(value))}
                >
                  <SelectTrigger id="minute" aria-label="Minute">
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

              {includeSeconds ? (
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="second">Second</Label>
                  <Select
                    value={selectedSecond.toString()}
                    onValueChange={value => setSelectedSecond(parseInt(value))}
                  >
                    <SelectTrigger id="second" aria-label="Second">
                      <SelectValue placeholder="Second" />
                    </SelectTrigger>
                    <SelectContent>
                      {seconds.map(second => (
                        <SelectItem key={second} value={second.toString()}>
                          {second.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                !use24Hour && (
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="period">Period</Label>
                    <Select
                      value={selectedPeriod}
                      onValueChange={value => setSelectedPeriod(value as 'AM' | 'PM')}
                    >
                      <SelectTrigger id="period" aria-label="Period">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )
              )}

              {includeSeconds && !use24Hour && (
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={selectedPeriod}
                    onValueChange={value => setSelectedPeriod(value as 'AM' | 'PM')}
                  >
                    <SelectTrigger id="period" aria-label="Period">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={applyTimeChange}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default TimePicker;
