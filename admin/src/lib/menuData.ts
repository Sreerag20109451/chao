/**
 * menuData.ts — Admin App
 *
 * Shared menu type definitions and static data used by the admin dashboard.
 */

export type MenuTag = "spicy" | "vegan" | "chef-pick" | "gluten-free";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: MenuTag[];
  emoji: string;
  available: boolean;
  proteinOptions?: string[];
  sideOptions?: string[];
}

export const categories = [
  { id: "starters",  label: "Starters" },
  { id: "mains",     label: "Mains" },
  { id: "curries",   label: "Curries" },
  { id: "noodles",   label: "Noodles & Rice" },
  { id: "desserts",  label: "Desserts" },
  { id: "drinks",    label: "Drinks" },
];

export const PROTEIN_LIST = ["Chicken", "Beef", "Prawns", "Crispy Pork", "Tofu", "Vegetables"];
export const SIDE_LIST = ["Jasmine Rice", "Egg Fried Rice", "Brown Rice", "Chips", "Rice Noodles"];

export const initialMenuItems: MenuItem[] = [
  // Starters
  { id: "s1", name: "Miang Kham",        description: "Betel leaves filled with toasted coconut, dried shrimp, lime and peanuts.", price: 8.5, category: "starters", tags: ["chef-pick"], emoji: "🍃", available: true },
  { id: "s2", name: "Tom Kha Gai Soup",  description: "Silky coconut milk broth with galangal, lemongrass and chicken.", price: 9.0, category: "starters", tags: ["gluten-free"], emoji: "🍲", available: true },
  { id: "s3", name: "Por Pia Tod",       description: "Crispy spring rolls stuffed with glass noodles, carrots and cabbage.", price: 7.5, category: "starters", tags: ["vegan"], emoji: "🥢", available: true },
  { id: "s4", name: "Satay Gai",         description: "Grilled chicken skewers marinated in turmeric and coconut milk.", price: 10.0, category: "starters", tags: ["chef-pick","gluten-free"], emoji: "🍡", available: true },

  // Mains
  { id: "m1", name: "Pad Kra Pao",       description: "Wok-fried minced meat with holy basil, chilli and garlic.", price: 15.5, category: "mains", tags: ["spicy","chef-pick"], emoji: "🌿", available: true, proteinOptions: PROTEIN_LIST, sideOptions: SIDE_LIST },
  { id: "m2", name: "Pla Rad Prik",      description: "Whole crispy sea bass drizzled with a fiery tamarind and chilli sauce.", price: 22.0, category: "mains", tags: ["spicy","gluten-free"], emoji: "🐟", available: true },
  { id: "m3", name: "Gai Yang",          description: "Slow-grilled half chicken marinated in lemongrass and coriander.", price: 18.5, category: "mains", tags: ["gluten-free"], emoji: "🍗", available: true, sideOptions: SIDE_LIST },
  { id: "m4", name: "Pad Pak Ruam",      description: "Seasonal Thai vegetables stir-fried with oyster sauce and garlic.", price: 13.0, category: "mains", tags: ["vegan"], emoji: "🥦", available: true, sideOptions: SIDE_LIST },

  // Curries
  { id: "c1", name: "Gaeng Keow Wan",    description: "Classic green curry with bamboo shoots, Thai aubergine and kaffir lime.", price: 16.0, category: "curries", tags: ["spicy","chef-pick"], emoji: "🍛", available: true, proteinOptions: PROTEIN_LIST, sideOptions: SIDE_LIST },
  { id: "c2", name: "Massaman Nuea",     description: "Rich, slow-braised meat massaman with potatoes and peanuts.", price: 18.0, category: "curries", tags: ["gluten-free"], emoji: "🥜", available: true, proteinOptions: PROTEIN_LIST, sideOptions: SIDE_LIST },
  { id: "c3", name: "Gaeng Phet Phed",   description: "Red curry with roasted duck, lychee, cherry tomatoes and pineapple.", price: 20.0, category: "curries", tags: ["spicy"], emoji: "🦆", available: true, sideOptions: SIDE_LIST },
  { id: "c4", name: "Gaeng Kua Fak Thong",description:"Pumpkin and tofu yellow curry with turmeric and coconut milk.", price: 14.5, category: "curries", tags: ["vegan","gluten-free"], emoji: "🎃", available: true, sideOptions: SIDE_LIST },

  // Noodles
  { id: "n1", name: "Pad Thai Goong",    description: "Rice noodles stir-fried with protein, egg and tamarind sauce.", price: 16.5, category: "noodles", tags: ["chef-pick"], emoji: "🍜", available: true, proteinOptions: PROTEIN_LIST },
  { id: "n2", name: "Khao Pad Sapparod", description: "Pineapple fried rice with cashew nuts, raisins and protein.", price: 15.0, category: "noodles", tags: ["vegan"], emoji: "🍍", available: true, proteinOptions: PROTEIN_LIST },
  { id: "n3", name: "Guay Teow Reua",    description: "Traditional Thai boat noodles: rich pork broth and rice noodles.", price: 14.0, category: "noodles", tags: ["spicy"], emoji: "🚢", available: true },

  // Desserts
  { id: "d1", name: "Khao Niao Mamuang", description: "Mango sticky rice in sweet coconut cream.", price: 8.0, category: "desserts", tags: ["vegan","chef-pick"], emoji: "🥭", available: true },
  { id: "d2", name: "Tub Tim Grob",      description: "Water chestnuts in jasmine-scented coconut milk with ice.", price: 7.0, category: "desserts", tags: ["vegan","gluten-free"], emoji: "🫐", available: true },

  // Drinks
  { id: "dr1",name: "Thai Iced Tea",     description: "Strongly brewed Ceylon tea sweetened with palm sugar.", price: 4.5, category: "drinks", tags: [], emoji: "🧋", available: true },
  { id: "dr2",name: "Lemongrass Cooler", description: "Fresh lemongrass juice with kaffir lime leaf and ginger.", price: 5.0, category: "drinks", tags: ["vegan"], emoji: "🌿", available: true },
  { id: "dr3",name: "Mango Lassi",       description: "Alphonso mango blended with yogurt and cardamom.", price: 5.5, category: "drinks", tags: [], emoji: "🥭", available: true },
];
