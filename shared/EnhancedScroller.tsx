import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedScrollerProps {
  className?: string;
  children: React.ReactNode;
  maxHeight?: string | number;
  showControls?: boolean;
  stickyHeader?: React.ReactNode;
  scrollToTopButton?: boolean;
  horizontalScroll?: boolean;
  onScroll?: (scrollPosition: number) => void;
  scrollPadding?: number;
}

export function EnhancedScroller({
  className,
  children,
  maxHeight = '400px',
  showControls = false,
  stickyHeader,
  scrollToTopButton = false,
  horizontalScroll = false,
  onScroll,
  scrollPadding = 20,
}: EnhancedScrollerProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPosition = element.scrollTop;
    const maxScroll = element.scrollHeight - element.clientHeight;

    // Update state based on scroll position
    setIsAtTop(scrollPosition <= 10);
    setIsAtBottom(maxScroll - scrollPosition <= 10);
    setShowScrollTop(scrollPosition > 300);

    // Invoke callback if provided
    if (onScroll) {
      onScroll(scrollPosition);
    }
  };

  // Scroll controls
  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop -= scrollPadding * 5;
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop += scrollPadding * 5;
    }
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Adjust scroll position when content changes
  useEffect(() => {
    if (scrollRef.current && contentRef.current) {
      const scrollElement = scrollRef.current;
      const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;

      setIsAtBottom(maxScroll - scrollElement.scrollTop <= 10);
    }
  }, [children]);

  return (
    <div className={cn('relative', className)}>
      {/* Sticky header if provided */}
      {stickyHeader && <div className="sticky top-0 z-10 bg-background">{stickyHeader}</div>}

      {/* Main scroll area */}
      <ScrollArea
        ref={scrollRef}
        className={cn('transition-all', horizontalScroll ? 'overflow-x-auto' : 'overflow-x-hidden')}
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        <div ref={contentRef} className={cn('relative', horizontalScroll && 'min-w-max')}>
          {children}
        </div>

        {/* Scroll to top button */}
        {scrollToTopButton && showScrollTop && (
          <div className="absolute bottom-4 right-4 z-20">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-md opacity-80 hover:opacity-100"
              onClick={scrollToTop}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Scroll controls */}
      {showControls && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-80 hover:opacity-100 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
            onClick={scrollUp}
            disabled={isAtTop}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-80 hover:opacity-100 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
            onClick={scrollDown}
            disabled={isAtBottom}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
