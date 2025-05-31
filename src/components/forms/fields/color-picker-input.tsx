import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ColorPickerInputProps {
  name: string; // react-hook-form field name
  label: string;
  className?: string;
  popoverClassName?: string;
  disabled?: boolean;
}

export function ColorPickerInput({
  name,
  label,
  className,
  popoverClassName,
  disabled,
}: ColorPickerInputProps) {
  const { control, watch, setValue } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const watchedColor = watch(name);

  // Internal state for the color picker to provide a smoother experience
  const [pickerColor, setPickerColor] = useState(watchedColor || "#ffffff");

  useEffect(() => {
    // Update pickerColor when the form value changes externally
    if (watchedColor && watchedColor !== pickerColor) {
      setPickerColor(watchedColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedColor]);

  const handleColorChange = (color: string) => {
    setPickerColor(color);
    // Debounce or on-close update could be an option here for performance
    // For simplicity, updating form value directly on change
    setValue(name, color, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={name}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-10 h-10 p-0 border-2 border-input hover:border-primary transition-colors"
              style={{ backgroundColor: watchedColor || "transparent" }}
              disabled={disabled}
              aria-label={`Pick ${label.toLowerCase()} color`}
            />
          </PopoverTrigger>
          <PopoverContent className={cn("w-auto p-0", popoverClassName)}>
            <HexColorPicker color={pickerColor} onChange={handleColorChange} />
          </PopoverContent>
        </Popover>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={name}
              placeholder="#RRGGBB"
              className="flex-1"
              disabled={disabled}
              onChange={(e) => {
                field.onChange(e.target.value);
                // Also update picker color if input changes manually
                if (/^#[0-9A-Fa-f]{6}$/i.test(e.target.value)) {
                  setPickerColor(e.target.value);
                }
              }}
            />
          )}
        />
      </div>
      {/* Optional: Display FormMessage for errors related to this field */}
      {/* <FormMessage name={name} /> */}
    </div>
  );
}
