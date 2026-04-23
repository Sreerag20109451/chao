/**
 * menuData.ts — Chao Thai Restaurant
 *
 * Static menu data. Organised by category for the filterable menu page.
 * Each item includes: name, description, price, tags (spicy / vegan / chef pick),
 * and an emoji placeholder (replace with real food photography in production).
 *
 * To connect to a database (e.g. Firebase Firestore), replace this file's
 * exports with async fetch functions and update menu/page.tsx accordingly.
 */

export type MenuTag = "spicy" | "vegan" | "chef-pick" | "gluten-free";

export interface MenuItem {
  id: string;
  name: string;           // Font: Bai Jamjuree SemiBold
  description: string;   // Font: Sarabun Regular
  price: number;
  category: string;
  tags: MenuTag[];
  emoji: string;          // Placeholder — swap with real <Image> src
}

export interface MenuCategory {
  id: string;
  label: string;
  description: string;   // Font: Sarabun
}

/* ---- Menu categories ---- */
export const categories: MenuCategory[] = [
  {
    id: "all",
    label: "All",
    description: "Our full Chao menu",
  },
  {
    id: "starters",
    label: "Starters",
    description: "Light bites to begin your journey",
  },
  {
    id: "mains",
    label: "Mains",
    description: "Hearty, flavour-packed Thai classics",
  },
  {
    id: "curries",
    label: "Curries",
    description: "Slow-cooked, fragrant Thai curries",
  },
  {
    id: "noodles",
    label: "Noodles & Rice",
    description: "Street food favourites done right",
  },
  {
    id: "desserts",
    label: "Desserts",
    description: "Sweet endings with a Thai twist",
  },
  {
    id: "drinks",
    label: "Drinks",
    description: "Fresh juices, Thai teas & cocktails",
  },
];

/* ---- Menu items ---- */
export const menuItems: MenuItem[] = [
  // Starters
  {
    id: "s1",
    name: "Miang Kham",
    description:
      "Betel leaves filled with toasted coconut, dried shrimp, lime, ginger and roasted peanuts with a sweet palm sugar dressing.",
    price: 8.5,
    category: "starters",
    tags: ["chef-pick"],
    emoji: "🍃",
  },
  {
    id: "s2",
    name: "Tom Kha Gai Soup",
    description:
      "Silky coconut milk broth with galangal, lemongrass, kaffir lime, mushrooms and tender chicken.",
    price: 9.0,
    category: "starters",
    tags: ["gluten-free"],
    emoji: "🍲",
  },
  {
    id: "s3",
    name: "Por Pia Tod",
    description:
      "Crispy spring rolls stuffed with glass noodles, carrots, cabbage and water chestnuts. Served with sweet chilli sauce.",
    price: 7.5,
    category: "starters",
    tags: ["vegan"],
    emoji: "🥢",
  },
  {
    id: "s4",
    name: "Satay Gai",
    description:
      "Grilled chicken skewers marinated in turmeric and coconut milk. Served with peanut sauce and ajad cucumber relish.",
    price: 10.0,
    category: "starters",
    tags: ["chef-pick", "gluten-free"],
    emoji: "🍡",
  },

  // Mains
  {
    id: "m1",
    name: "Pad Kra Pao",
    description:
      "Wok-fried minced pork with holy basil, chilli, garlic and fish sauce. Served with jasmine rice and a fried egg.",
    price: 15.5,
    category: "mains",
    tags: ["spicy", "chef-pick"],
    emoji: "🌿",
  },
  {
    id: "m2",
    name: "Pla Rad Prik",
    description:
      "Whole crispy sea bass drizzled with a fiery tamarind, chilli and palm sugar sauce, topped with fresh herbs.",
    price: 22.0,
    category: "mains",
    tags: ["spicy", "gluten-free"],
    emoji: "🐟",
  },
  {
    id: "m3",
    name: "Gai Yang",
    description:
      "Slow-grilled half chicken marinated overnight in lemongrass, coriander root and white pepper. Served with sticky rice.",
    price: 18.5,
    category: "mains",
    tags: ["gluten-free"],
    emoji: "🍗",
  },
  {
    id: "m4",
    name: "Pad Pak Ruam",
    description:
      "Seasonal Thai vegetables stir-fried with oyster sauce, garlic and sesame oil. Light, vibrant and satisfying.",
    price: 13.0,
    category: "mains",
    tags: ["vegan"],
    emoji: "🥦",
  },

  // Curries
  {
    id: "c1",
    name: "Gaeng Keow Wan",
    description:
      "Classic green curry with bamboo shoots, Thai aubergine, kaffir lime and your choice of chicken, tofu or prawns.",
    price: 16.0,
    category: "curries",
    tags: ["spicy", "chef-pick"],
    emoji: "🍛",
  },
  {
    id: "c2",
    name: "Massaman Nuea",
    description:
      "Rich, slow-braised beef massaman with potatoes, onions, roasted peanuts and a hint of cardamom. Mild and deeply aromatic.",
    price: 18.0,
    category: "curries",
    tags: ["gluten-free"],
    emoji: "🥜",
  },
  {
    id: "c3",
    name: "Gaeng Phet Phed Yang",
    description:
      "Red curry with roasted duck, lychee, cherry tomatoes and fresh pineapple in a rich coconut cream base.",
    price: 20.0,
    category: "curries",
    tags: ["spicy"],
    emoji: "🦆",
  },
  {
    id: "c4",
    name: "Gaeng Kua Fak Thong",
    description:
      "Velvety pumpkin and tofu yellow curry with turmeric, cumin and coconut milk. Naturally sweet and warming.",
    price: 14.5,
    category: "curries",
    tags: ["vegan", "gluten-free"],
    emoji: "🎃",
  },

  // Noodles & Rice
  {
    id: "n1",
    name: "Pad Thai Goong",
    description:
      "Thailand's most iconic noodle dish — rice noodles stir-fried with prawns, egg, bean sprouts and tamarind sauce.",
    price: 16.5,
    category: "noodles",
    tags: ["chef-pick"],
    emoji: "🍜",
  },
  {
    id: "n2",
    name: "Khao Pad Sapparod",
    description:
      "Pineapple fried rice with cashew nuts, raisins, turmeric and your choice of chicken or tofu. Served in a pineapple shell.",
    price: 15.0,
    category: "noodles",
    tags: ["vegan"],
    emoji: "🍍",
  },
  {
    id: "n3",
    name: "Guay Teow Reua",
    description:
      "Traditional Thai boat noodles: rich pork broth, rice noodles, morning glory, crispy garlic and a hint of dark soy.",
    price: 14.0,
    category: "noodles",
    tags: ["spicy"],
    emoji: "🚢",
  },

  // Desserts
  {
    id: "d1",
    name: "Khao Niao Mamuang",
    description:
      "Thailand's beloved mango sticky rice — glutinous rice in sweet coconut cream with ripe mango slices and sesame seeds.",
    price: 8.0,
    category: "desserts",
    tags: ["vegan", "chef-pick"],
    emoji: "🥭",
  },
  {
    id: "d2",
    name: "Tub Tim Grob",
    description:
      "Water chestnuts in jasmine-scented coconut milk with crushed ice — the perfect cool finale.",
    price: 7.0,
    category: "desserts",
    tags: ["vegan", "gluten-free"],
    emoji: "🫐",
  },

  // Drinks
  {
    id: "dr1",
    name: "Thai Iced Tea",
    description:
      "Strongly brewed Ceylon tea sweetened with palm sugar and poured over ice with a splash of evaporated milk.",
    price: 4.5,
    category: "drinks",
    tags: [],
    emoji: "🧋",
  },
  {
    id: "dr2",
    name: "Lemongrass Cooler",
    description:
      "Fresh lemongrass juice with kaffir lime leaf, ginger and a touch of honey. Served tall over ice.",
    price: 5.0,
    category: "drinks",
    tags: ["vegan"],
    emoji: "🌿",
  },
  {
    id: "dr3",
    name: "Mango Lassi",
    description:
      "Alphonso mango blended with yogurt, cardamom and a pinch of salt. Thick, cold and indulgent.",
    price: 5.5,
    category: "drinks",
    tags: [],
    emoji: "🥭",
  },
];
