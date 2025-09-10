
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Item, Category, InventoryHistory } from "@/lib/types";
import { subDays, subWeeks, subMonths } from 'date-fns';


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
    const now = new Date();
    const initialItems: Item[] = [
        {
          id: "item-1",
          name: "Laptop Pro 15",
          description: "A high-performance laptop for professionals.",
          quantity: 25,
          categoryId: "cat-1",
          createdAt: subMonths(now, 2).toISOString(),
          value: 75000,
        },
         {
          id: "item-2",
          name: "Wireless Mouse",
          description: "Ergonomic wireless mouse with long battery life.",
          quantity: 8,
          categoryId: "cat-1",
          createdAt: subDays(now, 5).toISOString(),
          value: 2500,
        },
        {
          id: "item-3",
          name: "Smartwatch",
          description: "Fitness and notification tracking on your wrist.",
          quantity: 15,
          categoryId: "cat-1",
          createdAt: subWeeks(now, 2).toISOString(),
          value: 12000,
        },
        {
          id: "item-4",
          name: "USB-C Hub",
          description: "Expand your laptop's connectivity with more ports.",
          quantity: 30,
          categoryId: "cat-1",
          createdAt: subMonths(now, 1).toISOString(),
          value: 3500,
        },
        {
          id: "item-5",
          name: "Mechanical Keyboard",
          description: "Clicky and satisfying typing experience for coders.",
          quantity: 12,
          categoryId: "cat-1",
          createdAt: subMonths(now, 3).toISOString(),
          value: 8000,
        },
        {
          id: "item-6",
          name: "4K Monitor",
          description: "Ultra-high-definition display for crisp visuals.",
          quantity: 18,
          categoryId: "cat-1",
          createdAt: subMonths(now, 6).toISOString(),
          value: 25000,
        },
         {
          id: "item-7",
          name: "Printer Paper (Ream)",
          description: "500 sheets of high-quality A4 paper.",
          quantity: 50,
          categoryId: "cat-2",
          createdAt: subDays(now, 10).toISOString(),
          value: 250,
        },
        {
          id: "item-8",
          name: "Stapler",
          description: "Standard office stapler.",
          quantity: 20,
          categoryId: "cat-2",
          createdAt: subMonths(now, 4).toISOString(),
          value: 150,
        }
      ];
    
    const initialHistory: InventoryHistory[] = initialItems.map(item => ({
        id: `hist-initial-${item.id}`,
        branchId,
        itemId: item.id,
        itemName: item.name,
        change: item.quantity,
        newQuantity: item.quantity,
        type: 'initial' as const,
        createdAt: item.createdAt,
    }));

    // Add mock sales data
    const mockSales: Omit<InventoryHistory, 'id' | 'branchId'>[] = [
        // Today
        { itemId: 'item-2', itemName: 'Wireless Mouse', change: -2, newQuantity: 8, type: 'quantity', createdAt: now.toISOString() },
        { itemId: 'item-7', itemName: 'Printer Paper (Ream)', change: -5, newQuantity: 50, type: 'quantity', createdAt: now.toISOString() },
        
        // This Week
        { itemId: 'item-1', itemName: 'Laptop Pro 15', change: -1, newQuantity: 25, type: 'quantity', createdAt: subDays(now, 2).toISOString() },
        { itemId: 'item-3', itemName: 'Smartwatch', change: -3, newQuantity: 15, type: 'quantity', createdAt: subDays(now, 3).toISOString() },

        // This Month
        { itemId: 'item-5', itemName: 'Mechanical Keyboard', change: -2, newQuantity: 12, type: 'quantity', createdAt: subWeeks(now, 2).toISOString() },
        { itemId: 'item-4', itemName: 'USB-C Hub', change: -5, newQuantity: 30, type: 'quantity', createdAt: subWeeks(now, 3).toISOString() },
        { itemId: 'item-8', itemName: 'Stapler', change: -2, newQuantity: 20, type: 'quantity', createdAt: subWeeks(now, 3).toISOString() },

        // This Year
        { itemId: 'item-6', itemName: '4K Monitor', change: -1, newQuantity: 18, type: 'quantity', createdAt: subMonths(now, 2).toISOString() },
        { itemId: 'item-1', itemName: 'Laptop Pro 15', change: -1, newQuantity: 26, type: 'quantity', createdAt: subMonths(now, 4).toISOString() },
        { itemId: 'item-3', itemName: 'Smartwatch', change: -4, newQuantity: 18, type: 'quantity', createdAt: subMonths(now, 5).toISOString() },
    ];

    mockSales.forEach((sale, index) => {
        initialHistory.push({
            ...sale,
            id: `hist-sale-${now.getTime()}-${index}`,
            branchId,
        });
    });


    return {
        items: initialItems,
        categories: [
            { id: "cat-1", name: "Electronics", color: "hsl(220, 80%, 50%)" },
            { id: "cat-2", name: "Office Supplies", color: "hsl(140, 60%, 45%)" },
        ],
        history: initialHistory.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
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

  const updateCategory = useCallback((id: string, name: string, color: string) => {
    setInventory(prev => ({
        ...prev,
        categories: prev.categories.map(c => c.id === id ? { ...c, name, color } : c)
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setInventory(prev => ({
      ...prev,
      // Also un-categorize items that belonged to this category
      items: prev.items.map(item => item.categoryId === id ? { ...item, categoryId: '' } : item),
      categories: prev.categories.filter(c => c.id !== id)
    }));
  }, []);


  return {
    items: inventory.items,
    categories: inventory.categories,
    history: inventory.history,
    addItem,
    updateItem,
    batchUpdateQuantities,
    deleteItem,
    addCategory,
    updateCategory,
    deleteCategory,
    isLoading
  };
}
