"use client";

import React from "react";
import { Printer, X } from "lucide-react";

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  selectedProtein?: string;
  selectedSide?: string;
  category?: string;
  total?: number;
}

export interface InvoiceData {
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  orderType: "collection" | "delivery";
  items: InvoiceItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  date: string;
  time: string;
  driverName?: string;
  driverPhone?: string;
}

interface InvoiceProps {
  data: InvoiceData;
  onClose: () => void;
}

export default function Invoice({ data, onClose }: InvoiceProps) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-full shadow-2xl flex flex-col overflow-hidden border border-zinc-200">

        {/* Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 no-print bg-zinc-50">
          <h2 className="text-sm font-display font-bold text-zinc-500 uppercase tracking-widest">Document Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-display font-bold hover:bg-black transition-all"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto p-12 bg-white print:p-8" id="invoice-content">
          <div className="max-w-full mx-auto font-sans text-zinc-900" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>

            {/* ── Header ── */}
            <div className="flex justify-between items-start pb-6 mb-6 border-b-2 border-zinc-900">
              {/* Left: Restaurant */}
              <div>
                <h1 className="text-3xl font-black tracking-tight mb-3" style={{ fontWeight: 900 }}>CHAO THAI</h1>
                <div className="text-xs text-zinc-600 space-y-0.5">
                  <p>8 O'Connell St, Trinity Without</p>
                  <p>Waterford, X91 CH61</p>
                  <p>T: 089 447 6628  |  W: www.chaothai.ie</p>
                </div>
              </div>
              {/* Right: Invoice meta */}
              <div className="text-right">
                <h2 className="text-3xl font-black tracking-tight mb-3" style={{ fontWeight: 900 }}>INVOICE</h2>
                <div className="text-xs text-zinc-600 space-y-0.5">
                  <p>No: <span className="font-bold text-zinc-900">#{data.orderId.slice(0, 8).toUpperCase()}</span></p>
                  <p>Date: <span className="font-semibold text-zinc-900">{data.date}</span></p>
                  <p>Time: <span className="font-semibold text-zinc-900">{data.time}</span></p>
                </div>
              </div>
            </div>

            {/* ── Details Grid ── */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              {/* Left: Service Type + Driver */}
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest mb-2">Service Type</p>
                <p className="text-sm font-bold uppercase mb-2">{data.orderType}</p>
                {data.orderType === "delivery" && data.driverName && (
                  <div className="text-xs text-zinc-600 space-y-0.5">
                    <p>Driver: <span className="font-semibold text-zinc-800">{data.driverName}</span></p>
                    {data.driverPhone && <p>Mobile: <span className="font-semibold text-zinc-800">{data.driverPhone}</span></p>}
                  </div>
                )}
              </div>
              {/* Right: Customer */}
              <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest mb-2">Customer Details</p>
                <p className="text-sm font-bold mb-1">{data.customerName || "Counter Sale"}</p>
                <div className="text-xs text-zinc-600 space-y-0.5">
                  {data.customerPhone && <p>{data.customerPhone}</p>}
                  {data.orderType === "delivery" && data.address ? (
                    <p className="whitespace-pre-wrap">{data.address}</p>
                  ) : (
                    <p className="italic">Collection / Takeaway</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Items Table ── */}
            <table className="w-full mb-0 border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-white">
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider">Item Description</th>
                  <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider w-16">Qty</th>
                  <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider w-24">Unit</th>
                  <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={`${item.name}-${idx}`} style={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#ffffff" }}>
                    <td className="py-3 px-4">
                      <p className="text-xs font-medium">{item.name}</p>
                      {(item.selectedProtein || item.selectedSide) && (
                        <p className="text-[9px] text-zinc-500 mt-0.5">
                          {[item.selectedProtein && `Protein: ${item.selectedProtein}`, item.selectedSide && `Side: ${item.selectedSide}`].filter(Boolean).join("  ·  ")}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-xs">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-xs">€{item.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-xs font-semibold">€{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Totals ── */}
            <div className="flex justify-end mt-6">
              <div className="w-64">
                <div className="flex justify-between text-xs py-1 text-zinc-600">
                  <span>Subtotal</span>
                  <span>€{data.subtotal.toFixed(2)}</span>
                </div>
                {(data as any).serviceCharge !== undefined && (
                  <div className="flex justify-between text-xs py-1 text-zinc-600">
                    <span>Service Charge</span>
                    <span>€{((data as any).serviceCharge).toFixed(2)}</span>
                  </div>
                )}
                {data.orderType === "delivery" && (
                  <div className="flex justify-between text-xs py-1 text-zinc-600">
                    <span>Delivery</span>
                    <span>€{data.deliveryCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-zinc-900 mt-2 pt-2 flex justify-between">
                  <span className="text-sm font-black uppercase tracking-tight">Total Amount</span>
                  <span className="text-sm font-black">€{data.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="mt-16 text-center border-t border-zinc-100 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Thank You For Your Business</p>
              <p className="text-[9px] text-zinc-400">Goods received in good condition. This is a computer-generated document.</p>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #invoice-content, #invoice-content * { 
            visibility: visible; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px !important;
            margin: 0 !important;
            border: none !important;
          }
          /* Force borders to be visible */
          .border-zinc-900 { border-color: #000000 !important; }
          .bg-zinc-900 { background-color: #000000 !important; }
        }
      `}</style>
    </div>
  );
}
