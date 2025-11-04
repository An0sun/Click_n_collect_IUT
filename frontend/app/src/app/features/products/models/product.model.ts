export type Category = 'Food' | 'Beverage';

export interface Product {
  id: number;
  name: string;
  category: Category;
  description: string;
  price: number;
  stock: number;
}
