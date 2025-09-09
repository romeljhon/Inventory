"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Item, Category } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 10;
export { LOW_STOCK_THRESHOLD };

type InventoryData = {
  items: Item[];
  categories: Category[];
};

const getInitialInventory = (): InventoryData => ({
  items: [
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
  ],
  categories: [
      { id: "cat-1", name: "Electronics" },
      { id: "cat-2", name: "Office Supplies" },
  ]
});


export function useInventory(branchId: string | undefined) {
  const [inventory, setInventory] = useState<InventoryData>({ items: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = useMemo(() => `stock-sherpa-inventory-${branchId}`, [branchId]);

  useEffect(() => {
    if (!branchId) {
      setIsLoading(false);
      return;
    };
    setIsLoading(true);
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        setInventory(JSON.parse(storedData));
      } else {
        const initialData = getInitialInventory();
        setInventory(initialData);
        localStorage.setItem(storageKey, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error("Failed to load inventory from localStorage.", error);
      setInventory(getInitialInventory());
    } finally {
      setIsLoading(false);
    }
  }, [branchId, storageKey]);

  useEffect(() => {
    if (!isLoading && branchId) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(inventory));
      } catch (error) {
        console.error("Failed to save inventory to localStorage.", error);
      }
    }
  }, [inventory, isLoading, branchId, storageKey]);

  const addItem = useCallback((itemData: Omit<Item, "id" | "createdAt">) => {
    setInventory((prev) => {
      const newItem: Item = {
        ...itemData,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, items: [newItem, ...prev.items] };
    });
  }, []);

  const updateItem = useCallback((id: string, updatedData: Partial<Omit<Item, "id" | "createdAt">>) => {
    setInventory((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updatedData } : item
      ),
    }));
  }, []);
  
  const updateItemQuantity = useCallback((id: string, newQuantity: number) => {
    setInventory((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
      )
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setInventory((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  }, []);

  const addCategory = useCallback((name: string): Category => {
    const existingCategory = inventory.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        return existingCategory;
    }
    
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
    };
    setInventory((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory]
    }));
    return newCategory;
  }, [inventory.categories]);

  return {
    items: inventory.items,
    categories: inventory.categories,
    addItem,
    updateItem,
    updateItemQuantity,
    deleteItem,
    addCategory,
    isLoading
  };
}
