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
  /** Human-readable order reference when stored on the document */
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  orderType?: OrderType;
  status?: OrderStatus;
  source?: string;
  total?: number;
  subtotal?: number;
  /** 5% service charge when applicable (may be derived from total − subtotal − delivery if omitted on legacy docs). */
  serviceCharge?: number;
  deliveryCharge?: number;
  requestedPickupTime?: number;
  paymentMethod?: "card" | "cod" | string;
  paymentStatus?: string;
  createdAt?: FirestoreTimestampLike | Date | string | number | null;
  /** Legacy date field from older Firestore documents (e.g. ISO string) */
  date?: string;
  items?: OrderItem[];
}
