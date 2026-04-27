import type { AdminOrder } from "@/models/order";
import { parseOrderDate } from "@/controllers/ordersController";

/** Orders from Firestore — same shape as admin domain model. */
export type SummaryOrder = AdminOrder;

const isCancelled = (order: SummaryOrder) => order.status === "cancelled";

const isFromToday = (order: SummaryOrder, todayStartMs: number) => {
  const d = parseOrderDate(order.createdAt);
  if (!d) return false;
  const orderDateStartMs = new Date(d.getTime()).setHours(0, 0, 0, 0);
  return orderDateStartMs === todayStartMs;
};

const isFromCurrentWeek = (order: SummaryOrder, startOfWeek: Date) => {
  const d = parseOrderDate(order.createdAt);
  if (!d) return false;
  return d >= startOfWeek;
};

export const getDashboardOrderSummary = (orders: SummaryOrder[]) => {
  const todayStartMs = new Date().setHours(0, 0, 0, 0);
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

  const todaysOrders = orders.filter((order) => isFromToday(order, todayStartMs));
  const activeTodaysOrders = todaysOrders.filter((order) => !isCancelled(order));
  const todaysRevenue = activeTodaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  const weeklyOrders = orders.filter(
    (order) => isFromCurrentWeek(order, startOfWeek) && !isCancelled(order)
  );
  const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  return {
    activeTodaysOrders,
    todaysRevenue,
    weeklyOrders,
    weeklyRevenue,
  };
};
