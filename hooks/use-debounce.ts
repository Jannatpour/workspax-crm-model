import { useState, useEffect } from 'react';

/**
 * A hook that debounces a value, only updating the returned value after the specified delay has passed
 * since the last change to the input value.
 * 
 * @param value The value to debounce
 * @param delay The debounce delay in milliseconds
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * // In a component:
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * // Use debouncedSearchTerm for API calls
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Make API call with debouncedSearchTerm
 *   }
 * }, [debouncedSearchTerm]);
 * 
 * return (
 *   <input
 *     type="text"
 *     value={searchTerm}
 *     onChange={(e) => setSearchTerm(e.target.value)}
 *     placeholder="Search..."
 *   />
 * );
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value or delay changes (or on unmount)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Re-run the effect when value or delay changes

  return debouncedValue;
}

/**
 * A hook that returns a debounced version of the provided function.
 * The debounced function will delay invoking the function until after `delay` milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * 
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced function
 * 
 * @example
 * ```tsx
 * // In a component:
 * const handleSearch = (term: string) => {
 *   // Make API call with term
 * };
 * 
 * const debouncedHandleSearch = useDebouncedCallback(handleSearch, 500);
 * 
 * return (
 *   <input
 *     type="text"
 *     onChange={(e) => debouncedHandleSearch(e.target.value)}
 *     placeholder="Search..."
 *   />
 * );
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // The debounced function
  const debouncedFn = (...args: Parameters<T>) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    const id = setTimeout(() => {
      fn(...args);
    }, delay);

    setTimeoutId(id);
  };

  // Clean up the timeout when the component unmounts or when fn/delay changes
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fn, delay, timeoutId]);

  return debouncedFn;
}

/**
 * A hook that tracks whether a debounce is currently active.
 * This can be useful for showing loading indicators while waiting for the debounced action.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns An object containing the debounced value and a boolean indicating if the debounce is active
 * 
 * @example
 * ```tsx
 * // In a component:
 * const [searchTerm, setSearchTerm] = useState('');
 * const { debouncedValue, isDebouncing } = useDebounceWithStatus(searchTerm, 500);
 * 
 * return (
 *   <div>
 *     <input
 *       type="text"
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *     {isDebouncing && <span>Typing...</span>}
 *   </div>
 * );
 * ```
 */
export function useDebounceWithStatus<T>(value: T, delay: number): {
  debouncedValue: T;
  isDebouncing: boolean;
} {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  useEffect(() => {
    if (value !== debouncedValue) {
      setIsDebouncing(true);
    }

    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, debouncedValue]);

  return { debouncedValue, isDebouncing };
}

export default useDebounce;