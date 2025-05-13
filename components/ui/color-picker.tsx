'use client';

import * as React from 'react';
import { Paintbrush, Check, Copy, Pipette, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

export interface ColorPickerProps {
  /**
   * The currently selected color in hex format (e.g., #FF0000)
   */
  color: string;

  /**
   * Callback when a color is selected
   */
  onChange: (color: string) => void;

  /**
   * Preset colors to display for quick selection
   */
  presetColors?: string[];

  /**
   * Additional CSS className
   */
  className?: string;

  /**
   * Whether the color picker is disabled
   */
  disabled?: boolean;

  /**
   * Allow opacity/alpha selection
   */
  allowOpacity?: boolean;

  /**
   * Show a color picker dropper tool
   */
  showDropper?: boolean;

  /**
   * Color picker mode - simple has just presets, full has all controls
   */
  mode?: 'simple' | 'full';

  /**
   * Show hex input field
   */
  showHexInput?: boolean;

  /**
   * Disabled colors that can't be selected
   */
  disabledColors?: string[];

  /**
   * Placeholder when no color is selected
   */
  placeholder?: string;

  /**
   * Allow copying the color code to clipboard
   */
  allowCopy?: boolean;
}

/**
 * A custom color picker component
 */
export function ColorPicker({
  color,
  onChange,
  presetColors = [
    '#000000', // Black
    '#ffffff', // White
    '#f44336', // Red
    '#e91e63', // Pink
    '#9c27b0', // Purple
    '#673ab7', // Deep Purple
    '#3f51b5', // Indigo
    '#2196f3', // Blue
    '#03a9f4', // Light Blue
    '#00bcd4', // Cyan
    '#009688', // Teal
    '#4caf50', // Green
    '#8bc34a', // Light Green
    '#cddc39', // Lime
    '#ffeb3b', // Yellow
    '#ffc107', // Amber
    '#ff9800', // Orange
    '#ff5722', // Deep Orange
    '#795548', // Brown
    '#607d8b', // Blue Grey
  ],
  className,
  disabled = false,
  allowOpacity = false,
  showDropper = false,
  mode = 'full',
  showHexInput = true,
  disabledColors = [],
  placeholder = 'Select color',
  allowCopy = true,
}: ColorPickerProps) {
  const [hue, setHue] = React.useState<number>(0);
  const [saturation, setSaturation] = React.useState<number>(0);
  const [lightness, setLightness] = React.useState<number>(0);
  const [alpha, setAlpha] = React.useState<number>(100);
  const [pickerColor, setPickerColor] = React.useState<string>(color);
  const [hexInputValue, setHexInputValue] = React.useState<string>(color.replace('#', ''));
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const { toast } = useToast();

  // Convert the input hex color to HSL components on mount and when color prop changes
  React.useEffect(() => {
    if (color) {
      const { h, s, l, a } = hexToHSLA(color);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      if (allowOpacity) {
        setAlpha(a * 100);
      }
      setHexInputValue(color.replace('#', ''));
    }
  }, [color, allowOpacity]);

  // Update the picker color when HSL values change
  React.useEffect(() => {
    const newColor = allowOpacity
      ? hslaToHex(hue, saturation, lightness, alpha / 100)
      : hslToHex(hue, saturation, lightness);
    setPickerColor(newColor);
    // We don't want to trigger the onChange handler here to avoid
    // circular updates when the parent component re-renders
  }, [hue, saturation, lightness, alpha, allowOpacity]);

  // Handle selection from color palette
  const handleColorPaletteSelect = (x: number, y: number) => {
    // x (0-1) represents saturation, y (0-1) represents lightness inverted
    const newSaturation = Math.max(0, Math.min(100, x * 100));
    const newLightness = Math.max(0, Math.min(100, 100 - y * 100));

    setSaturation(newSaturation);
    setLightness(newLightness);
  };

  // Handle mouse/touch interaction with the color palette
  const handleColorPaletteInteraction = (
    event: React.MouseEvent | React.TouchEvent,
    paletteRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!paletteRef.current) return;

    const rect = paletteRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    handleColorPaletteSelect(x, y);
  };

  // Apply the selected color
  const applyColor = (colorToApply?: string) => {
    const finalColor = colorToApply || pickerColor;
    onChange(finalColor);
    setIsOpen(false);
  };

  // Handle preset color selection
  const handlePresetColorSelect = (presetColor: string) => {
    if (disabledColors.includes(presetColor)) return;

    const { h, s, l, a } = hexToHSLA(presetColor);
    setHue(h);
    setSaturation(s);
    setLightness(l);
    if (allowOpacity) {
      setAlpha(a * 100);
    }
    onChange(presetColor);
  };

  // Handle hex input change
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9A-Fa-f]/g, '').substr(0, 6);
    setHexInputValue(value);

    if (value.length === 6) {
      const newColor = `#${value}`;
      const { h, s, l } = hexToHSLA(newColor);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      // Don't trigger onChange here to avoid duplicate updates
    }
  };

  // Apply hex input when blurred or enter is pressed
  const applyHexInput = () => {
    if (hexInputValue.length === 6) {
      const newColor = `#${hexInputValue}`;
      onChange(newColor);
    }
  };

  // Handle input key press
  const handleHexInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyHexInput();
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(pickerColor).then(() => {
      toast({
        title: 'Color copied',
        description: `${pickerColor} has been copied to clipboard.`,
      });
    });
  };

  // Use the eye dropper API if available
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // @ts-ignore - EyeDropper is not in the TypeScript DOM types yet
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        const newColor = result.sRGBHex;

        // Update all states
        const { h, s, l } = hexToHSLA(newColor);
        setHue(h);
        setSaturation(s);
        setLightness(l);
        setHexInputValue(newColor.replace('#', ''));
        onChange(newColor);
      } catch (error) {
        console.error('Eye dropper error:', error);
      }
    } else {
      toast({
        title: 'Not supported',
        description: 'The color picker tool is not supported in this browser.',
        variant: 'destructive',
      });
    }
  };

  // Color palette component with interaction handling
  const ColorPalettePicker = () => {
    const paletteRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      handleColorPaletteInteraction(e, paletteRef);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
        handleColorPaletteInteraction(e, paletteRef);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      handleColorPaletteInteraction(e, paletteRef);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      handleColorPaletteInteraction(e, paletteRef);
    };

    React.useEffect(() => {
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

    return (
      <div className="space-y-4">
        {/* Color palette */}
        <div
          ref={paletteRef}
          className="relative h-40 w-full rounded-md cursor-crosshair"
          style={{
            backgroundColor: `hsl(${hue}, 100%, 50%)`,
            backgroundImage: `
              linear-gradient(to right, white, transparent),
              linear-gradient(to top, black, transparent)
            `,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Selection indicator */}
          <div
            className="absolute h-4 w-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${saturation}%`,
              top: `${100 - lightness}%`,
            }}
          />
        </div>

        {/* Hue slider */}
        <div className="space-y-1">
          <Label>Hue</Label>
          <div
            className="h-4 rounded-md w-full relative"
            style={{
              background: `linear-gradient(to right,
                #f00 0%, #ff0 17%, #0f0 33%,
                #0ff 50%, #00f 67%, #f0f 83%, #f00 100%
              )`,
            }}
          >
            <Slider
              min={0}
              max={360}
              step={1}
              value={[hue]}
              onValueChange={values => setHue(values[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Hue"
            />
          </div>
        </div>

        {/* Alpha slider (if enabled) */}
        {allowOpacity && (
          <div className="space-y-1">
            <Label>Opacity</Label>
            <div
              className="h-4 rounded-md w-full relative"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #ccc 25%, transparent 25%),
                  linear-gradient(-45deg, #ccc 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #ccc 75%),
                  linear-gradient(-45deg, transparent 75%, #ccc 75%)
                `,
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
              }}
            >
              <div
                className="absolute inset-0 rounded-md"
                style={{
                  background: `linear-gradient(to right,
                    transparent, ${hslToHex(hue, saturation, lightness)}
                  )`,
                }}
              />
              <Slider
                min={0}
                max={100}
                step={1}
                value={[alpha]}
                onValueChange={values => setAlpha(values[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Opacity"
              />
            </div>
          </div>
        )}

        {/* HSL value inputs */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="h-value">H</Label>
            <Input
              id="h-value"
              type="number"
              min={0}
              max={360}
              value={Math.round(hue)}
              onChange={e => setHue(Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="s-value">S</Label>
            <Input
              id="s-value"
              type="number"
              min={0}
              max={100}
              value={Math.round(saturation)}
              onChange={e => setSaturation(Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="l-value">L</Label>
            <Input
              id="l-value"
              type="number"
              min={0}
              max={100}
              value={Math.round(lightness)}
              onChange={e => setLightness(Number(e.target.value))}
              className="h-8"
            />
          </div>
        </div>

        {/* Hex input and actions */}
        <div className="flex items-center gap-2">
          {showHexInput && (
            <div className="flex-1">
              <Label htmlFor="hex-value">Hex</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  #
                </span>
                <Input
                  id="hex-value"
                  value={hexInputValue}
                  onChange={handleHexInputChange}
                  onBlur={applyHexInput}
                  onKeyDown={handleHexInputKeyDown}
                  className="pl-7 h-8 uppercase font-mono"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          <div className="flex items-end gap-1 h-8">
            {showDropper && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleEyeDropper}
                      className="h-8 w-8"
                    >
                      <Pipette className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pick color from screen</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {allowCopy && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyToClipboard}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy color code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Simple inline color preview component
  const ColorPickerPreview = ({ value, disabled }: { value: string; disabled: boolean }) => (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'h-5 w-5 rounded-full border',
          value ? 'border-border' : 'border-dashed border-muted-foreground',
          disabled && 'opacity-50'
        )}
        style={{
          backgroundColor: value || 'transparent',
          backgroundImage: !value
            ? `
                linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%)
              `
            : 'none',
          backgroundSize: '6px 6px',
          backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
        }}
      />
      <span
        className={cn(
          'text-sm',
          disabled && 'text-muted-foreground',
          !value && 'text-muted-foreground'
        )}
      >
        {value || placeholder}
      </span>
    </div>
  );

  // Preset colors grid
  const PresetColorsGrid = () => (
    <div className="grid grid-cols-5 gap-2 pt-1">
      {presetColors.map(presetColor => {
        const isDisabled = disabledColors.includes(presetColor);
        const isSelected = color.toLowerCase() === presetColor.toLowerCase();

        return (
          <TooltipProvider key={presetColor}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-8 w-8 rounded-md p-0 relative',
                    isDisabled && 'opacity-50 cursor-not-allowed',
                    isSelected && 'ring-2 ring-primary ring-offset-2'
                  )}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => !isDisabled && handlePresetColorSelect(presetColor)}
                  disabled={isDisabled}
                  aria-label={`Select color ${presetColor}`}
                >
                  {isSelected && (
                    <Check
                      className={cn(
                        'h-4 w-4 absolute',
                        getBrightness(presetColor) > 160 ? 'text-black' : 'text-white'
                      )}
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {presetColor}
                {isDisabled && ' (Unavailable)'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal h-10',
              !color && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <ColorPickerPreview value={color} disabled={disabled} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          {mode === 'full' ? (
            <Tabs defaultValue="picker" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="picker">
                  <Paintbrush className="h-4 w-4 mr-2" />
                  Picker
                </TabsTrigger>
                <TabsTrigger value="presets">
                  <Palette className="h-4 w-4 mr-2" />
                  Presets
                </TabsTrigger>
              </TabsList>
              <TabsContent value="picker" className="pt-4">
                <ColorPalettePicker />
              </TabsContent>
              <TabsContent value="presets" className="pt-4">
                <div className="space-y-4">
                  <PresetColorsGrid />

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => applyColor()}>
                      Apply
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4 py-2">
              <PresetColorsGrid />

              {showHexInput && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor="simple-hex-value">Hex</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        #
                      </span>
                      <Input
                        id="simple-hex-value"
                        value={hexInputValue}
                        onChange={handleHexInputChange}
                        onBlur={applyHexInput}
                        onKeyDown={handleHexInputKeyDown}
                        className="pl-7 h-8 uppercase font-mono"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  {showDropper && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleEyeDropper}
                      className="h-8 w-8"
                    >
                      <Pipette className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => applyColor()}>
                  Apply
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Utility functions for color conversion

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HSLA to Hex color with alpha
 */
function hslaToHex(h: number, s: number, l: number, a: number): string {
  const hexColor = hslToHex(h, s, l);

  if (a < 1) {
    const alpha = Math.round(a * 255)
      .toString(16)
      .padStart(2, '0');
    return `${hexColor}${alpha}`;
  }

  return hexColor;
}

/**
 * Convert Hex to HSLA
 */
function hexToHSLA(hex: string): { h: number; s: number; l: number; a: number } {
  // Default values
  if (!hex || hex === 'transparent') {
    return { h: 0, s: 0, l: 0, a: 1 };
  }

  // Remove the # if it exists
  hex = hex.replace(/^#/, '');

  let r,
    g,
    b,
    a = 1;

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;
  }
  // Convert 6-digit hex to RGB
  else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  }
  // Convert 8-digit hex (with alpha) to RGBA
  else if (hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
    a = parseInt(hex.substring(6, 8), 16) / 255;
  } else {
    // Invalid hex, return default
    return { h: 0, s: 0, l: 0, a: 1 };
  }

  // Find the maximum and minimum RGB components
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }

    h = h / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: a,
  };
}

/**
 * Get color brightness value (0-255)
 */
function getBrightness(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export default ColorPicker;
