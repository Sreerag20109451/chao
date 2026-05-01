export type Category =
  | "Beverages"
  | "Sides & Nibbles"
  | "Vegan Specials"
  | "Fried rice & Noodles"
  | "Classic Thai Stir-Fries"
  | "Popular Thai Curries"
  | "Chao Kids specials"
  | "Starters & Soups";

export const CATEGORIES: Category[] = [
  "Beverages",
  "Sides & Nibbles",
  "Vegan Specials",
  "Fried rice & Noodles",
  "Classic Thai Stir-Fries",
  "Popular Thai Curries",
  "Chao Kids specials",
  "Starters & Soups",
];

/** POS / client: dishes in these categories can offer protein, side & spice options. */
export const CUSTOMISABLE_CATEGORIES: Category[] = [
  "Classic Thai Stir-Fries",
  "Popular Thai Curries",
];

export type MeatType = "Tofu" | "Paneer" | "Chicken" | "Duck" | "Lamb" | "Prawn" | "Beef";

export const MEATS: MeatType[] = ["Tofu", "Paneer", "Chicken", "Duck", "Lamb", "Prawn", "Beef"];

export type SideType = "Jasmine Rice" | "Egg Fried Rice" | "Brown Rice" | "Chips" | "Rice Noodles";

export const SIDES: SideType[] = [
  "Jasmine Rice",
  "Egg Fried Rice",
  "Brown Rice",
  "Chips",
  "Rice Noodles",
];

export type SpiceLevel = "Mild" | "Medium" | "Hot" | "Thai Hot";

export const SPICE_LEVELS: SpiceLevel[] = ["Mild", "Medium", "Hot", "Thai Hot"];

/** Extra € when customer chooses egg fried rice with a dish that offers rice sides. */
export const EGG_FRIED_RICE_SIDE_SURCHARGE = 1;

export function getSidePriceIncrement(side: string | undefined): number {
  if (side === "Egg Fried Rice") return EGG_FRIED_RICE_SIDE_SURCHARGE;
  return 0;
}

export type Allergen =
  | "Gluten"
  | "Dairy/Milk"
  | "Eggs"
  | "Fish"
  | "Crustaceans"
  | "Molluscs"
  | "Soy"
  | "Sesame"
  | "Peanuts"
  | "Nuts"
  | "Vegan"
  | "Vegetarian";

export const ALLERGENS: Allergen[] = [
  "Gluten",
  "Dairy/Milk",
  "Eggs",
  "Fish",
  "Crustaceans",
  "Molluscs",
  "Soy",
  "Sesame",
  "Peanuts",
  "Nuts",
  "Vegan",
  "Vegetarian",
];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: Category;
  availableMeats: MeatType[];
  availableSides: SideType[];
  availableSpiceLevels?: SpiceLevel[];
  allergens?: Allergen[];
  available: boolean;
  isDeal?: boolean;
  emoji?: string;
  createdAt?: unknown;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  dealPrice: number;
  items: string[]; // Array of MenuItem IDs
  startDate: string | number | Date;
  endDate: string | number | Date;
  isActive: boolean;
}
