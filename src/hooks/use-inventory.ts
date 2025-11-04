
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Item, Category, InventoryHistory } from "@/lib/types";
import { subDays, subWeeks, subMonths, addDays, subSeconds, startOfDay, isAfter, parseISO } from 'date-fns';


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

// Global counter for history IDs to ensure uniqueness across sessions
let historyIdCounter = Date.now();

const getInitialInventory = (branchId: string): InventoryData => {
    const now = new Date();
    
    // Define initial stock levels
    const initialStock: Omit<Item, 'id' | 'createdAt'>[] = [
        {
          name: "Laptop Pro 15",
          description: "A high-performance laptop for professionals.",
          quantity: 27,
          categoryId: "cat-1",
          value: 75000,
          unitType: 'pcs',
        },
         {
          name: "Wireless Mouse",
          description: "Ergonomic wireless mouse with long battery life.",
          quantity: 10,
          categoryId: "cat-1",
          value: 2500,
          unitType: 'pcs',
        },
        {
          name: "Smartwatch",
          description: "Fitness and notification tracking on your wrist.",
          quantity: 22,
          categoryId: "cat-1",
          value: 12000,
          unitType: 'pcs',
        },
        {
          name: "USB-C Hub",
          description: "Expand your laptop's connectivity with more ports.",
          quantity: 35,
          categoryId: "cat-1",
          value: 3500,
          unitType: 'pcs',
        },
        {
          name: "Mechanical Keyboard",
          description: "Clicky and satisfying typing experience for coders.",
          quantity: 14,
          categoryId: "cat-1",
          value: 8000,
          unitType: 'pcs',
        },
        {
          name: "4K Monitor",
          description: "Ultra-high-definition display for crisp visuals.",
          quantity: 19,
          categoryId: "cat-1",
          value: 25000,
          unitType: 'pcs',
        },
         {
          name: "Printer Paper (Ream)",
          description: "500 sheets of high-quality A4 paper.",
          quantity: 55,
          categoryId: "cat-2",
          value: 250,
          unitType: 'pack',
        },
        {
          name: "Stapler",
          description: "Standard office stapler.",
          quantity: 22,
          categoryId: "cat-2",
          value: 150,
          unitType: 'pcs',
        },
        {
          name: "Fresh Milk (1L)",
          description: "Full cream milk, pasteurized.",
          quantity: 16,
          categoryId: "cat-3",
          value: 120,
          unitType: 'box',
          expirationDate: addDays(now, 10).toISOString(),
        },
        {
          name: "Cheddar Cheese (250g)",
          description: "Block of sharp cheddar cheese.",
          quantity: 7,
          categoryId: "cat-3",
          value: 250,
          unitType: 'pack',
          expirationDate: addDays(now, 30).toISOString(),
        },
        {
          name: "Expired Yogurt",
          description: "This yogurt is past its prime.",
          quantity: 3,
          categoryId: "cat-3",
          value: 80,
          unitType: 'pcs',
          expirationDate: subDays(now, 2).toISOString(),
        }
    ];

    const creationDates: Record<string, Date> = {
        "Laptop Pro 15": subMonths(now, 2),
        "Wireless Mouse": subDays(now, 5),
        "Smartwatch": subWeeks(now, 2),
        "USB-C Hub": subMonths(now, 1),
        "Mechanical Keyboard": subMonths(now, 3),
        "4K Monitor": subMonths(now, 6),
        "Printer Paper (Ream)": subDays(now, 10),
        "Stapler": subMonths(now, 4),
        "Fresh Milk (1L)": subDays(now, 2),
        "Cheddar Cheese (250g)": subDays(now, 5),
        "Expired Yogurt": subDays(now, 15),
    };
    
    // Assign unique IDs and creation dates
    const initialItemsWithIds: Item[] = initialStock.map((item, index) => ({
        ...item,
        id: `item-${index + 1}`,
        createdAt: (creationDates[item.name] || now).toISOString()
    }));

    const mockSales: Omit<InventoryHistory, 'id' | 'branchId' | 'newQuantity'>[] = [
        { itemId: 'item-2', itemName: 'Wireless Mouse', change: -2, type: 'quantity', createdAt: subSeconds(now, 10).toISOString() },
        { itemId: 'item-7', itemName: 'Printer Paper (Ream)', change: -5, type: 'quantity', createdAt: subSeconds(now, 20).toISOString() },
        { itemId: 'item-9', itemName: 'Fresh Milk (1L)', change: -1, type: 'quantity', createdAt: subSeconds(now, 30).toISOString() },
        { itemId: 'item-1', itemName: 'Laptop Pro 15', change: -1, type: 'quantity', createdAt: subDays(now, 2).toISOString() },
        { itemId: 'item-3', itemName: 'Smartwatch', change: -3, type: 'quantity', createdAt: subDays(now, 3).toISOString() },
        { itemId: 'item-10', itemName: 'Cheddar Cheese (250g)', change: -2, type: 'quantity', createdAt: subDays(now, 4).toISOString() },
        { itemId: 'item-5', itemName: 'Mechanical Keyboard', change: -2, type: 'quantity', createdAt: subWeeks(now, 2).toISOString() },
        { itemId: 'item-4', itemName: 'USB-C Hub', change: -5, type: 'quantity', createdAt: subWeeks(now, 3).toISOString() },
        { itemId: 'item-8', itemName: 'Stapler', change: -2, type: 'quantity', createdAt: subWeeks(now, 3).toISOString() },
        { itemId: 'item-6', itemName: '4K Monitor', change: -1, type: 'quantity', createdAt: subMonths(now, 2).toISOString() },
        { itemId_xyz: 'item-1', itemName: 'Laptop Pro 15', change: -1, type: 'quantity', createdAt: subMonths(now, 4).toISOString() },
        { itemId_xyz: 'item-3', itemName: 'Smartwatch', change: -4, type: 'quantity', createdAt: subMonths(now, 5).toISOString() },
    ];
    
    
    const allEvents = [
        ...initialItemsWithIds.map(item => ({
            type: 'add' as const,
            itemId: item.id,
            itemName: item.name,
            change: item.quantity,
            createdAt: item.createdAt,
            fullItem: item, // Keep the full item data for reconstruction
        })),
        ...mockSales,
    ].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const itemStateTracker: Record<string, number> = {};
    const finalHistory: InventoryHistory[] = [];

    allEvents.forEach((event, index) => {
        const currentQty = itemStateTracker[event.itemId] || 0;
        const newQuantity = currentQty + event.change;
        itemStateTracker[event.itemId] = newQuantity;

        finalHistory.push({
            id: `hist-${index}`,
            branchId,
            itemId: event.itemId,
            itemName: event.itemName,
            change: event.change,
            newQuantity: newQuantity,
            type: event.type,
            createdAt: event.createdAt
        });
    });

    const finalItems = initialItemsWithIds.map(item => ({
        ...item,
        quantity: itemStateTracker[item.id] ?? item.quantity,
    }));


    return {
        items: finalItems,
        categories: [
            { id: "cat-1", name: "Electronics", color: "hsl(220, 80%, 50%)" },
            { id: "cat-2", name: "Office Supplies", color: "hsl(140, 60%, 45%)" },
            { id: "cat-3", name: "Food", color: "hsl(40, 90%, 50%)" },
        ],
        history: finalHistory.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
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

  const addHistory = useCallback((log: Omit<InventoryHistory, 'id' | 'createdAt' | 'branchId'>) => {
    if (!branchId) return;
    historyIdCounter++;
    const newHistory: InventoryHistory = {
        ...log,
        id: `hist-${historyIdCounter}`,
        createdAt: new Date().toISOString(),
        branchId,
    };
    setInventory(prev => ({ ...prev, history: [newHistory, ...(Array.isArray(prev.history) ? prev.history : [])] }));
  }, [branchId]);

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
  }, [addHistory]);

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
        const newQuantity = newItem.quantity ?? oldItem.quantity;
        addHistory({
            itemId: id,
            itemName: newItem.name,
            change: newQuantity - oldItem.quantity,
            newQuantity: newQuantity,
            type: 'update'
        });
    }
  }, [addHistory]);
  
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
}, [addHistory]);


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
  }, [addHistory]);

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

  const resetInventory = useCallback(() => {
    if (!branchId) return;
    setIsLoading(true);
    try {
      localStorage.removeItem(storageKey);
      const initialData = getInitialInventory(branchId);
      setInventory(initialData);
      localStorage.setItem(storageKey, JSON.stringify(initialData));
    } catch (error) {
      console.error("Failed to reset inventory.", error);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, storageKey]);

  const availableSnapshotDates = useMemo(() => {
    if (!inventory.history || inventory.history.length === 0) return [];
    const dates = new Set(
      inventory.history.map(log =>
        startOfDay(parseISO(log.createdAt)).toISOString()
      )
    );
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [inventory.history]);

  const getInventorySnapshot = useCallback((date: string): Item[] => {
    const targetDate = new Date(date);
    const endOfTargetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const relevantHistory = inventory.history
      .filter(log => !isAfter(parseISO(log.createdAt), endOfTargetDay))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const itemMap = new Map<string, Item>();
    const quantityMap = new Map<string, number>();

    // This is a simplified reconstruction. A more robust solution
    // would also reconstruct item details (value, category) at that point in time.
    for (const log of relevantHistory) {
      // Find the original item details from the current state
      const baseItem = inventory.items.find(i => i.id === log.itemId);
      
      // If the item was deleted, we might not find it, so we create a placeholder
      const itemDetails = baseItem || itemMap.get(log.itemId) || {
        id: log.itemId,
        name: log.itemName,
        description: "",
        quantity: 0,
        categoryId: "",
        createdAt: log.createdAt,
        value: 0
      };

      if (log.type === 'delete') {
         quantityMap.set(log.itemId, 0);
      } else {
         quantityMap.set(log.itemId, log.newQuantity);
      }
      
      itemMap.set(log.itemId, { ...itemDetails, quantity: quantityMap.get(log.itemId) || 0 });
    }

    return Array.from(itemMap.values()).filter(item => item.quantity > 0 || quantityMap.has(item.id));
}, [inventory.history, inventory.items]);



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
    resetInventory,
    isLoading,
    availableSnapshotDates,
    getInventorySnapshot,
  };
}
