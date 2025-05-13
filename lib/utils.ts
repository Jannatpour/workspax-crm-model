// File: @/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine multiple class names using clsx and tailwind-merge
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with thousand separators and optional decimal places
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options: {
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    notation?: "standard" | "scientific" | "engineering" | "compact";
    compactDisplay?: "short" | "long";
    locale?: string;
  } = {}
): string {
  const {
    maximumFractionDigits = 0,
    minimumFractionDigits = 0,
    notation = "standard",
    compactDisplay = "short",
    locale = "en-US",
  } = options;
  
  try {
    // Handle edge cases
    if (value === undefined || value === null) return "0";
    if (isNaN(value)) return "N/A";
    
    // Format the number using Intl.NumberFormat
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits,
      minimumFractionDigits,
      notation,
      compactDisplay,
    }).format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    return value.toString();
  }
}

/**
 * Format a date string or Date object into a human-readable format
 * @param date - Date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | undefined | null,
  options: {
    format?: "short" | "medium" | "long" | "relative";
    includeTime?: boolean;
    locale?: string;
    timeZone?: string;
  } = {}
): string {
  if (!date) return "—";
  
  const {
    format = "medium",
    includeTime = false,
    locale = "en-US",
    timeZone,
  } = options;
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return "Invalid date";
    
    // For relative format
    if (format === "relative") {
      return formatRelativeTime(dateObj);
    }
    
    // Configure date formatting options
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone,
    };
    
    // Set dateStyle based on format
    switch (format) {
      case "short":
        dateOptions.dateStyle = "short";
        break;
      case "medium":
        dateOptions.dateStyle = "medium";
        break;
      case "long":
        dateOptions.dateStyle = "long";
        break;
      default:
        dateOptions.dateStyle = "medium";
    }
    
    // Add time if requested
    if (includeTime) {
      dateOptions.timeStyle = "short";
    }
    
    // Format the date
    return new Intl.DateTimeFormat(locale, dateOptions).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
}

/**
 * Format a date as a relative time (e.g., "2 days ago", "in 3 hours")
 * @param date - Date to format
 * @returns Relative time string
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const absSeconds = Math.abs(diffInSeconds);
  const isFuture = diffInSeconds > 0;
  
  // Helper function to format with proper plurality
  const format = (value: number, unit: string): string => {
    return `${isFuture ? 'in ' : ''}${value} ${unit}${value !== 1 ? 's' : ''}${isFuture ? '' : ' ago'}`;
  };
  
  // Less than a minute
  if (absSeconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  if (absSeconds < 3600) {
    const minutes = Math.floor(absSeconds / 60);
    return format(minutes, 'minute');
  }
  
  // Less than a day
  if (absSeconds < 86400) {
    const hours = Math.floor(absSeconds / 3600);
    return format(hours, 'hour');
  }
  
  // Less than a week
  if (absSeconds < 604800) {
    const days = Math.floor(absSeconds / 86400);
    return format(days, 'day');
  }
  
  // Less than a month (approximation)
  if (absSeconds < 2592000) {
    const weeks = Math.floor(absSeconds / 604800);
    return format(weeks, 'week');
  }
  
  // Less than a year (approximation)
  if (absSeconds < 31536000) {
    const months = Math.floor(absSeconds / 2592000);
    return format(months, 'month');
  }
  
  // Over a year
  const years = Math.floor(absSeconds / 31536000);
  return format(years, 'year');
}

/**
 * Format a number as a percentage
 * @param value - The decimal value to format as percentage (e.g., 0.75 for 75%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  options: {
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    includeSymbol?: boolean;
    locale?: string;
  } = {}
): string {
  const {
    maximumFractionDigits = 0,
    minimumFractionDigits = 0,
    includeSymbol = true,
    locale = "en-US",
  } = options;
  
  try {
    // Handle edge cases
    if (value === undefined || value === null) return "0%";
    if (isNaN(value)) return "N/A";
    
    // Convert decimal to percentage and format
    const percentValue = value * 100;
    
    if (includeSymbol) {
      return new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits,
        minimumFractionDigits,
      }).format(value);
    } else {
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits,
        minimumFractionDigits,
      }).format(percentValue);
    }
  } catch (error) {
    console.error("Error formatting percentage:", error);
    return value.toString();
  }
}

/**
 * Format a currency value
 * @param value - The number to format as currency
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  options: {
    currency?: string;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    notation?: "standard" | "scientific" | "engineering" | "compact";
    signDisplay?: "auto" | "always" | "never" | "exceptZero";
    locale?: string;
  } = {}
): string {
  const {
    currency = "USD",
    maximumFractionDigits = 2,
    minimumFractionDigits = 2,
    notation = "standard",
    signDisplay = "auto",
    locale = "en-US",
  } = options;
  
  try {
    // Handle edge cases
    if (value === undefined || value === null) return "$0";
    if (isNaN(value)) return "N/A";
    
    // Format the currency
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits,
      minimumFractionDigits,
      notation,
      signDisplay,
    }).format(value);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return value.toString();
  }
}

/**
 * Truncate text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + "...";
}

/**
 * Generate initials from a name (up to 2 characters)
 * @param name - Full name to generate initials from
 * @returns Initials (1-2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return "";
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Convert a string to a slug (URL-friendly string)
 * @param input - String to convert to slug
 * @returns URL-friendly slug
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')       // Remove all non-word chars
    .replace(/--+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Parse a string-based boolean value
 * @param value - Value to parse as boolean
 * @returns Boolean interpretation of the value
 */
export function parseBoolean(value: string | boolean | undefined | null): boolean {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  
  const lowered = value.toString().toLowerCase().trim();
  return lowered === 'true' || lowered === 'yes' || lowered === '1' || lowered === 'on';
}

/**
 * Check if two arrays have the same values (order-independent)
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Whether arrays contain the same values
 */
export function arraysEqual<T>(array1: T[], array2: T[]): boolean {
  if (array1.length !== array2.length) return false;
  
  const set1 = new Set(array1);
  for (const item of array2) {
    if (!set1.has(item)) return false;
  }
  
  return true;
}

/**
 * Generate a random color hex code
 * @param options - Options for color generation
 * @returns Random color as hex code
 */
export function randomColor(options: {
  saturation?: 'high' | 'medium' | 'low';
  brightness?: 'bright' | 'medium' | 'dark';
} = {}): string {
  const { saturation = 'medium', brightness = 'medium' } = options;
  
  // Define ranges for HSL values based on options
  let sMin = 50, sMax = 70;  // Saturation range
  let lMin = 45, lMax = 65;  // Lightness range
  
  // Adjust saturation range
  if (saturation === 'high') {
    sMin = 70; sMax = 100;
  } else if (saturation === 'low') {
    sMin = 20; sMax = 50;
  }
  
  // Adjust brightness range
  if (brightness === 'bright') {
    lMin = 65; lMax = 85;
  } else if (brightness === 'dark') {
    lMin = 25; lMax = 45;
  }
  
  // Generate random HSL values
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * (sMax - sMin + 1)) + sMin;
  const l = Math.floor(Math.random() * (lMax - lMin + 1)) + lMin;
  
  // Convert HSL to hex
  return hslToHex(h, s, l);
}

/**
 * Convert HSL color to hex code
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color code
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}

/**
 * A debounce function to limit how often a function can be called
 * @param fn - Function to debounce
 * @param ms - Debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * A throttle function to limit how often a function can be called
 * @param fn - Function to throttle
 * @param ms - Throttle interval in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let lastArgs: Parameters<T> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  function invoke() {
    if (lastArgs) {
      fn(...lastArgs);
      lastCall = Date.now();
      lastArgs = null;
    }
    timeoutId = null;
  }
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    lastArgs = args;
    
    if (timeSinceLastCall >= ms) {
      // If enough time has passed, call immediately
      invoke();
    } else if (!timeoutId) {
      // Otherwise, schedule a call after the remaining time
      timeoutId = setTimeout(invoke, ms - timeSinceLastCall);
    }
  };
}