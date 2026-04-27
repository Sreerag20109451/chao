export const ORDER_STATUSES = ["pending", "preparing", "ready", "delivered", "cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderType = "collection" | "delivery";

export interface OrderItem {
  name?: string;
  quantity?: number;
  basePrice?: number;
  selectedProtein?: string;
  selectedSide?: string;
  selectedSpice?: string;
}

export interface FirestoreTimestampLike {
  seconds?: number;
  nanoseconds?: number;
  _seconds?: number;
  _nanoseconds?: number;
  toDate?: () => Date;
}

export interface AdminOrder {
  id: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  orderType?: OrderType;
  status?: OrderStatus;
  source?: string;
  total?: number;
  subtotal?: number;
  deliveryCharge?: number;
  requestedPickupTime?: number;
  createdAt?: FirestoreTimestampLike | Date | string | number | null;
  items?: OrderItem[];
}
