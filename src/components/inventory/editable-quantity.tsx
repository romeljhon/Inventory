"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableQuantityProps {
  initialValue: number;
  onSave: (newValue: number) => void;
  className?: string;
}

export function EditableQuantity({ initialValue, onSave, className }: EditableQuantityProps) {
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
    const newValue = parseInt(String(value), 10);
    if (!isNaN(newValue) && newValue !== initialValue) {
      onSave(newValue);
    } else {
        // If the value is invalid or unchanged, revert to the initial value
        setValue(initialValue);
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