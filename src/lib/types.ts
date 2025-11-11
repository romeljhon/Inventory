
import { FieldValue } from 'firebase/firestore';

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  categoryId: string;
  createdAt: FieldValue | string;
  value: number;
  unitType?: 'pcs' | 'box' | 'pack';
  itemType: 'Product' | 'Component';
  expirationDate?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  showInSales?: boolean;
}

export interface RecipeComponent {
  itemId: string;
  quantity: number;
}
export interface Recipe {
  id: string;
  productId: string;
  productName: string;
  components: RecipeComponent[];
  createdAt: FieldValue | string;
}

export interface Branch {
  id: string;
  name: string;
  createdAt?: FieldValue;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  createdAt: FieldValue;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  branchId: string;
  createdAt: FieldValue | string;
}

export interface InventoryHistory {
    id: string;
    branchId: string;
    itemId: string;
    itemName: string;
    change: number;
    newQuantity: number;
    type: 'initial' | 'add' | 'update' | 'delete' | 'quantity';
    createdAt: FieldValue | string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
