'use client';

import * as React from 'react';
import { GripVertical } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';
import { cn } from '@/lib/utils';

/**
 * ResizablePanelGroup component
 */
const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelGroup>,
  React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelGroup>
>(({ className, ...props }, ref) => (
  <ResizablePrimitive.PanelGroup
    ref={ref}
    className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)}
    {...props}
  />
));
ResizablePanelGroup.displayName = 'ResizablePanelGroup';

/**
 * Interface for ResizablePanel props
 */
interface ResizablePanelProps
  extends React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Panel> {
  /**
   * Whether the panel is collapsible
   */
  collapsible?: boolean;
  /**
   * Default collapsed state
   */
  defaultCollapsed?: boolean;
  /**
   * Minimum panel size
   */
  minSize?: number;
  /**
   * Maximum panel size
   */
  maxSize?: number;
  /**
   * Callback when panel is collapsed
   */
  onCollapse?: () => void;
  /**
   * Callback when panel is expanded
   */
  onExpand?: () => void;
  /**
   * Callback when panel is resized
   */
  onResize?: (size: number) => void;
}

/**
 * ResizablePanel component
 */
const ResizablePanel = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.Panel>,
  ResizablePanelProps
>(
  (
    {
      className,
      children,
      collapsible = false,
      defaultCollapsed = false,
      minSize = 10,
      maxSize = 90,
      onCollapse,
      onExpand,
      onResize,
      ...props
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const [size, setSize] = React.useState(0);

    const handleResize = React.useCallback(
      (newSize: number) => {
        setSize(newSize);
        onResize?.(newSize);
      },
      [onResize]
    );

    React.useEffect(() => {
      if (isCollapsed) {
        onCollapse?.();
      } else {
        onExpand?.();
      }
    }, [isCollapsed, onCollapse, onExpand]);

    return (
      <ResizablePrimitive.Panel
        ref={ref}
        className={cn(className)}
        collapsible={collapsible}
        defaultSize={defaultCollapsed ? 0 : undefined}
        minSize={minSize}
        maxSize={maxSize}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        onResize={handleResize}
        {...props}
      >
        {children}
      </ResizablePrimitive.Panel>
    );
  }
);
ResizablePanel.displayName = 'ResizablePanel';

/**
 * Interface for ResizableHandle props
 */
interface ResizableHandleProps
  extends React.ComponentPropsWithoutRef<typeof ResizablePrimitive.PanelResizeHandle> {
  /**
   * Show handle with grip
   */
  withHandle?: boolean;
}

/**
 * ResizableHandle component
 */
const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive.PanelResizeHandle>,
  ResizableHandleProps
>(({ className, withHandle = false, ...props }, ref) => (
  <ResizablePrimitive.PanelResizeHandle
    ref={ref}
    className={cn(
      'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-background">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
));
ResizableHandle.displayName = 'ResizableHandle';

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
