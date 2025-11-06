
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableQuantityProps {
  initialValue: number;
  onSave: (newValue: number) => void;
  className?: string;
  max?: number;
}

export function EditableQuantity({ initialValue, onSave, className, max }: EditableQuantityProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    let newValue = parseInt(String(value), 10);
    
    if (isNaN(newValue)) {
        setValue(initialValue);
        return;
    }
    
    if (max !== undefined && newValue > max) {
        newValue = max;
    }

    if (newValue !== initialValue) {
      onSave(newValue);
    }
    // Update local state to clamped value even if it didn't change from initial
    // e.g. user enters value > max
    setValue(newValue); 
    if (initialValue !== newValue && newValue === max) {
        onSave(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value, 10))}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-8 w-20 text-center", className)}
        min="0"
        max={max}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer rounded-md px-2 py-1 text-center font-semibold hover:bg-muted",
        className
      )}
    >
      {value}
    </div>
  );
}
