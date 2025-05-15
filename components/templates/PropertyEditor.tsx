import React from 'react';
import { EnhancedSlider } from '@/shared/Slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Copy, CornerUpLeft } from 'lucide-react';
import { PropertyDefinition } from '@/components/templates/types';
import { EmailComponent } from '@/components/templates/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface PropertyEditorProps {
  component: EmailComponent;
  properties: PropertyDefinition[];
  getPropertyValue: (property: string) => string | number;
  handlePropertyChange: (property: string, value: string | number) => void;
  handleDuplicateComponent: () => void;
  handleRemoveComponent: () => void;
  onBack: () => void;
}

export function PropertyEditor({
  component,
  properties,
  getPropertyValue,
  handlePropertyChange,
  handleDuplicateComponent,
  handleRemoveComponent,
  onBack,
}: PropertyEditorProps) {
  const [editingColorProperty, setEditingColorProperty] = React.useState<PropertyDefinition | null>(
    null
  );

  const renderPropertyField = (property: PropertyDefinition) => {
    const value = getPropertyValue(property.name);

    switch (property.type) {
      case 'text':
        return (
          <Input
            id={`property-${property.name}`}
            type="text"
            value={typeof value === 'string' ? value : String(value)}
            onChange={e => handlePropertyChange(property.name, e.target.value)}
            placeholder={property.label}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={`property-${property.name}`}
            value={typeof value === 'string' ? value : String(value)}
            onChange={e => handlePropertyChange(property.name, e.target.value)}
            placeholder={property.label}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select
            value={typeof value === 'string' ? value : String(value)}
            onValueChange={val => handlePropertyChange(property.name, val)}
          >
            <SelectTrigger id={`property-${property.name}`}>
              <SelectValue placeholder={property.label} />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'color':
        return (
          <div className="flex gap-2 items-center">
            <div
              className="w-6 h-6 border rounded-md cursor-pointer shadow-sm"
              style={{ backgroundColor: typeof value === 'string' ? value : '#ffffff' }}
              onClick={() => setEditingColorProperty(property)}
            />
            <Input
              id={`property-${property.name}`}
              type="text"
              value={typeof value === 'string' ? value : String(value)}
              onChange={e => handlePropertyChange(property.name, e.target.value)}
              placeholder={property.label}
            />
          </div>
        );

      case 'number':
        // Extract unit if present in the value (e.g., "10px" -> "px")
        let numberValue = typeof value === 'number' ? value : parseFloat(String(value));
        let unit = typeof value === 'string' ? value.replace(/[0-9.]/g, '') : 'px';
        if (isNaN(numberValue)) numberValue = 0;
        if (!unit) unit = 'px';

        // Determine min, max, and step values for the slider
        const min = property.min !== undefined ? property.min : 0;
        const max = property.max !== undefined ? property.max : 100;
        const step = property.step !== undefined ? property.step : 1;

        // Add meaningful marks for the slider
        const marks = [
          { value: min, label: min.toString() },
          { value: max, label: max.toString() },
        ];

        if (max - min > 50) {
          const middle = Math.floor((max + min) / 2);
          marks.push({ value: middle, label: middle.toString() });
        }

        return (
          <EnhancedSlider
            label={property.label}
            min={min}
            max={max}
            step={step}
            defaultValue={numberValue}
            value={numberValue}
            onChange={val => handlePropertyChange(property.name, unit ? `${val}${unit}` : val)}
            unit={unit}
            marks={marks}
            onAfterChange={val => {
              console.log(`${property.name} changed to ${val}${unit}`);
            }}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              id={`property-${property.name}`}
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={e =>
                handlePropertyChange(property.name, e.target.checked ? 'true' : 'false')
              }
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor={`property-${property.name}`}
              className="text-sm font-medium text-gray-700"
            >
              {property.label}
            </label>
          </div>
        );

      default:
        return (
          <Input
            id={`property-${property.name}`}
            type="text"
            value={typeof value === 'string' ? value : String(value)}
            onChange={e => handlePropertyChange(property.name, e.target.value)}
            placeholder={property.label}
          />
        );
    }
  };

  const colorOptions = [
    '#000000',
    '#ffffff',
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#ff5722',
    '#795548',
    '#9e9e9e',
    '#607d8b',
    '#f5f5f5',
    '#eeeeee',
    '#e0e0e0',
    '#bdbdbd',
    '#757575',
    '#616161',
    '#424242',
    '#212121',
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-3">
        <div>
          <h3 className="text-lg font-medium">Customize Component</h3>
          <p className="text-sm text-muted-foreground">{component.name}</p>
        </div>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDuplicateComponent}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate component</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                  <CornerUpLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to components</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg">
          <p className="mb-2">No editable properties available</p>
          <p className="text-sm">This component cannot be customized.</p>
        </div>
      ) : (
        <>
          <div className="space-y-5 pb-4">
            {properties.map(property => (
              <div key={property.name} className="space-y-2">
                {property.type !== 'number' && (
                  <Label htmlFor={`property-${property.name}`} className="text-sm font-medium">
                    {property.label}
                  </Label>
                )}
                {renderPropertyField(property)}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t flex justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveComponent}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
            <Button variant="outline" size="sm" onClick={onBack}>
              Done
            </Button>
          </div>
        </>
      )}

      {/* Color picker dialog */}
      {editingColorProperty && (
        <Dialog open={true} onOpenChange={() => setEditingColorProperty(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose a color</DialogTitle>
              <DialogDescription>
                Select a color or enter a hex code for {editingColorProperty.label.toLowerCase()}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-10 gap-2 py-4">
              {colorOptions.map((color, index) => (
                <div
                  key={`${color}-${index}`}
                  className={cn(
                    'w-6 h-6 border rounded-md cursor-pointer hover:scale-110 transition-transform',
                    color === '#ffffff' && 'border-gray-300'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    handlePropertyChange(editingColorProperty.name, color);
                    setEditingColorProperty(null);
                  }}
                />
              ))}
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setEditingColorProperty(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const currentValue = getPropertyValue(editingColorProperty.name);
                  handlePropertyChange(editingColorProperty.name, currentValue);
                  setEditingColorProperty(null);
                }}
              >
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
