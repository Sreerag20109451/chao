/**
 * menuData.ts — Chao Thai Restaurant
 *
 * Static menu data. Organised by category for the filterable menu page.
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

export interface MenuCategory {
  id: string;
  label: string;
  description: string;
}

export const categories: MenuCategory[] = [
  { id: "all", label: "All", description: "Our full Chao menu" },
  { id: "starters", label: "Starters", description: "Light bites to begin your journey" },
  { id: "mains", label: "Mains", description: "Hearty, flavour-packed Thai classics" },
  { id: "curries", label: "Curries", description: "Slow-cooked, fragrant Thai curries" },
  { id: "noodles", label: "Noodles & Rice", description: "Street food favourites done right" },
  { id: "desserts", label: "Desserts", description: "Sweet endings with a Thai twist" },
  { id: "drinks", label: "Drinks", description: "Fresh juices, Thai teas & cocktails" },
];

const PROTEIN_LIST = ["Chicken", "Beef", "Prawns", "Crispy Pork", "Tofu", "Vegetables"];
const SIDE_LIST = ["Jasmine Rice", "Egg Fried Rice", "Brown Rice", "Chips", "Rice Noodles"];

export const menuItems: MenuItem[] = [
  // Starters
  {
    id: "s1",
    name: "Miang Kham",
    description: "Betel leaves filled with toasted coconut, dried shrimp, lime, ginger and roasted peanuts.",
    price: 8.5,
    category: "starters",
    tags: ["chef-pick"],
    emoji: "🍃",
    available: true,
  },
  {
    id: "s2",
    name: "Tom Kha Gai Soup",
    description: "Silky coconut milk broth with galangal, lemongrass, kaffir lime, mushrooms and tender chicken.",
    price: 9.0,
    category: "starters",
    tags: ["gluten-free"],
    emoji: "🍲",
    available: true,
  },
  {
    id: "s3",
    name: "Por Pia Tod",
    description: "Crispy spring rolls stuffed with glass noodles, carrots, cabbage and water chestnuts.",
    price: 7.5,
    category: "starters",
    tags: ["vegan"],
    emoji: "🥢",
    available: true,
  },
  {
    id: "s4",
    name: "Satay Gai",
    description: "Grilled chicken skewers marinated in turmeric and coconut milk. Served with peanut sauce.",
    price: 10.0,
    category: "starters",
    tags: ["chef-pick", "gluten-free"],
    emoji: "🍡",
    available: true,
  },

  // Mains
  {
    id: "m1",
    name: "Pad Kra Pao",
    description: "Wok-fried minced meat with holy basil, chilli, garlic and fish sauce. Select your protein.",
    price: 15.5,
    category: "mains",
    tags: ["spicy", "chef-pick"],
    emoji: "🌿",
    available: true,
    proteinOptions: PROTEIN_LIST,
    sideOptions: SIDE_LIST,
  },
  {
    id: "m2",
    name: "Pla Rad Prik",
    description: "Whole crispy sea bass drizzled with a fiery tamarind, chilli and palm sugar sauce.",
    price: 22.0,
    category: "mains",
    tags: ["spicy", "gluten-free"],
    emoji: "🐟",
    available: true,
  },
  {
    id: "m3",
    name: "Gai Yang",
    description: "Slow-grilled half chicken marinated overnight in lemongrass and coriander root.",
    price: 18.5,
    category: "mains",
    tags: ["gluten-free"],
    emoji: "🍗",
    available: true,
    sideOptions: SIDE_LIST,
  },
  {
    id: "m4",
    name: "Pad Pak Ruam",
    description: "Seasonal Thai vegetables stir-fried with oyster sauce, garlic and sesame oil.",
    price: 13.0,
    category: "mains",
    tags: ["vegan"],
    emoji: "🥦",
    available: true,
    sideOptions: SIDE_LIST,
  },

  // Curries
  {
    id: "c1",
    name: "Gaeng Keow Wan",
    description: "Classic green curry with bamboo shoots, Thai aubergine, kaffir lime and your choice of protein.",
    price: 16.0,
    category: "curries",
    tags: ["spicy", "chef-pick"],
    emoji: "🍛",
    available: true,
    proteinOptions: PROTEIN_LIST,
    sideOptions: SIDE_LIST,
  },
  {
    id: "c2",
    name: "Massaman Nuea",
    description: "Rich, slow-braised meat massaman with potatoes, onions and roasted peanuts.",
    price: 18.0,
    category: "curries",
    tags: ["gluten-free"],
    emoji: "🥜",
    available: true,
    proteinOptions: PROTEIN_LIST,
    sideOptions: SIDE_LIST,
  },
  {
    id: "c3",
    name: "Gaeng Phet Phed Yang",
    description: "Red curry with roasted duck, lychee, cherry tomatoes and fresh pineapple.",
    price: 20.0,
    category: "curries",
    tags: ["spicy"],
    emoji: "🦆",
    available: true,
    sideOptions: SIDE_LIST,
  },
  {
    id: "c4",
    name: "Gaeng Kua Fak Thong",
    description: "Velvety pumpkin and tofu yellow curry with turmeric, cumin and coconut milk.",
    price: 14.5,
    category: "curries",
    tags: ["vegan", "gluten-free"],
    emoji: "🎃",
    available: true,
    sideOptions: SIDE_LIST,
  },

  // Noodles & Rice
  {
    id: "n1",
    name: "Pad Thai Goong",
    description: "Rice noodles stir-fried with your choice of protein, egg, bean sprouts and tamarind sauce.",
    price: 16.5,
    category: "noodles",
    tags: ["chef-pick"],
    emoji: "🍜",
    available: true,
    proteinOptions: PROTEIN_LIST,
  },
  {
    id: "n2",
    name: "Khao Pad Sapparod",
    description: "Pineapple fried rice with cashew nuts, raisins, turmeric and your choice of protein.",
    price: 15.0,
    category: "noodles",
    tags: ["vegan"],
    emoji: "🍍",
    available: true,
    proteinOptions: PROTEIN_LIST,
  },
  {
    id: "n3",
    name: "Guay Teow Reua",
    description: "Traditional Thai boat noodles: rich pork broth, rice noodles and crispy garlic.",
    price: 14.0,
    category: "noodles",
    tags: ["spicy"],
    emoji: "🚢",
    available: true,
  },

  // Desserts
  {
    id: "d1",
    name: "Khao Niao Mamuang",
    description: "Mango sticky rice in sweet coconut cream with ripe mango slices.",
    price: 8.0,
    category: "desserts",
    tags: ["vegan", "chef-pick"],
    emoji: "🥭",
    available: true,
  },
  {
    id: "d2",
    name: "Tub Tim Grob",
    description: "Water chestnuts in jasmine-scented coconut milk with crushed ice.",
    price: 7.0,
    category: "desserts",
    tags: ["vegan", "gluten-free"],
    emoji: "🫐",
    available: true,
  },

  // Drinks
  {
    id: "dr1",
    name: "Thai Iced Tea",
    description: "Strongly brewed Ceylon tea sweetened with palm sugar and evaporated milk.",
    price: 4.5,
    category: "drinks",
    tags: [],
    emoji: "🧋",
    available: true,
  },
  {
    id: "dr2",
    name: "Lemongrass Cooler",
    description: "Fresh lemongrass juice with kaffir lime leaf, ginger and a touch of honey.",
    price: 5.0,
    category: "drinks",
    tags: ["vegan"],
    emoji: "🌿",
    available: true,
  },
  {
    id: "dr3",
    name: "Mango Lassi",
    description: "Alphonso mango blended with yogurt, cardamom and a pinch of salt.",
    price: 5.5,
    category: "drinks",
    tags: [],
    emoji: "🥭",
    available: true,
  },
];
