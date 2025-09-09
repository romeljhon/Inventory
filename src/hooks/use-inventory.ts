"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Item, Category, InventoryHistory } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 10;
export { LOW_STOCK_THRESHOLD };

type InventoryData = {
  items: Item[];
  categories: Category[];
  history: InventoryHistory[];
};

const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 10);
    const lightness = 40 + Math.floor(Math.random() * 10);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const getInitialInventory = (branchId: string): InventoryData => {
    const initialItems = [
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
      ];
    
    const initialHistory = initialItems.map(item => ({
        id: `hist-${Date.now()}-${item.id}`,
        branchId,
        itemId: item.id,
        itemName: item.name,
        change: item.quantity,
        newQuantity: item.quantity,
        type: 'initial' as const,
        createdAt: item.createdAt,
    }));

    return {
        items: initialItems,
        categories: [
            { id: "cat-1", name: "Electronics", color: "hsl(220, 80%, 50%)" },
            { id: "cat-2", name: "Office Supplies", color: "hsl(140, 60%, 45%)" },
        ],
        history: initialHistory,
    }
};


export function useInventory(branchId: string | undefined) {
  const [inventory, setInventory] = useState<InventoryData>({ items: [], categories: [], history: [] });
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
        const initialData = getInitialInventory(branchId);
        setInventory(initialData);
        localStorage.setItem(storageKey, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error("Failed to load inventory from localStorage.", error);
       if (branchId) {
        setInventory(getInitialInventory(branchId));
       }
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

  const addHistory = (log: Omit<InventoryHistory, 'id' | 'createdAt' | 'branchId'>) => {
    if (!branchId) return;
    const newHistory: InventoryHistory = {
        ...log,
        id: `hist-${Date.now()}-${log.itemId}`,
        createdAt: new Date().toISOString(),
        branchId,
    };
    setInventory(prev => ({ ...prev, history: [newHistory, ...(Array.isArray(prev.history) ? prev.history : [])] }));
  }

  const addItem = useCallback((itemData: Omit<Item, "id" | "createdAt">) => {
    const newItem: Item = {
        ...itemData,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    setInventory((prev) => ({ ...prev, items: [newItem, ...prev.items] }));
    addHistory({
        itemId: newItem.id,
        itemName: newItem.name,
        change: newItem.quantity,
        newQuantity: newItem.quantity,
        type: 'add'
    });
  }, []);

  const updateItem = useCallback((id: string, updatedData: Partial<Omit<Item, "id" | "createdAt">>) => {
    let oldItem: Item | undefined;
    setInventory((prev) => {
        oldItem = prev.items.find(item => item.id === id);
        return {
            ...prev,
            items: prev.items.map((item) =>
                item.id === id ? { ...item, ...updatedData } : item
            ),
        }
    });

    if (oldItem) {
        const newItem = { ...oldItem, ...updatedData};
        addHistory({
            itemId: id,
            itemName: newItem.name,
            change: newItem.quantity - oldItem.quantity,
            newQuantity: newItem.quantity,
            type: 'update'
        });
    }
  }, []);
  
  const batchUpdateQuantities = useCallback((updates: Record<string, number>) => {
    setInventory(prev => {
        const updatedItems = prev.items.map(item => {
            if (updates[item.id] !== undefined) {
                const oldQuantity = item.quantity;
                const newQuantity = Math.max(0, updates[item.id]);
                if (oldQuantity !== newQuantity) {
                    addHistory({
                        itemId: item.id,
                        itemName: item.name,
                        change: newQuantity - oldQuantity,
                        newQuantity: newQuantity,
                        type: 'quantity'
                    });
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        return { ...prev, items: updatedItems };
    });
}, []);


  const deleteItem = useCallback((id: string) => {
    let deletedItem : Item | undefined;
    setInventory((prev) => {
        deletedItem = prev.items.find(item => item.id === id);
        return {
            ...prev,
            items: prev.items.filter((item) => item.id !== id),
        }
    });

    if (deletedItem) {
        addHistory({
            itemId: id,
            itemName: deletedItem.name,
            change: -deletedItem.quantity,
            newQuantity: 0,
            type: 'delete'
        });
    }
  }, []);

  const addCategory = useCallback((name: string): Category => {
    const existingCategory = inventory.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        return existingCategory;
    }
    
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      color: getRandomColor(),
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
    history: inventory.history,
    addItem,
    updateItem,
    batchUpdateQuantities,
    deleteItem,
    addCategory,
    isLoading
  };
}
