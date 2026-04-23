"use client";

import React from "react";
import Image from "next/image";
import { Printer, X } from "lucide-react";

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  selectedProtein?: string;
  selectedSide?: string;
  category?: string;
}

export interface InvoiceData {
  orderId: string;
  customerName?: string;
  address?: string;
  orderType: "collection" | "delivery";
  items: InvoiceItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  date: string;
  time: string;
}

interface InvoiceProps {
  data: InvoiceData;
  onClose: () => void;
}

export default function Invoice({ data, onClose }: InvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-full shadow-2xl flex flex-col overflow-hidden border border-zinc-200">
        {/* Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 no-print bg-zinc-50">
          <h2 className="text-sm font-display font-bold text-zinc-500 uppercase tracking-widest">Document Preview</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-display font-bold hover:bg-black transition-all">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button onClick={onClose} className="p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:bg-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto p-12 bg-white print:p-0" id="invoice-content">
          <div className="max-w-full mx-auto font-sans text-zinc-900">
            {/* Header Section */}
            <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-8 mb-8">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tighter uppercase">Chao Thai</h1>
                <div className="text-xs space-y-0.5 text-zinc-600">
                  <p>8 O'Connell St, Trinity Without</p>
                  <p>Waterford, X91 CH61</p>
                  <p>T: 089 447 6628</p>
                  <p>W: www.chaothai.ie</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Invoice</h2>
                <div className="text-xs space-y-1 text-zinc-600">
                  <p><span className="font-bold text-zinc-900">No:</span> #{data.orderId}</p>
                  <p><span className="font-bold text-zinc-900">Date:</span> {data.date}</p>
                  <p><span className="font-bold text-zinc-900">Time:</span> {data.time}</p>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <h3 className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest mb-2">Service Type</h3>
                <p className="text-xs font-bold uppercase">{data.orderType}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest mb-2">Customer Details</h3>
                <div className="text-xs leading-relaxed">
                  <p className="font-bold">{data.customerName || "Counter Sale"}</p>
                  {data.orderType === "delivery" && data.address ? (
                    <p className="whitespace-pre-wrap">{data.address}</p>
                  ) : (
                    <p className="italic">Collection / Takeaway</p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-10">
              <thead>
                <tr className="border-b border-zinc-300">
                  <th className="py-3 text-left text-[10px] font-bold uppercase tracking-wider">Item Description</th>
                  <th className="py-3 text-center text-[10px] font-bold uppercase tracking-wider w-16">Qty</th>
                  <th className="py-3 text-right text-[10px] font-bold uppercase tracking-wider w-24">Price</th>
                  <th className="py-3 text-right text-[10px] font-bold uppercase tracking-wider w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.items.map((item, idx) => (
                  <tr key={`${item.name}-${idx}`}>
                    <td className="py-4">
                      <p className="text-xs font-bold">{item.name}</p>
                      {(item.selectedProtein || item.selectedSide) && (
                        <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-medium">
                          {item.selectedProtein && <span className="mr-3">Meat: {item.selectedProtein}</span>}
                          {item.selectedSide && <span>Side: {item.selectedSide}</span>}
                        </p>
                      )}
                    </td>
                    <td className="py-4 text-center text-xs">{item.quantity}</td>
                    <td className="py-4 text-right text-xs">£{item.price.toFixed(2)}</td>
                    <td className="py-4 text-right text-xs font-bold">£{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-end border-t-2 border-zinc-900 pt-6">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-medium">£{data.subtotal.toFixed(2)}</span>
                </div>
                {data.orderType === "delivery" && (
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Delivery Charge</span>
                    <span className="font-medium">£{data.deliveryCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-zinc-200 pt-2 mt-2">
                  <span className="uppercase tracking-tighter">Total Amount</span>
                  <span>£{data.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-20 pt-8 border-t border-zinc-100 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Thank you for your business</p>
              <p className="text-[9px] text-zinc-400 leading-relaxed">
                Goods received in good condition. This is a computer-generated document.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #invoice-content, #invoice-content * { visibility: visible; }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
