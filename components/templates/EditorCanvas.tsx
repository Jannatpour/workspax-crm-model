import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Pencil,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Move,
  CornerBottomRight,
  TextCursorInput,
  PencilRuler,
  MousePointer,
  MoveHorizontal,
  ArrowUpDown,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { EmailComponent } from '../types';

interface EditorCanvasProps {
  components: EmailComponent[];
  selectedComponent: number | null;
  editMode: 'select' | 'resize' | 'text';
  resizingComponent: { componentIndex: number; handle: 'right' | 'bottom' | 'corner' } | null;
  activeTextEditor: { componentIndex: number; element: HTMLElement | null } | null;
  onSelectComponent: (index: number | null) => void;
  onStartTextEditing: (index: number, element: HTMLElement) => void;
  onStartResizing: (index: number, handle: 'right' | 'bottom' | 'corner') => void;
  onResize: (index: number, width?: string, height?: string) => void;
  onFinishResizing: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragStart: (index: string) => void;
  onRemoveComponent: (index: number) => void;
  onDuplicateComponent: (index: number) => void;
  onMoveComponent: (fromIndex: number, toIndex: number) => void;
  onChooseTemplate: () => void;
}

export function EditorCanvas({
  components,
  selectedComponent,
  editMode,
  resizingComponent,
  activeTextEditor,
  onSelectComponent,
  onStartTextEditing,
  onStartResizing,
  onResize,
  onFinishResizing,
  onDragOver,
  onDrop,
  onDragStart,
  onRemoveComponent,
  onDuplicateComponent,
  onMoveComponent,
  onChooseTemplate,
}: EditorCanvasProps) {
  const [hoveredDropZone, setHoveredDropZone] = useState<number | null>(null);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const componentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle scrolling to selected component
  useEffect(() => {
    if (
      selectedComponent !== null &&
      componentRefs.current[selectedComponent] &&
      scrollRef.current
    ) {
      const element = componentRefs.current[selectedComponent];
      const container = scrollRef.current;

      if (element && container) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [selectedComponent]);

  // Handle scrolling to newly added component
  useEffect(() => {
    if (scrollToIndex !== null && componentRefs.current[scrollToIndex]) {
      componentRefs.current[scrollToIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setScrollToIndex(null);
    }
  }, [scrollToIndex, components]);

  // Update refs array when components change
  useEffect(() => {
    componentRefs.current = componentRefs.current.slice(0, components.length);
  }, [components.length]);

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingComponent || !canvasRef.current) return;

      const { componentIndex, handle } = resizingComponent;
      const component = components[componentIndex];
      if (!component) return;

      const componentElement = componentRefs.current[componentIndex];
      if (!componentElement) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const componentRect = componentElement.getBoundingClientRect();

      // Calculate new dimensions based on mouse position
      if (handle === 'right' || handle === 'corner') {
        const width = Math.max(100, e.clientX - componentRect.left);
        const widthPercent = `${Math.round((width / canvasRect.width) * 100)}%`;
        onResize(componentIndex, widthPercent);
      }

      if (handle === 'bottom' || handle === 'corner') {
        const height = Math.max(40, e.clientY - componentRect.top);
        onResize(componentIndex, undefined, `${height}px`);
      }
    };

    const handleMouseUp = () => {
      if (resizingComponent) {
        onFinishResizing();
      }
    };

    if (resizingComponent) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingComponent, components, onResize, onFinishResizing]);

  // Handle moving component with drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      if (editMode !== 'select') return;

      // Only initiate drag with the move handle
      const target = e.target as HTMLElement;
      if (!target.closest('.component-move-handle')) return;

      e.preventDefault();
      setDragStartPos({ x: e.clientX, y: e.clientY });

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStartPos) return;

        // Calculate the drag distance
        const deltaY = moveEvent.clientY - dragStartPos.y;

        // If dragged more than 10px vertically, determine direction
        if (Math.abs(deltaY) > 10) {
          if (deltaY < 0 && index > 0) {
            // Dragged up - move component up
            onMoveComponent(index, index - 1);
            setDragStartPos({ x: moveEvent.clientX, y: moveEvent.clientY });
          } else if (deltaY > 0 && index < components.length - 1) {
            // Dragged down - move component down
            onMoveComponent(index, index + 1);
            setDragStartPos({ x: moveEvent.clientX, y: moveEvent.clientY });
          }
        }
      };

      const handleMouseUp = () => {
        setDragStartPos(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [editMode, dragStartPos, components.length, onMoveComponent]
  );

  // Render resize handles for a component
  const renderResizeHandles = (index: number) => {
    if (editMode !== 'resize' || selectedComponent !== index) return null;

    return (
      <>
        {/* Right handle */}
        <div
          className="absolute top-1/2 right-0 w-4 h-12 -translate-y-1/2 translate-x-1/2 cursor-ew-resize z-20"
          onMouseDown={() => onStartResizing(index, 'right')}
        >
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-primary"></div>
        </div>

        {/* Bottom handle */}
        <div
          className="absolute bottom-0 left-1/2 h-4 w-12 translate-y-1/2 -translate-x-1/2 cursor-ns-resize z-20"
          onMouseDown={() => onStartResizing(index, 'bottom')}
        >
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-primary"></div>
        </div>

        {/* Corner handle */}
        <div
          className="absolute bottom-0 right-0 h-8 w-8 translate-y-1/2 translate-x-1/2 cursor-nwse-resize z-20"
          onMouseDown={() => onStartResizing(index, 'corner')}
        >
          <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 border-2 border-primary bg-background rounded-sm"></div>
        </div>
      </>
    );
  };

  // Render drop zone between components
  const renderDropZone = (index: number) => (
    <div
      className={cn(
        'h-2 w-full transition-all duration-200 group',
        hoveredDropZone === index ? 'h-10' : ''
      )}
      onDragOver={e => {
        onDragOver(e);
        setHoveredDropZone(index);
      }}
      onDragLeave={() => setHoveredDropZone(null)}
      onDrop={e => {
        onDrop(e, index);
        setHoveredDropZone(null);
        setScrollToIndex(index);
      }}
    >
      <div
        className={cn(
          'w-full h-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-100',
          hoveredDropZone === index ? 'h-2 opacity-100' : ''
        )}
      ></div>
    </div>
  );

  // Find text elements in a component for direct text editing
  const findTextElements = (component: EmailComponent, componentIndex: number) => {
    // Skip text editing if not in text edit mode
    if (editMode !== 'text') return component.content;

    const parser = new DOMParser();
    const doc = parser.parseFromString(component.content, 'text/html');

    // Find all text elements (p, h1, h2, h3, h4, span, etc.)
    const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div:not(:has(*))');

    // If no text elements found, return original content
    if (textElements.length === 0) return component.content;

    // Add onclick handler to make text editable
    textElements.forEach(element => {
      // Skip if element only contains whitespace
      if (element.textContent?.trim() === '') return;

      // Add class for styling
      element.classList.add('editable-text');

      // Add data attribute to identify for event handlers
      element.setAttribute('data-editable', 'true');
      element.setAttribute('data-component-index', componentIndex.toString());
    });

    return doc.body.innerHTML;
  };

  // Click handler for text editing
  const handleTextElementClick = (e: React.MouseEvent) => {
    if (editMode !== 'text') return;

    // Find closest editable element
    const target = e.target as HTMLElement;
    const editableElement = target.closest('[data-editable="true"]') as HTMLElement;

    if (!editableElement) return;

    // Get component index
    const componentIndex = parseInt(editableElement.getAttribute('data-component-index') || '-1');
    if (componentIndex < 0) return;

    // Start text editing
    e.stopPropagation();
    onSelectComponent(componentIndex);
    onStartTextEditing(componentIndex, editableElement);
  };

  return (
    <div
      className="border-t h-[700px] overflow-hidden bg-slate-50 relative"
      onDragOver={onDragOver}
      ref={canvasRef}
      onClick={() => {
        // Deselect when clicking on the canvas background
        if (activeTextEditor) return; // Don't deselect while editing text
        onSelectComponent(null);
      }}
    >
      {/* Edit mode indicator */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="outline" className="bg-background">
          {editMode === 'select' && (
            <>
              <MousePointer className="h-3 w-3 mr-1" />
              Select Mode
            </>
          )}
          {editMode === 'resize' && (
            <>
              <PencilRuler className="h-3 w-3 mr-1" />
              Resize Mode
            </>
          )}
          {editMode === 'text' && (
            <>
              <TextCursorInput className="h-3 w-3 mr-1" />
              Text Edit Mode
            </>
          )}
        </Badge>
      </div>

      <div
        ref={scrollRef}
        className="relative max-w-2xl mx-auto border-x border-dashed border-gray-300 min-h-full bg-white px-1 overflow-auto h-full"
        onClick={e => {
          // Handle text element clicks for editing
          handleTextElementClick(e);
        }}
      >
        {components.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-center p-8 text-muted-foreground"
            onDragOver={onDragOver}
            onDrop={e => onDrop(e, 0)}
          >
            <div>
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Your Email is Empty</h3>
              <p className="mb-4">
                Drag components from the left sidebar to add them to your template.
              </p>
              <Button variant="outline" onClick={onChooseTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Choose a Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6">
            {/* Initial drop zone */}
            {renderDropZone(0)}

            {/* Components */}
            {components.map((component, index) => (
              <div
                key={component.id}
                ref={el => (componentRefs.current[index] = el)}
                className="relative"
              >
                <div
                  className={cn(
                    'group relative transition-all border-2 border-transparent',
                    selectedComponent === index && 'border-blue-500 shadow-sm',
                    (editMode === 'select' || editMode === 'resize') && 'hover:border-blue-200',
                    editMode === 'text' && 'hover:border-green-200'
                  )}
                >
                  {/* Component content */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: findTextElements(component, index),
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      if (activeTextEditor) return; // Don't change selection while editing text
                      onSelectComponent(index);
                    }}
                    onMouseDown={e => handleMouseDown(e, index)}
                    className="relative transition-all"
                  />

                  {/* Component type label */}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {component.name}
                    </div>
                  </div>

                  {/* Component controls - only show when selected */}
                  {selectedComponent === index && (
                    <div className="absolute -right-10 top-2 flex flex-col space-y-1 opacity-90">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 shadow-sm component-move-handle"
                            >
                              <Move className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">Drag to move</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 shadow-sm"
                              onClick={() => onDuplicateComponent(index)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">Duplicate</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 shadow-sm"
                              onClick={() => onRemoveComponent(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  {/* Show additional controls when component is selected */}
                  {selectedComponent === index && (
                    <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 shadow-sm"
                              onClick={() => onMoveComponent(index, Math.max(0, index - 1))}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Move up</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 shadow-sm"
                              onClick={() =>
                                onMoveComponent(index, Math.min(components.length - 1, index + 1))
                              }
                              disabled={index === components.length - 1}
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Move down</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  {/* Resize handles */}
                  {renderResizeHandles(index)}
                </div>

                {/* Drop zone after each component */}
                {renderDropZone(index + 1)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit mode footer */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center">
        <div className="bg-background rounded-full border shadow-sm flex text-xs p-1">
          {editMode === 'select' && (
            <span className="px-2 py-1">Click to select, or drag components to reorder</span>
          )}
          {editMode === 'resize' && (
            <span className="px-2 py-1">Select a component to resize using the handles</span>
          )}
          {editMode === 'text' && (
            <span className="px-2 py-1">Click on text to edit directly in the template</span>
          )}
        </div>
      </div>

      {/* Global styling for editable text */}
      <style jsx global>{`
        .editable-text {
          cursor: text;
          transition: background-color 0.2s;
        }
        .editable-text:hover {
          background-color: rgba(209, 250, 229, 0.2);
        }
        [contenteditable='true'] {
          outline: 2px solid #10b981;
          background-color: rgba(209, 250, 229, 0.3);
          padding: 2px;
        }
      `}</style>
    </div>
  );
}
