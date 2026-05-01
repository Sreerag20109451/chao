import React, { useMemo, useState } from "react";
import { ShoppingBag, Search, FileText, ChevronDown } from "lucide-react";
import Invoice from "../Invoice";
import { useOrdersController } from "@/controllers/useOrdersController";
import { buildInvoiceData, formatPlacedAt, normalizeOrderStatus, parseOrderDate } from "@/controllers/ordersController";
import type { AdminOrder, OrderItem, OrderStatus } from "@/models/order";

function orderItemCustomizationRows(item: OrderItem & { selectedMeat?: string }): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const protein = item.selectedProtein || item.selectedMeat;
  if (protein) rows.push({ label: "Protein", value: String(protein) });
  if (item.selectedSide) rows.push({ label: "Side", value: item.selectedSide });
  if (item.selectedSpice) rows.push({ label: "Spice level", value: item.selectedSpice });
  return rows;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   "bg-amber-50   text-amber-600  border-amber-200",
  preparing: "bg-brand-violet/10 text-brand-violet border-brand-violet/20",
  ready:     "bg-blue-50    text-blue-600   border-blue-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50     text-red-500    border-red-200",
};

export default function AdminOrders() {
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);
  const {
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
    statusOptions,
  } = useOrdersController();
  const invoiceData = useMemo(
    () => (invoiceOrder ? buildInvoiceData(invoiceOrder, activeDriver) : null),
    [invoiceOrder, activeDriver]
  );

  return (
    <div data-cy="admin-orders-page" className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Active Orders</h1>
          <p className="text-brand-muted font-body">Track and manage incoming restaurant orders.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-brand-lavender-mid shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-violet animate-pulse" />
          <span className="font-display font-bold text-sm text-brand-text">
            {pendingOrdersCount} Live Orders
          </span>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="p-6 border-b border-brand-lavender-mid flex items-center gap-4 bg-white/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              data-cy="admin-orders-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID or customer…"
              className="w-full pl-12 pr-4 py-2.5 bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-lavender/10">
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Prep Time</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Placed At</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lavender-mid">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4 text-brand-muted">
                      <ShoppingBag className="w-10 h-10 opacity-30" />
                      <p className="font-display font-bold">No orders yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <React.Fragment key={order.id}>
                    {(() => {
                      const normalizedStatus = normalizeOrderStatus(order.status);
                      const isOpen = expandedOrderIds.includes(order.id);
                      return (
                    <tr
                      data-cy="admin-order-row"
                      className={`transition-colors ${
                        isOpen
                          ? "bg-brand-violet/[0.06] shadow-[inset_4px_0_0_0_#8b5cf6]"
                          : "hover:bg-brand-lavender/5"
                      }`}
                    >
                      <td className="px-6 py-4 font-display font-bold text-brand-violet">
                        #{order.id.slice(0, 6)}
                        {order.source === "pos" && (
                          <span className="ml-1 text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">POS</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-display font-bold text-brand-text">{order.customerName || "Guest"}</p>
                        <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">{order.orderType}</p>
                      </td>

                      <td className="px-6 py-4 font-display font-bold text-brand-text text-lg">
                        €{order.total?.toFixed(2) || "0.00"}
                      </td>

                      {/* Show payment method in the main table so ops can act quickly. */}
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-brand-lavender/20 text-brand-text border border-brand-lavender-mid">
                          {order.paymentMethod === "card"
                            ? "Card"
                            : order.paymentMethod === "cod"
                            ? "CoD"
                            : "Not set"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select
                            value={normalizedStatus}
                            disabled={updatingId === order.id}
                            onChange={e => updateStatus(order, e.target.value as OrderStatus)}
                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none transition-all ${STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending} disabled:opacity-60`}
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                        </div>
                        {normalizedStatus === "pending" && (
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              disabled={updatingId === order.id}
                              onClick={() => updateStatus(order, "preparing")}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-60"
                            >
                              Accept
                            </button>
                            <button
                              disabled={updatingId === order.id}
                              onClick={() => updateStatus(order, "cancelled")}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              defaultValue={order.requestedPickupTime || 20}
                              onBlur={(e) => updatePrepTime(order.id, parseInt(e.target.value))}
                              className="w-16 px-2 py-1 bg-brand-lavender/10 border border-brand-lavender-mid rounded text-xs font-bold text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-violet"
                            />
                            <span className="text-[10px] text-brand-muted font-bold uppercase">Min</span>
                          </div>
                          {order.requestedPickupTime && parseOrderDate(order.createdAt) && (
                            <p className="text-[9px] text-brand-violet font-bold uppercase tracking-tighter">
                              Target: {new Date(parseOrderDate(order.createdAt)!.getTime() + order.requestedPickupTime * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-body text-brand-muted">
                        {formatPlacedAt(order.createdAt, order.date)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <button
                            onClick={() => toggleExpanded(order.id)}
                            className="inline-flex items-center gap-1.5 text-brand-muted hover:text-brand-violet font-display font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            {expandedOrderIds.includes(order.id) ? "Hide" : "Details"}
                          </button>
                          <button
                            onClick={() => setInvoiceOrder(order)}
                            className="inline-flex items-center gap-1.5 text-brand-violet hover:text-brand-violet-dark font-display font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                      );
                    })()}
                    {expandedOrderIds.includes(order.id) && (
                      <tr className="bg-brand-violet/[0.07] shadow-[inset_0_1px_0_0_rgba(139,92,246,0.18),inset_4px_0_0_0_#8b5cf6]">
                        <td colSpan={8} className="border-t border-brand-violet/20 px-6 py-5">
                          <div className="grid gap-6 md:grid-cols-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Phone</p>
                              <p className="font-body text-sm text-brand-text">{order.customerPhone || "N/A"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Address</p>
                              <p className="font-body text-sm text-brand-text">
                                {order.orderType === "delivery" ? (order.address || "N/A") : "Collection order"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 border-t border-brand-lavender-mid pt-4">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                              Order items
                            </p>
                            {!order.items?.length ? (
                              <p className="font-body text-sm text-brand-muted">No line items recorded.</p>
                            ) : (
                              <ul className="space-y-3">
                                {order.items.map((line, idx) => {
                                  const rows = orderItemCustomizationRows(line);
                                  const qty = line.quantity ?? 1;
                                  const unit = line.basePrice != null ? Number(line.basePrice) : null;
                                  const lineTotal =
                                    unit != null && !Number.isNaN(unit) ? unit * qty : null;
                                  return (
                                    <li
                                      key={`${order.id}-item-${idx}`}
                                      className="rounded-xl border border-brand-lavender-mid bg-white px-4 py-3"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-2">
                                        <p className="font-display font-bold text-sm text-brand-text">
                                          <span className="text-brand-violet">{qty}×</span>{" "}
                                          <span className="break-words">{line.name || "Item"}</span>
                                        </p>
                                        {lineTotal != null && (
                                          <span className="shrink-0 font-body text-sm font-semibold text-brand-text">
                                            €{lineTotal.toFixed(2)}
                                          </span>
                                        )}
                                      </div>
                                      {unit != null && !Number.isNaN(unit) && (
                                        <p className="mt-0.5 font-body text-[11px] text-brand-muted">
                                          €{unit.toFixed(2)} each
                                        </p>
                                      )}
                                      {rows.length > 0 ? (
                                        <dl className="mt-3 space-y-1 border-t border-brand-lavender-mid/60 pt-3">
                                          {rows.map((row) => (
                                            <div
                                              key={`${idx}-${row.label}`}
                                              className="grid grid-cols-[7rem_1fr] gap-x-3 text-sm"
                                            >
                                              <dt className="font-display text-[10px] font-bold uppercase tracking-wide text-brand-muted">
                                                {row.label}
                                              </dt>
                                              <dd className="font-body text-brand-text break-words">{row.value}</dd>
                                            </div>
                                          ))}
                                        </dl>
                                      ) : null}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceOrder && invoiceData && (
        <Invoice
          data={invoiceData}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
