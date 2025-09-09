export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  categoryId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}
