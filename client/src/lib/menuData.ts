export type Category = 'Starter' | 'Main Course' | 'Drink' | 'Dessert' | 'Sides' | 'Curry';

export const CATEGORIES: Category[] = [
  'Starter',
  'Main Course',
  'Drink',
  'Dessert',
  'Sides',
  'Curry'
];

export type MeatType = 'Chicken' | 'Lamb' | 'Prawn' | 'Beef';
export type SideType = 'Jasmine Rice' | 'Egg Fried Rice' | 'Brown Rice' | 'Chips' | 'Rice Noodles';
export type Allergen = 'Gluten' | 'Dairy/Milk' | 'Nuts' | 'Crustaceans' | 'Soy' | 'Eggs';

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
  type: 'discount' | 'bogo' | 'fixed_price';
  value: number; // percentage, amount, or fixed price
  startDate: string;
  endDate: string;
  applicableCategories?: Category[];
  applicableItems?: string[]; // array of item IDs
  minOrderValue?: number;
  isActive: boolean;
}

export interface MenuCategory {
  id: string;
  label: string;
  description: string;
}

export const categories: MenuCategory[] = [
  { id: "all", label: "All", description: "Our full Chao menu" },
  { id: "Starter", label: "Starters", description: "Light bites to begin your journey" },
  { id: "Main Course", label: "Mains", description: "Hearty, flavour-packed Thai classics" },
  { id: "Curry", label: "Curries", description: "Slow-cooked, fragrant Thai curries" },
  { id: "Sides", label: "Sides", description: "Street food favourites done right" },
  { id: "Dessert", label: "Desserts", description: "Sweet endings with a Thai twist" },
  { id: "Drink", label: "Drinks", description: "Fresh juices, Thai teas & cocktails" },
];
