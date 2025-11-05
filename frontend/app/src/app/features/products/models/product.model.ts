export const CATEGORIES = ['Food', 'Beverage'] as const;
export type ProductCategory = typeof CATEGORIES[number];

export interface Product{
    id: number
    name: string
    category: ProductCategory,
    description: string
    price: number
    stock: number
    imageUrl?: string | null
}
