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

/** Categories where customers choose protein / side / spice (when configured on the dish). */
export const CUSTOMISABLE_CATEGORIES: Category[] = [
  "Classic Thai Stir-Fries",
  "Popular Thai Curries",
];

export type MeatType = "Tofu" | "Paneer" | "Chicken" | "Duck" | "Lamb" | "Prawn" | "Beef";
export type SideType = "Jasmine Rice" | "Egg Fried Rice" | "Brown Rice" | "Chips" | "Rice Noodles";
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

/** Same order as admin menu allergen picker (EU-style grouping + dietary). */
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
  /** Offered spice steps for this dish (stir-fries / curries). Empty = no spice picker. */
  availableSpiceLevels?: SpiceLevel[];
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
  type: "discount" | "bogo" | "fixed_price";
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

/** True when the dish should open the customise flow (modal) instead of one-tap add. */
export function menuItemHasCustomizationOptions(item: MenuItem): boolean {
  const inCustomCat = CUSTOMISABLE_CATEGORIES.includes(item.category);
  const hasMeatOrSide = !!(item.availableMeats?.length || item.availableSides?.length);
  const hasSpice = !!(item.availableSpiceLevels && item.availableSpiceLevels.length > 0);
  return inCustomCat && (hasMeatOrSide || hasSpice);
}

export const categories: MenuCategory[] = [
  { id: "all", label: "All", description: "Our full Chao menu" },
  { id: "Beverages", label: "Beverages", description: "Drinks & refreshments" },
  { id: "Sides & Nibbles", label: "Sides & Nibbles", description: "Perfect with any main" },
  { id: "Vegan Specials", label: "Vegan Specials", description: "Plant-based favourites" },
  { id: "Fried rice & Noodles", label: "Fried rice & Noodles", description: "Wok-fired classics" },
  {
    id: "Classic Thai Stir-Fries",
    label: "Stir-fries",
    description: "Classic Thai stir-fries — customise protein, side & spice",
  },
  {
    id: "Popular Thai Curries",
    label: "Curries",
    description:
      "Popular Thai curries — choose protein (chicken & tofu included; beef, prawn & duck +€1), jasmine rice or egg fried rice (+€1), spice mild–hot",
  },
  { id: "Chao Kids specials", label: "Kids", description: "Chao Kids specials" },
  { id: "Starters & Soups", label: "Starters & Soups", description: "Begin your meal" },
];
