/**
 * menuData.ts — Admin App
 *
 * Shared menu type definitions and static data used by the admin dashboard.
 * In production, replace this with Firestore/API calls.
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
  available: boolean; /* Admin can toggle availability */
}

export const categories = [
  { id: "starters",  label: "Starters" },
  { id: "mains",     label: "Mains" },
  { id: "curries",   label: "Curries" },
  { id: "noodles",   label: "Noodles & Rice" },
  { id: "desserts",  label: "Desserts" },
  { id: "drinks",    label: "Drinks" },
];

/* Initial menu data — mirrors client/src/lib/menuData.ts, with `available` flag */
export const initialMenuItems: MenuItem[] = [
  { id: "s1", name: "Miang Kham",        description: "Betel leaves with toasted coconut, dried shrimp, lime and peanuts.",          price: 8.50,  category: "starters",  tags: ["chef-pick"],           emoji: "🍃", available: true },
  { id: "s2", name: "Tom Kha Gai Soup",  description: "Coconut milk broth with galangal, lemongrass and chicken.",                   price: 9.00,  category: "starters",  tags: ["gluten-free"],         emoji: "🍲", available: true },
  { id: "s3", name: "Por Pia Tod",       description: "Crispy spring rolls with glass noodles, carrots and cabbage.",                price: 7.50,  category: "starters",  tags: ["vegan"],               emoji: "🥢", available: true },
  { id: "s4", name: "Satay Gai",         description: "Grilled chicken skewers with peanut sauce and ajad relish.",                  price: 10.00, category: "starters",  tags: ["chef-pick","gluten-free"], emoji: "🍡", available: true },
  { id: "m1", name: "Pad Kra Pao",       description: "Wok-fried minced pork with holy basil, chilli and fish sauce.",              price: 15.50, category: "mains",     tags: ["spicy","chef-pick"],   emoji: "🌿", available: true },
  { id: "m2", name: "Pla Rad Prik",      description: "Crispy sea bass with tamarind and chilli sauce.",                            price: 22.00, category: "mains",     tags: ["spicy","gluten-free"], emoji: "🐟", available: true },
  { id: "m3", name: "Gai Yang",          description: "Slow-grilled chicken with lemongrass and coriander root.",                   price: 18.50, category: "mains",     tags: ["gluten-free"],         emoji: "🍗", available: true },
  { id: "m4", name: "Pad Pak Ruam",      description: "Stir-fried seasonal vegetables with oyster sauce.",                          price: 13.00, category: "mains",     tags: ["vegan"],               emoji: "🥦", available: true },
  { id: "c1", name: "Gaeng Keow Wan",    description: "Green curry with bamboo shoots, Thai aubergine and kaffir lime.",            price: 16.00, category: "curries",   tags: ["spicy","chef-pick"],   emoji: "🍛", available: true },
  { id: "c2", name: "Massaman Nuea",     description: "Slow-braised beef massaman with potatoes and peanuts.",                      price: 18.00, category: "curries",   tags: ["gluten-free"],         emoji: "🥜", available: true },
  { id: "c3", name: "Gaeng Phet Phed",   description: "Red curry with roasted duck, lychee and pineapple.",                        price: 20.00, category: "curries",   tags: ["spicy"],               emoji: "🦆", available: true },
  { id: "c4", name: "Gaeng Kua Fak Thong",description:"Pumpkin and tofu yellow curry with turmeric.",                              price: 14.50, category: "curries",   tags: ["vegan","gluten-free"], emoji: "🎃", available: true },
  { id: "n1", name: "Pad Thai Goong",    description: "Classic rice noodles with prawns, egg and tamarind.",                        price: 16.50, category: "noodles",   tags: ["chef-pick"],           emoji: "🍜", available: true },
  { id: "n2", name: "Khao Pad Sapparod", description: "Pineapple fried rice with cashews and turmeric.",                           price: 15.00, category: "noodles",   tags: ["vegan"],               emoji: "🍍", available: true },
  { id: "n3", name: "Guay Teow Reua",    description: "Thai boat noodles with rich pork broth and morning glory.",                  price: 14.00, category: "noodles",   tags: ["spicy"],               emoji: "🚢", available: true },
  { id: "d1", name: "Khao Niao Mamuang", description: "Mango sticky rice in sweet coconut cream.",                                 price: 8.00,  category: "desserts",  tags: ["vegan","chef-pick"],   emoji: "🥭", available: true },
  { id: "d2", name: "Tub Tim Grob",      description: "Water chestnuts in jasmine coconut milk with ice.",                         price: 7.00,  category: "desserts",  tags: ["vegan","gluten-free"], emoji: "🫐", available: true },
  { id: "dr1",name: "Thai Iced Tea",     description: "Strong Ceylon tea with palm sugar and evaporated milk.",                     price: 4.50,  category: "drinks",    tags: [],                      emoji: "🧋", available: true },
  { id: "dr2",name: "Lemongrass Cooler", description: "Lemongrass juice with kaffir lime and ginger.",                             price: 5.00,  category: "drinks",    tags: ["vegan"],               emoji: "🌿", available: true },
  { id: "dr3",name: "Mango Lassi",       description: "Alphonso mango blended with yogurt and cardamom.",                          price: 5.50,  category: "drinks",    tags: [],                      emoji: "🥭", available: true },
];
