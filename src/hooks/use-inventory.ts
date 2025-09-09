"use client";

import { useState, useEffect, useCallback } from "react";
import type { Item, Category } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 10;
export { LOW_STOCK_THRESHOLD };

const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Electronics" },
  { id: "cat-2", name: "Office Supplies" },
  { id: "cat-3", name: "Furniture" },
  { id: "cat-4", name: "Books" },
];

const INITIAL_ITEMS: Item[] = [
  {
    id: "item-1",
    name: "Laptop Pro 15",
    description: "A high-performance laptop for professionals.",
    quantity: 25,
    categoryId: "cat-1",
    createdAt: new Date().toISOString(),
    value: 1200,
  },
  {
    id: "item-2",
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with long battery life.",
    quantity: 8,
    categoryId: "cat-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    value: 50,
  },
  {
    id: "item-3",
    name: "A4 Printer Paper",
    description: "500 sheets of high-quality A4 paper.",
    quantity: 50,
    categoryId: "cat-2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    value: 10,
  },
  {
    id: "item-4",
    name: "Ergonomic Office Chair",
    description: "Adjustable chair for long hours of comfort.",
    quantity: 12,
    categoryId: "cat-3",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    value: 250,
  },
];

export function useInventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem("stock-sherpa-items");
      const storedCategories = localStorage.getItem("stock-sherpa-categories");
      if (storedItems && storedCategories) {
        setItems(JSON.parse(storedItems));
        setCategories(JSON.parse(storedCategories));
      } else {
        setItems(INITIAL_ITEMS);
        setCategories(INITIAL_CATEGORIES);
      }
    } catch (error) {
      console.error("Failed to load from localStorage, using initial data.", error);
      setItems(INITIAL_ITEMS);
      setCategories(INITIAL_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("stock-sherpa-items", JSON.stringify(items));
        localStorage.setItem("stock-sherpa-categories", JSON.stringify(categories));
      } catch (error) {
        console.error("Failed to save to localStorage.", error);
      }
    }
  }, [items, categories, isLoading]);

  const addItem = useCallback((itemData: Omit<Item, "id" | "createdAt">) => {
    const newItem: Item = {
      ...itemData,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
  }, []);

  const updateItem = useCallback((id: string, updatedData: Partial<Omit<Item, "id" | "createdAt">>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updatedData } : item
      )
    );
  }, []);
  
  const updateItemQuantity = useCallback((id: string, newQuantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addCategory = useCallback((name: string): Category => {
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        return existingCategory;
    }
    
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
    };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, [categories]);

  return {
    items,
    categories,
    addItem,
    updateItem,
    updateItemQuantity,
    deleteItem,
    addCategory,
    isLoading
  };
}
