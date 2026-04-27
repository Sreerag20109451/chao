import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { subscribeToOrders, updateOrderStatusWithNotification } from "@/lib/firebase/orders/service";
import { ORDER_STATUSES, type AdminOrder, type OrderStatus } from "@/models/order";
import { normalizeOrderStatus } from "@/controllers/ordersController";
import { toast } from "sonner";

export const useOrdersController = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [activeDriver, setActiveDriver] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((newOrders) => setOrders(newOrders as AdminOrder[]));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getDocs(query(collection(db, "drivers"), where("isWorkingToday", "==", true)))
      .then((snapshot) => {
        if (!snapshot.empty) setActiveDriver(String(snapshot.docs[0].data().name));
      })
      .catch(console.error);
  }, []);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (!search) return true;
        const needle = search.toLowerCase();
        return (
          order.id.toLowerCase().includes(needle) ||
          (order.customerName || "").toLowerCase().includes(needle)
        );
      }),
    [orders, search]
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => normalizeOrderStatus(order.status) === "pending").length,
    [orders]
  );

  const updateStatus = async (order: AdminOrder, status: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      await updateOrderStatusWithNotification(order, status);
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const updatePrepTime = async (orderId: string, minutes: number) => {
    if (!Number.isFinite(minutes)) return;
    try {
      await updateDoc(doc(db, "orders", orderId), { requestedPickupTime: minutes });
    } catch (error) {
      console.error("Failed to update prep time:", error);
    }
  };

  const toggleExpanded = (orderId: string) => {
    setExpandedOrderIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]
    );
  };

  return {
    orders,
    search,
    setSearch,
    activeDriver,
    updatingId,
    expandedOrderIds,
    filteredOrders,
    pendingOrdersCount,
    updateStatus,
    updatePrepTime,
    toggleExpanded,
    statusOptions: ORDER_STATUSES,
  };
};
