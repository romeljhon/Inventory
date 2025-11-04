export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  categoryId: string;
  createdAt: string;
  value: number;
  unitType?: 'pcs' | 'box' | 'pack';
  expirationDate?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Branch {
  id: string;
  name: string;
}

export interface Business {
  id: string;
  name: string;
  branches: Branch[];
}

export interface InventoryHistory {
    id: string;
    branchId: string;
    itemId: string;
    itemName: string;
    change: number;
    newQuantity: number;
    type: 'initial' | 'add' | 'update' | 'delete' | 'quantity';
    createdAt: string;
}

    