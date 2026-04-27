export interface SummaryOrder {
  id: string;
  total?: number;
  status?: string;
  createdAt?: { seconds?: number } | null;
}

const isCancelled = (order: SummaryOrder) => order.status === "cancelled";

const isFromToday = (order: SummaryOrder, todayStartMs: number) => {
  if (!order.createdAt?.seconds) return false;
  const orderDateStartMs = new Date(order.createdAt.seconds * 1000).setHours(0, 0, 0, 0);
  return orderDateStartMs === todayStartMs;
};

const isFromCurrentWeek = (order: SummaryOrder, startOfWeek: Date) => {
  if (!order.createdAt?.seconds) return false;
  const orderDate = new Date(order.createdAt.seconds * 1000);
  return orderDate >= startOfWeek;
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
