import type { MenuItem } from "@/lib/menuData";

/**
 * Popular Thai Curries — protein (Chicken & Tofu included; Beef, Prawn, Duck +€1 in store settings),
 * jasmine rice or egg fried rice (+€1 via side surcharge), spice Mild / Medium / Hot.
 * Import from Menu Management (skips duplicate names).
 */
export const POPULAR_THAI_CURRIES_SEED: Omit<MenuItem, "id">[] = [
  {
    name: "Green Thai Curry",
    description:
      "⭐ A classic favourite. Creamy Thai curry made with rich coconut milk, onions, mixed peppers, bamboo shoots, finished with sweet basil. Gluten free. Allergens: crustaceans & fish.",
    basePrice: 12.99,
    category: "Popular Thai Curries",
    availableMeats: ["Chicken", "Tofu", "Beef", "Duck", "Prawn"],
    availableSides: ["Jasmine Rice", "Egg Fried Rice"],
    availableSpiceLevels: ["Mild", "Medium", "Hot"],
    allergens: ["Crustaceans", "Fish"],
    available: true,
    emoji: "🍛",
  },
  {
    name: "Massaman Curry",
    description:
      "A rich, mildly spiced Thai curry made with warm spices, onion & potato. Allergens: crustaceans & fish.",
    basePrice: 12.99,
    category: "Popular Thai Curries",
    availableMeats: ["Chicken", "Tofu", "Beef", "Duck", "Prawn"],
    availableSides: ["Jasmine Rice", "Egg Fried Rice"],
    availableSpiceLevels: ["Mild", "Medium", "Hot"],
    allergens: ["Crustaceans", "Fish"],
    available: true,
    emoji: "🍛",
  },
  {
    name: "Red Thai Curry",
    description:
      "A bold and aromatic Thai curry made with red chilli paste, creamy coconut milk, onion, red peppers, bamboo shoots, finished with sweet basil. Gluten free. Allergens: crustaceans & fish.",
    basePrice: 12.99,
    category: "Popular Thai Curries",
    availableMeats: ["Chicken", "Tofu", "Beef", "Duck", "Prawn"],
    availableSides: ["Jasmine Rice", "Egg Fried Rice"],
    availableSpiceLevels: ["Mild", "Medium", "Hot"],
    allergens: ["Crustaceans", "Fish"],
    available: true,
    emoji: "🍛",
  },
  {
    name: "Coconut Korma",
    description:
      "A mild, creamy curry made with coconut milk, aromatic spices — gently sweet & rich. Gluten free.",
    basePrice: 12.99,
    category: "Popular Thai Curries",
    availableMeats: ["Chicken", "Tofu", "Beef", "Duck", "Prawn"],
    availableSides: ["Jasmine Rice", "Egg Fried Rice"],
    availableSpiceLevels: ["Mild", "Medium", "Hot"],
    allergens: [],
    available: true,
    emoji: "🍛",
  },
  {
    name: "Thai Tikka Masala",
    description:
      "Thai curry made with tomato onion sauce and fresh cream. Gluten free. Allergens: cashew (nuts).",
    basePrice: 12.99,
    category: "Popular Thai Curries",
    availableMeats: ["Chicken", "Tofu", "Beef", "Duck", "Prawn"],
    availableSides: ["Jasmine Rice", "Egg Fried Rice"],
    availableSpiceLevels: ["Mild", "Medium", "Hot"],
    allergens: ["Nuts", "Dairy/Milk"],
    available: true,
    emoji: "🍛",
  },
  {
    name: "Butter Chicken Masala",
    description:
      "Grilled butter chicken with onion sauce & fresh cream in aromatic spices. Gluten free. Allergens: cashew (nuts).",
    basePrice: 12.99,
    category: "Popular Thai Curries",
    availableMeats: ["Chicken", "Tofu", "Beef", "Duck", "Prawn"],
    availableSides: ["Jasmine Rice", "Egg Fried Rice"],
    availableSpiceLevels: ["Mild", "Medium", "Hot"],
    allergens: ["Nuts", "Dairy/Milk"],
    available: true,
    emoji: "🍛",
  },
  {
    name: "Koh Samui Curry",
    description:
      "Spicy Thai curry made with tomato onion sauce & coconut milk, fine beans, broccoli, red chillies, mixed peppers. Gluten free.",
    basePrice: 12.99,
    category: "Popular Thai Curries",
    availableMeats: ["Chicken", "Tofu", "Beef", "Duck", "Prawn"],
    availableSides: ["Jasmine Rice", "Egg Fried Rice"],
    availableSpiceLevels: ["Mild", "Medium", "Hot"],
    allergens: [],
    available: true,
    emoji: "🍛",
  },
];
