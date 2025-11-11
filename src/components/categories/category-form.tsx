
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@/lib/types";

interface CategoryFormProps {
  category: Category | null;
  onSave: (data: Partial<Category>) => void;
  onCancel: () => void;
}

export function CategoryForm({
  category,
  onSave,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [showInSales, setShowInSales] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
      setShowInSales(category.showInSales || false);
    } else {
      setName("");
      // Generate a random color for new categories
      const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
      setColor(randomColor);
      setShowInSales(false);
    }
  }, [category]);
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is a simple text input for HSL color, for a real app a color picker would be better
    setColor(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name, color, showInSales });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Category Name</Label>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Electronics"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category-color">Category Color</Label>
        <div className="flex items-center gap-2">
          <Input
            id="category-color"
            type="text"
            value={color}
            onChange={handleColorChange}
            required
            className="w-full"
          />
          <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: color }} />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a valid HSL, Hex, or RGB color.
        </p>
      </div>
       <div className="flex items-center space-x-2">
        <Switch
          id="show-in-sales"
          checked={showInSales}
          onCheckedChange={setShowInSales}
        />
        <Label htmlFor="show-in-sales">Show in Sales Page</Label>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
