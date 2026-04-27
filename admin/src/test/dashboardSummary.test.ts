import { describe, expect, it, vi } from "vitest";
import { getDashboardOrderSummary } from "../lib/orders/summary";

describe("getDashboardOrderSummary", () => {
  it("excludes cancelled orders from all summary totals", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00.000Z"));

    const orders = [
      {
        id: "active-today",
        status: "pending",
        total: 25,
        createdAt: { seconds: Math.floor(new Date("2026-04-24T09:00:00.000Z").getTime() / 1000) },
      },
      {
        id: "cancelled-today",
        status: "cancelled",
        total: 50,
        createdAt: { seconds: Math.floor(new Date("2026-04-24T10:00:00.000Z").getTime() / 1000) },
      },
      {
        id: "active-week",
        status: "delivered",
        total: 40,
        createdAt: { seconds: Math.floor(new Date("2026-04-22T10:00:00.000Z").getTime() / 1000) },
      },
    ];

    const summary = getDashboardOrderSummary(orders);

    expect(summary.activeTodaysOrders.map((o) => o.id)).toEqual(["active-today"]);
    expect(summary.todaysRevenue).toBe(25);
    expect(summary.weeklyOrders.map((o) => o.id)).toEqual(["active-today", "active-week"]);
    expect(summary.weeklyRevenue).toBe(65);

    vi.useRealTimers();
  });

  it("does not treat orders without createdAt as today's or this week's orders", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00.000Z"));

    const orders = [
      {
        id: "missing-created-at",
        status: "pending",
        total: 99,
      },
    ];

    const summary = getDashboardOrderSummary(orders);

    expect(summary.activeTodaysOrders).toEqual([]);
    expect(summary.todaysRevenue).toBe(0);
    expect(summary.weeklyOrders).toEqual([]);
    expect(summary.weeklyRevenue).toBe(0);

    vi.useRealTimers();
  });
});
