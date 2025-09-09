"use client";

import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/types";

interface CategoryPillsProps {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryPills({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant={activeCategory === null ? "default" : "secondary"}
        onClick={() => onSelectCategory(null)}
        className="cursor-pointer transition-transform hover:scale-105"
      >
        All Items
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category.id}
          style={activeCategory === category.id ? { backgroundColor: category.color, color: 'white' } : {}}
          variant={activeCategory === category.id ? "default" : "secondary"}
          onClick={() => onSelectCategory(category.id)}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
}
