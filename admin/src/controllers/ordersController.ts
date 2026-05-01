import type { InvoiceData } from "@/components/Invoice";
import { ORDER_STATUSES, type AdminOrder, type FirestoreTimestampLike, type OrderStatus } from "@/models/order";

const isTimestampObject = (value: unknown): value is FirestoreTimestampLike =>
  !!value && typeof value === "object";

// Normalize status values from legacy/seed data (e.g., "Pending", "PENDING")
// so UI actions and status updates always behave predictably.
export const normalizeOrderStatus = (status: unknown): OrderStatus => {
  if (typeof status !== "string") {
    return "pending";
  }

  const normalized = status.toLowerCase().trim() as OrderStatus;
  return ORDER_STATUSES.includes(normalized) ? normalized : "pending";
};

export const parseOrderDate = (createdAt: AdminOrder["createdAt"]): Date | null => {
  if (!createdAt) return null;

  if (isTimestampObject(createdAt) && typeof createdAt.toDate === "function") {
    const date = createdAt.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (isTimestampObject(createdAt) && typeof createdAt.seconds === "number") {
    const millis = createdAt.seconds * 1000 + Math.floor((createdAt.nanoseconds || 0) / 1_000_000);
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Some Firestore payloads expose private fields (_seconds/_nanoseconds).
  // We support those defensively to avoid "Unknown" dates in order history.
  if (isTimestampObject(createdAt) && typeof createdAt._seconds === "number") {
    const millis = createdAt._seconds * 1000 + Math.floor((createdAt._nanoseconds || 0) / 1_000_000);
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (createdAt instanceof Date) {
    return Number.isNaN(createdAt.getTime()) ? null : createdAt;
  }

  if (typeof createdAt === "string" || typeof createdAt === "number") {
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

export const formatPlacedAt = (createdAt: AdminOrder["createdAt"], fallbackDate?: string) => {
  const date = parseOrderDate(createdAt);
  if (!date) return fallbackDate || "Unknown";

  return `${date.toLocaleDateString("en-IE")} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export const buildInvoiceData = (order: AdminOrder, activeDriver: string | null): InvoiceData => {
  const date = parseOrderDate(order.createdAt);

  const subtotal = order.subtotal ?? 0;
  const deliveryCharge = order.deliveryCharge ?? 0;
  const total = order.total ?? 0;

  const serviceCharge =
    typeof order.serviceCharge === "number" && !Number.isNaN(order.serviceCharge)
      ? order.serviceCharge
      : Math.max(0, Math.round((total - subtotal - deliveryCharge) * 100) / 100);

  return {
    orderId: order.id,
    customerName: order.customerName || "Guest",
    customerPhone: order.customerPhone || undefined,
    address: order.address || undefined,
    orderType: order.orderType || "collection",
    items: (order.items || []).map((item) => ({
      name: item.name || "",
      quantity: item.quantity || 0,
      price: item.basePrice || 0,
      selectedProtein: item.selectedProtein || undefined,
      selectedSide: item.selectedSide || undefined,
      selectedSpice: item.selectedSpice || undefined,
    })),
    subtotal,
    serviceCharge,
    deliveryCharge,
    total,
    date: date?.toLocaleDateString("en-IE") || new Date().toLocaleDateString("en-IE"),
    time:
      date?.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }) || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    paymentMethod: order.paymentMethod || undefined,
    driverName: order.orderType === "delivery" ? activeDriver || undefined : undefined,
  };
};
