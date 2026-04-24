export type Category = 'Starter' | 'Main Course' | 'Drink' | 'Dessert' | 'Sides' | 'Curry';

export const CATEGORIES: Category[] = [
  'Starter',
  'Main Course',
  'Drink',
  'Dessert',
  'Sides',
  'Curry'
];

export type MeatType = 'Tofu' | 'Paneer' | 'Chicken' | 'Duck' | 'Lamb' | 'Prawn' | 'Beef';

export const MEATS: MeatType[] = [
  'Tofu',
  'Paneer',
  'Chicken',
  'Duck',
  'Lamb',
  'Prawn',
  'Beef'
];

export type SideType = 'Jasmine Rice' | 'Egg Fried Rice' | 'Brown Rice' | 'Chips' | 'Rice Noodles';

export const SIDES: SideType[] = [
  'Jasmine Rice',
  'Egg Fried Rice',
  'Brown Rice',
  'Chips',
  'Rice Noodles'
];

export type Allergen = 'Gluten' | 'Dairy/Milk' | 'Nuts' | 'Crustaceans' | 'Soy' | 'Eggs' | 'Vegan' | 'Vegetarian';

export const ALLERGENS: Allergen[] = [
  'Gluten',
  'Dairy/Milk',
  'Nuts',
  'Crustaceans',
  'Soy',
  'Eggs',
  'Vegan',
  'Vegetarian'
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: Category;
  availableMeats: MeatType[];
  availableSides: SideType[];
  allergens?: Allergen[];
  available: boolean;
  isDeal?: boolean;
  emoji?: string;
  createdAt?: any;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  dealPrice: number;
  items: string[]; // Array of MenuItem IDs
  startDate: any;
  endDate: any;
  isActive: boolean;
}
