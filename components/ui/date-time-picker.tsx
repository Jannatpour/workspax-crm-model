'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, isValid, setHours, setMinutes, setSeconds, isAfter } from 'date-fns';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface DateTimePickerProps {
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
   * Format to display the date and time
   */
  format?: string;

  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;

  /**
   * Whether to use a 24-hour format for time
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
   * Show timezone selector
   */
  showTimezone?: boolean;
}

/**
 * A combined date and time picker component
 */
export function DateTimePicker({
  date,
  onSelect,
  fromDate,
  toDate,
  placeholder = 'Select date and time',
  format: formatString = 'PPP p',
  disabled = false,
  use24Hour = false,
  minuteStep = 5,
  allowInput = true,
  className,
  id,
  name,
  includeSeconds = false,
  showTimezone = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [inputValue, setInputValue] = React.useState<string>(
    date && isValid(date) ? format(date, formatString) : ''
  );

  // Hours for 12/24 hour format
  const hours = React.useMemo(() => {
    if (use24Hour) {
      return Array.from({ length: 24 }, (_, i) => i);
    } else {
      return Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
    }
  }, [use24Hour]);

  // Minutes based on specified step
  const minutes = React.useMemo(() => {
    return Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => i * minuteStep);
  }, [minuteStep]);

  // Seconds
  const seconds = React.useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i);
  }, []);

  // Update input value when date prop changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setSelectedDate(date);
      setInputValue(format(date, formatString));
    } else {
      setSelectedDate(undefined);
      setInputValue('');
    }
  }, [date, formatString]);

  // Handle date selection from calendar
  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;

    // Preserve time from previously selected date
    let newDate = date;

    if (selectedDate) {
      newDate = new Date(date);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      newDate.setSeconds(selectedDate.getSeconds());
      newDate.setMilliseconds(selectedDate.getMilliseconds());
    }

    setSelectedDate(newDate);
    updateDateAndTime(newDate);

    // Switch to time tab after selecting date
    setActiveTab('time');
  };

  // Handle time selection
  const handleSelectTime = (
    hours: number,
    minutes: number,
    seconds: number = 0,
    period?: 'AM' | 'PM'
  ) => {
    if (!selectedDate) {
      // If no date is selected, use today's date
      const today = new Date();
      setSelectedDate(today);
    }

    const newDate = new Date(selectedDate || new Date());

    // Adjust hours for AM/PM if not using 24-hour format
    let adjustedHours = hours;
    if (!use24Hour && period) {
      if (period === 'PM' && hours < 12) {
        adjustedHours = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        adjustedHours = 0;
      }
    }

    newDate.setHours(adjustedHours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(seconds);

    setSelectedDate(newDate);
    updateDateAndTime(newDate);
  };

  // Update the full date and time
  const updateDateAndTime = (newDate: Date) => {
    if (onSelect) {
      onSelect(newDate);
    }
    setInputValue(format(newDate, formatString));
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      try {
        // Try to parse the value as a date and time
        const parsedDate = new Date(value);

        if (isValid(parsedDate)) {
          setSelectedDate(parsedDate);
          if (onSelect) {
            onSelect(parsedDate);
          }
        }
      } catch (error) {
        console.error('Failed to parse date and time:', error);
      }
    } else if (onSelect) {
      onSelect(undefined);
    }
  };

  // Apply selected date and time
  const handleApply = () => {
    if (selectedDate) {
      if (onSelect) {
        onSelect(selectedDate);
      }
      setInputValue(format(selectedDate, formatString));
    }
    setOpen(false);
  };

  // Clear selection
  const handleClear = () => {
    setSelectedDate(undefined);
    setInputValue('');
    if (onSelect) {
      onSelect(undefined);
    }
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
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
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
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate && isValid(selectedDate)
                  ? format(selectedDate, formatString)
                  : placeholder}
              </div>
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'date' | 'time')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="date">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Date
              </TabsTrigger>
              <TabsTrigger value="time">
                <Clock className="h-4 w-4 mr-2" />
                Time
              </TabsTrigger>
            </TabsList>
            <TabsContent value="date" className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                disabled={date => {
                  if (fromDate && date < fromDate) return true;
                  if (toDate && date > toDate) return true;
                  return false;
                }}
                initialFocus
              />
            </TabsContent>
            <TabsContent value="time" className="p-4">
              <div className="flex flex-col space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {/* Hour selector */}
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="hour">Hour</Label>
                    <Select
                      value={
                        selectedDate
                          ? use24Hour
                            ? selectedDate.getHours().toString()
                            : (selectedDate.getHours() % 12 || 12).toString()
                          : ''
                      }
                      onValueChange={value => {
                        const hour = parseInt(value);
                        const minutes = selectedDate?.getMinutes() || 0;
                        const seconds = selectedDate?.getSeconds() || 0;
                        const period =
                          selectedDate && !use24Hour
                            ? selectedDate.getHours() >= 12
                              ? 'PM'
                              : 'AM'
                            : undefined;
                        handleSelectTime(hour, minutes, seconds, period);
                      }}
                    >
                      <SelectTrigger id="hour">
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

                  {/* Minute selector */}
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="minute">Minute</Label>
                    <Select
                      value={
                        selectedDate
                          ? (
                              Math.floor(selectedDate.getMinutes() / minuteStep) * minuteStep
                            ).toString()
                          : ''
                      }
                      onValueChange={value => {
                        const minutes = parseInt(value);
                        const hour = selectedDate?.getHours() || 0;
                        const seconds = selectedDate?.getSeconds() || 0;
                        const period =
                          selectedDate && !use24Hour
                            ? selectedDate.getHours() >= 12
                              ? 'PM'
                              : 'AM'
                            : undefined;
                        handleSelectTime(hour, minutes, seconds, period);
                      }}
                    >
                      <SelectTrigger id="minute">
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

                  {/* Seconds or AM/PM selector */}
                  {includeSeconds ? (
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="second">Second</Label>
                      <Select
                        value={selectedDate ? selectedDate.getSeconds().toString() : ''}
                        onValueChange={value => {
                          const seconds = parseInt(value);
                          const hour = selectedDate?.getHours() || 0;
                          const minutes = selectedDate?.getMinutes() || 0;
                          const period =
                            selectedDate && !use24Hour
                              ? selectedDate.getHours() >= 12
                                ? 'PM'
                                : 'AM'
                              : undefined;
                          handleSelectTime(hour, minutes, seconds, period);
                        }}
                      >
                        <SelectTrigger id="second">
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
                          value={
                            selectedDate ? (selectedDate.getHours() >= 12 ? 'PM' : 'AM') : 'AM'
                          }
                          onValueChange={value => {
                            const period = value as 'AM' | 'PM';
                            let hour = selectedDate?.getHours() || 0;

                            // Adjust hour based on period change
                            if (period === 'AM' && hour >= 12) {
                              hour -= 12;
                            } else if (period === 'PM' && hour < 12) {
                              hour += 12;
                            }

                            const minutes = selectedDate?.getMinutes() || 0;
                            const seconds = selectedDate?.getSeconds() || 0;

                            handleSelectTime(hour % 12 || 12, minutes, seconds, period);
                          }}
                        >
                          <SelectTrigger id="period">
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  )}

                  {/* For 12-hour format with seconds, add AM/PM below */}
                  {includeSeconds && !use24Hour && (
                    <div className="flex flex-col space-y-1 col-span-3">
                      <Label htmlFor="ampm">Period</Label>
                      <Select
                        value={selectedDate ? (selectedDate.getHours() >= 12 ? 'PM' : 'AM') : 'AM'}
                        onValueChange={value => {
                          const period = value as 'AM' | 'PM';
                          let hour = selectedDate?.getHours() || 0;

                          // Adjust hour based on period change
                          if (period === 'AM' && hour >= 12) {
                            hour -= 12;
                          } else if (period === 'PM' && hour < 12) {
                            hour += 12;
                          }

                          const minutes = selectedDate?.getMinutes() || 0;
                          const seconds = selectedDate?.getSeconds() || 0;

                          handleSelectTime(hour % 12 || 12, minutes, seconds, period);
                        }}
                      >
                        <SelectTrigger id="ampm">
                          <SelectValue placeholder="AM/PM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Optional timezone selector */}
                {showTimezone && (
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="UTC+0">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-8">(UTC-08:00) Pacific Time</SelectItem>
                        <SelectItem value="UTC-5">(UTC-05:00) Eastern Time</SelectItem>
                        <SelectItem value="UTC+0">
                          (UTC+00:00) Coordinated Universal Time
                        </SelectItem>
                        <SelectItem value="UTC+1">(UTC+01:00) Central European Time</SelectItem>
                        <SelectItem value="UTC+8">(UTC+08:00) China Standard Time</SelectItem>
                        <SelectItem value="UTC+9">(UTC+09:00) Japan Standard Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between p-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!selectedDate}
            >
              Clear
            </Button>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleApply} disabled={!selectedDate}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateTimePicker;
