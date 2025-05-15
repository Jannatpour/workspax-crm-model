import React, { useState, useEffect, useRef } from 'react';
import { Slider as SliderPrimitive } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
  tooltip?: boolean;
  disabled?: boolean;
  marks?: { value: number; label: string }[];
  onAfterChange?: (value: number) => void;
}

export function EnhancedSlider({
  label,
  min,
  max,
  step = 1,
  defaultValue,
  value,
  onChange,
  unit = 'px',
  className,
  tooltip = true,
  disabled = false,
  marks = [],
  onAfterChange,
}: SliderProps) {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const [showTooltip, setShowTooltip] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Update input when value changes externally
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleSliderChange = (val: number[]) => {
    const newValue = val[0];
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const newValue = Number(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    let newValue = Number(inputValue);
    if (isNaN(newValue)) {
      newValue = value;
    } else if (newValue < min) {
      newValue = min;
    } else if (newValue > max) {
      newValue = max;
    }
    onChange(newValue);
    setInputValue(newValue.toString());
    if (onAfterChange) {
      onAfterChange(newValue);
    }
  };

  const increment = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    setInputValue(newValue.toString());
    if (onAfterChange) {
      onAfterChange(newValue);
    }
  };

  const decrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    setInputValue(newValue.toString());
    if (onAfterChange) {
      onAfterChange(newValue);
    }
  };

  const handleSliderPointerDown = () => {
    if (tooltip) setShowTooltip(true);
  };

  const handleSliderPointerUp = () => {
    if (tooltip) setShowTooltip(false);
    if (onAfterChange) {
      onAfterChange(value);
    }
  };

  // Position the tooltip above the thumb
  useEffect(() => {
    if (tooltip && showTooltip && thumbRef.current && tooltipRef.current) {
      const thumbRect = thumbRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const trackRect = trackRef.current?.getBoundingClientRect();

      if (trackRect) {
        const percentage = (value - min) / (max - min);
        const position = percentage * trackRect.width;
        const left = position - tooltipRect.width / 2 + 10; // +10 is an adjustment for the thumb's position

        tooltipRef.current.style.left = `${Math.max(
          0,
          Math.min(left, trackRect.width - tooltipRect.width)
        )}px`;
      }
    }
  }, [value, showTooltip, min, max, tooltip]);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <Label htmlFor={`slider-${label}`}>{label}</Label>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={decrement}
            disabled={disabled || value <= min}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="flex w-20 items-center">
            <Input
              id={`slider-input-${label}`}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="h-8 w-12 text-center px-1"
              disabled={disabled}
            />
            <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={increment}
            disabled={disabled || value >= max}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="relative pt-5 pb-1" ref={trackRef}>
        {tooltip && showTooltip && (
          <div
            ref={tooltipRef}
            className="absolute -top-5 px-2 py-1 bg-black text-white text-xs rounded z-50 transform -translate-x-1/2"
          >
            {value}
            {unit}
          </div>
        )}

        <SliderPrimitive
          id={`slider-${label}`}
          defaultValue={[defaultValue]}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={handleSliderChange}
          onPointerDown={handleSliderPointerDown}
          onPointerUp={handleSliderPointerUp}
          disabled={disabled}
          className="w-full"
          thumbClassName={element => {
            if (element.index === 0) {
              return cn('h-5 w-5', element.className, thumbRef);
            }
            return element.className;
          }}
        />

        {marks && marks.length > 0 && (
          <div className="flex justify-between mt-1 px-1.5">
            {marks.map(mark => (
              <div
                key={mark.value}
                className="flex flex-col items-center"
                style={{
                  left: `${((mark.value - min) / (max - min)) * 100}%`,
                  position: 'absolute',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="h-1 w-0.5 bg-muted-foreground opacity-75" />
                <span className="text-xs text-muted-foreground mt-1">{mark.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
