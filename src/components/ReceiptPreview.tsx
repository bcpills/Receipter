import React from 'react';
import { ReceiptData } from '../types';
import { calculateReceiptTotals, formatMoney } from '../utils/receiptCalculations';
import { ReceiptBarcode, ReceiptQR } from './ReceiptVisuals';
import { CheckCircle2, DollarSign, Store, ShieldCheck, CreditCard } from 'lucide-react';

interface ReceiptPreviewProps {
  receipt: ReceiptData;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ receipt }) => {
  const totals = calculateReceiptTotals(receipt);
  const { subtotal, discount, tax, grandTotal, changeDue } = totals;
  const sym = receipt.currencySymbol || '$';

  // Render based on selected template
  if (receipt.template === 'thermal') {
    return (
      <div 
        id="receipt-print-area"
        className="w-full max-w-[380px] mx-auto bg-[#fafaf9] text-gray-900 font-mono text-xs shadow-xl rounded-t-sm p-6 sm:p-7 relative border-t-4 border-gray-800 selection:bg-gray-200"
        style={{ letterSpacing: '-0.02em' }}
      >
        {/* Top Header */}
        <div className="text-center space-y-1.5 pb-4">
          {receipt.logoUrl && (
            <div className="flex justify-center mb-2">
              <img
                src={receipt.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-md"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <h1 className="font-bold text-base uppercase tracking-wider text-gray-900 leading-tight">
            {receipt.companyName || 'COMPANY NAME'}
          </h1>
          {receipt.companyTagline && (
            <p className="text-[11px] text-gray-600 italic">{receipt.companyTagline}</p>
          )}
          {receipt.companyAddress && (
            <p className="text-[11px] text-gray-600 whitespace-pre-line leading-relaxed">
              {receipt.companyAddress}
            </p>
          )}
          <div className="text-[10px] text-gray-500 pt-0.5 space-x-2">
            {receipt.companyPhone && <span>TEL: {receipt.companyPhone}</span>}
            {receipt.companyEmail && <span>{receipt.companyEmail}</span>}
          </div>
          {receipt.companyWebsite && (
            <p className="text-[10px] text-gray-500">{receipt.companyWebsite}</p>
          )}
        </div>

        {/* Dashed Separator */}
        <div className="border-b border-dashed border-gray-400 my-2" />

        {/* Metadata */}
        <div className="py-2 text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">RECEIPT #:</span>
            <span className="font-bold">{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DATE & TIME:</span>
            <span>{receipt.date} {receipt.time}</span>
          </div>
          {receipt.customerName && (
            <div className="flex justify-between">
              <span className="text-gray-500">CUSTOMER:</span>
              <span className="font-medium truncate max-w-[190px]">{receipt.customerName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">PAY METHOD:</span>
            <span className="font-semibold uppercase">{receipt.paymentMethod}</span>
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="border-b-2 border-dashed border-gray-800 my-2" />

        {/* Items List */}
        <div className="py-2">
          <div className="grid grid-cols-12 text-[10px] font-bold text-gray-600 pb-1.5 border-b border-gray-300 uppercase">
            <span className="col-span-6">ITEM</span>
            <span className="col-span-2 text-center">QTY</span>
            <span className="col-span-4 text-right">AMOUNT</span>
          </div>
          
          <div className="divide-y divide-gray-200/70 py-1">
            {receipt.items.length === 0 ? (
              <div className="py-3 text-center text-gray-400 italic text-[11px]">
                No items entered
              </div>
            ) : (
              receipt.items.map((item) => {
                const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <div key={item.id} className="py-2">
                    <div className="grid grid-cols-12 items-baseline">
                      <span className="col-span-6 font-medium text-[11px] text-gray-900 pr-1 break-words">
                        {item.name || 'Item'}
                      </span>
                      <span className="col-span-2 text-center text-gray-600">
                        {item.quantity}
                      </span>
                      <span className="col-span-4 text-right font-medium text-[11px]">
                        {formatMoney(itemTotal, sym)}
                      </span>
                    </div>
                    {item.unitPrice > 0 && (
                      <div className="text-[10px] text-gray-500 pl-0.5">
                        @ {formatMoney(item.unitPrice, sym)} each
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="border-b border-dashed border-gray-400 my-2" />

        {/* Totals */}
        <div className="py-1 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatMoney(subtotal, sym)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-emerald-800">
              <span>
                Discount {receipt.discountType === 'percentage' ? `(${receipt.discountAmount}%)` : ''}:
              </span>
              <span>-{formatMoney(discount, sym)}</span>
            </div>
          )}

          {receipt.taxRate > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Sales Tax ({receipt.taxRate}%):</span>
              <span>{formatMoney(tax, sym)}</span>
            </div>
          )}

          <div className="border-t-2 border-gray-900 pt-2 flex justify-between items-baseline font-bold text-sm text-gray-900">
            <span>TOTAL:</span>
            <span className="text-base tracking-tight">{formatMoney(grandTotal, sym)}</span>
          </div>

          {receipt.paymentMethod === 'Cash' && receipt.cashReceived ? (
            <>
              <div className="flex justify-between text-gray-600 pt-1">
                <span>Cash Tendered:</span>
                <span>{formatMoney(receipt.cashReceived, sym)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900">
                <span>Change Due:</span>
                <span>{formatMoney(changeDue, sym)}</span>
              </div>
            </>
          ) : null}
        </div>

        {/* PAYMENT PRESET MESSAGE & STATUS */}
        <div className="my-4 py-3 px-3 bg-white border border-gray-300 rounded text-center space-y-1">
          <div className="inline-flex items-center gap-1 font-bold text-gray-900 uppercase text-[11px] tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>*** {receipt.paymentStatus.toUpperCase()} ***</span>
          </div>
          {receipt.paymentMessage && (
            <p className="font-semibold text-gray-800 text-[11px] leading-snug">
              {receipt.paymentMessage}
            </p>
          )}
        </div>

        {/* Notes */}
        {receipt.notes && (
          <p className="text-[10px] text-gray-500 text-center italic my-2">
            {receipt.notes}
          </p>
        )}

        {/* Barcode & QR */}
        <ReceiptBarcode value={receipt.barcodeValue || receipt.receiptNumber} />
        <ReceiptQR text={`${receipt.companyName}-${receipt.receiptNumber}-${grandTotal}`} />

        <div className="text-center pt-2 pb-1 text-[9px] text-gray-400 uppercase tracking-wider">
          *** THANK YOU • COME AGAIN ***
        </div>

        {/* Paper Tear / Jagged Edge Bottom */}
        <div className="absolute -bottom-2 left-0 right-0 h-3 overflow-hidden flex">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-[#fafaf9]"
            />
          ))}
        </div>
      </div>
    );
  }

  // Modern Template
  if (receipt.template === 'modern') {
    return (
      <div 
        id="receipt-print-area"
        className="w-full max-w-[420px] mx-auto bg-white text-slate-800 shadow-xl rounded-2xl p-7 relative border border-slate-200"
      >
        {/* Header with Brand */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            {receipt.logoUrl ? (
              <img
                src={receipt.logoUrl}
                alt="Company Logo"
                className="w-14 h-14 object-contain rounded-xl border border-slate-100 p-0.5"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                {receipt.companyName ? receipt.companyName.charAt(0).toUpperCase() : 'R'}
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">
                {receipt.companyName || 'Company Name'}
              </h1>
              {receipt.companyTagline && (
                <p className="text-xs text-slate-500">{receipt.companyTagline}</p>
              )}
              {receipt.companyAddress && (
                <p className="text-[11px] text-slate-400 mt-0.5">{receipt.companyAddress}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">
              {receipt.paymentStatus}
            </span>
            <p className="text-[11px] font-mono text-slate-400 mt-1">#{receipt.receiptNumber}</p>
          </div>
        </div>

        {/* Date & Customer Row */}
        <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-100">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Billed To</span>
            <p className="font-medium text-slate-800 mt-0.5">{receipt.customerName || 'Valued Customer'}</p>
            {receipt.customerContact && (
              <p className="text-slate-400 text-[11px]">{receipt.customerContact}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date & Payment</span>
            <p className="font-medium text-slate-800 mt-0.5">{receipt.date}</p>
            <p className="text-slate-500 text-[11px]">{receipt.paymentMethod}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 text-[10px] uppercase">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium text-center">Qty</th>
                <th className="pb-2 font-medium text-right">Price</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {receipt.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400 italic text-[11px]">
                    No items entered
                  </td>
                </tr>
              ) : (
                receipt.items.map((item) => {
                  const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-2 font-medium text-slate-900">{item.name || 'Item'}</td>
                      <td className="py-2.5 text-center text-slate-500">{item.quantity}</td>
                      <td className="py-2.5 text-right text-slate-500">{formatMoney(item.unitPrice, sym)}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">{formatMoney(itemTotal, sym)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-medium text-slate-800">{formatMoney(subtotal, sym)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount {receipt.discountType === 'percentage' ? `(${receipt.discountAmount}%)` : ''}</span>
              <span className="font-medium">-{formatMoney(discount, sym)}</span>
            </div>
          )}
          {receipt.taxRate > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Tax ({receipt.taxRate}%)</span>
              <span className="font-medium text-slate-800">{formatMoney(tax, sym)}</span>
            </div>
          )}
          <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-sm font-bold text-slate-900">
            <span>Total Paid</span>
            <span className="text-base text-slate-900">{formatMoney(grandTotal, sym)}</span>
          </div>
        </div>

        {/* Selected Preset Payment Message */}
        {receipt.paymentMessage ? (
          <div className="mt-5 p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Payment Acknowledgment</p>
              <p className="text-xs font-medium text-white">{receipt.paymentMessage}</p>
            </div>
          </div>
        ) : null}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            {receipt.companyWebsite && <span>{receipt.companyWebsite}</span>}
          </div>
          <div className="font-mono text-[10px]">
            {receipt.receiptNumber}
          </div>
        </div>
      </div>
    );
  }

  // Boutique Luxury Template
  if (receipt.template === 'boutique') {
    return (
      <div 
        id="receipt-print-area"
        className="w-full max-w-[420px] mx-auto bg-[#faf8f5] text-stone-800 shadow-xl rounded-xl p-8 relative border border-[#e7e1d8]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {/* Top Emblem & Brand */}
        <div className="text-center pb-6 border-b border-[#e2d9cd]">
          {receipt.logoUrl ? (
            <div className="flex justify-center mb-3">
              <img
                src={receipt.logoUrl}
                alt="Boutique Logo"
                className="w-16 h-16 object-contain rounded-full border border-[#d6c7b2] p-1 bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-12 h-12 mx-auto mb-3 rounded-full border border-[#bfa88c] flex items-center justify-center text-[#99774d] text-lg font-serif">
              ✦
            </div>
          )}
          <h1 className="text-xl font-serif tracking-wide text-stone-900 uppercase">
            {receipt.companyName || 'Artisan Studio'}
          </h1>
          {receipt.companyTagline && (
            <p className="text-xs italic text-stone-500 mt-1 font-serif">{receipt.companyTagline}</p>
          )}
          <p className="text-[11px] text-stone-500 font-sans mt-1">
            {receipt.companyAddress}
          </p>
          <div className="text-[10px] font-sans text-stone-400 mt-0.5 space-x-2">
            {receipt.companyPhone && <span>T: {receipt.companyPhone}</span>}
            {receipt.companyEmail && <span>{receipt.companyEmail}</span>}
          </div>
        </div>

        {/* Receipt Details */}
        <div className="py-4 text-xs font-sans flex justify-between border-b border-[#e2d9cd] text-stone-600">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Receipt No.</span>
            <span className="font-medium text-stone-800">{receipt.receiptNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Date</span>
            <span className="font-medium text-stone-800">{receipt.date}</span>
          </div>
        </div>

        {/* Items */}
        <div className="py-5 font-sans">
          <div className="divide-y divide-[#ece5db]">
            {receipt.items.length === 0 ? (
              <div className="py-4 text-center text-stone-400 italic text-xs font-serif">
                No items entered
              </div>
            ) : (
              receipt.items.map((item) => {
                const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <div key={item.id} className="py-3 flex justify-between items-baseline">
                    <div>
                      <h3 className="font-serif text-sm font-medium text-stone-900">{item.name || 'Item'}</h3>
                      <p className="text-[11px] text-stone-400">
                        {item.quantity} × {formatMoney(item.unitPrice, sym)}
                      </p>
                    </div>
                    <span className="font-serif text-sm font-semibold text-stone-900">
                      {formatMoney(itemTotal, sym)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-[#e2d9cd] pt-4 font-sans space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, sym)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[#8b6534]">
              <span>Special Courtesy Discount</span>
              <span>-{formatMoney(discount, sym)}</span>
            </div>
          )}
          {receipt.taxRate > 0 && (
            <div className="flex justify-between">
              <span>Tax ({receipt.taxRate}%)</span>
              <span>{formatMoney(tax, sym)}</span>
            </div>
          )}
          <div className="border-t border-[#d8ccbe] pt-3 flex justify-between items-baseline font-serif text-base font-bold text-stone-900">
            <span>Total Amount</span>
            <span className="text-lg text-[#7c5625]">{formatMoney(grandTotal, sym)}</span>
          </div>
        </div>

        {/* Preset Payment Message Banner */}
        {receipt.paymentMessage ? (
          <div className="mt-6 p-4 border border-[#d6c7b2] bg-[#f5f1eb] rounded-lg text-center space-y-1">
            <div className="text-[10px] uppercase font-sans tracking-widest text-[#8b6534] font-semibold">
              {receipt.paymentMethod} • {receipt.paymentStatus}
            </div>
            <p className="font-serif italic text-stone-800 text-sm">
              "{receipt.paymentMessage}"
            </p>
          </div>
        ) : null}

        <div className="mt-6 text-center text-[10px] font-sans text-stone-400 tracking-wider uppercase">
          With our compliments • {receipt.companyWebsite || 'Thank you for your patronage'}
        </div>
      </div>
    );
  }

  // Corporate Invoice / Professional Slip
  if (receipt.template === 'corporate') {
    return (
      <div 
        id="receipt-print-area"
        className="w-full max-w-[440px] mx-auto bg-white text-slate-900 shadow-xl rounded-lg p-7 border border-slate-200"
      >
        {/* Top Navy Header Banner */}
        <div className="bg-slate-900 text-white -m-7 p-6 mb-6 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            {receipt.logoUrl ? (
              <img
                src={receipt.logoUrl}
                alt="Corporate Logo"
                className="w-12 h-12 object-contain bg-white rounded p-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Store className="w-8 h-8 text-slate-300" />
            )}
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">{receipt.companyName || 'Corporate Billing'}</h1>
              <p className="text-xs text-slate-300">{receipt.companyTagline || 'Official Receipt'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono uppercase bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              RECEIPT
            </span>
            <p className="text-[11px] font-mono text-slate-300 mt-1">#{receipt.receiptNumber}</p>
          </div>
        </div>

        {/* Company & Client info */}
        <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Merchant</span>
            <p className="font-semibold text-slate-800 mt-0.5">{receipt.companyName}</p>
            <p className="text-slate-500 text-[11px] whitespace-pre-line">{receipt.companyAddress}</p>
            <p className="text-slate-500 text-[11px]">{receipt.companyPhone}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Customer</span>
            <p className="font-semibold text-slate-800 mt-0.5">{receipt.customerName || 'Cash Client'}</p>
            <p className="text-slate-500 text-[11px]">{receipt.customerContact}</p>
            <div className="mt-2 text-slate-600 text-[11px]">
              <span className="font-medium">Date: </span>{receipt.date}
            </div>
          </div>
        </div>

        {/* Item table */}
        <div className="py-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[11px]">
                <th className="py-2 px-2 text-left font-semibold">Description</th>
                <th className="py-2 px-1 text-center font-semibold">Qty</th>
                <th className="py-2 px-1 text-right font-semibold">Rate</th>
                <th className="py-2 px-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipt.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-slate-400 italic text-xs">
                    No items entered
                  </td>
                </tr>
              ) : (
                receipt.items.map((item) => {
                  const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <tr key={item.id}>
                      <td className="py-2.5 px-2 font-medium text-slate-800">{item.name || 'Item'}</td>
                      <td className="py-2.5 px-1 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-2.5 px-1 text-right text-slate-600">{formatMoney(item.unitPrice, sym)}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-900">{formatMoney(itemTotal, sym)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatMoney(subtotal, sym)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount:</span>
              <span>-{formatMoney(discount, sym)}</span>
            </div>
          )}
          {receipt.taxRate > 0 && (
            <div className="flex justify-between">
              <span>Tax ({receipt.taxRate}%):</span>
              <span>{formatMoney(tax, sym)}</span>
            </div>
          )}
          <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-baseline text-sm font-bold text-slate-900">
            <span>TOTAL PAID:</span>
            <span className="text-base text-blue-900">{formatMoney(grandTotal, sym)}</span>
          </div>
        </div>

        {/* Preset message */}
        {receipt.paymentMessage ? (
          <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded text-center">
            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Status: {receipt.paymentStatus} via {receipt.paymentMethod}
            </div>
            <p className="text-xs font-semibold text-slate-900 mt-1">
              {receipt.paymentMessage}
            </p>
          </div>
        ) : null}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>Auth Ref: {receipt.barcodeValue || 'AUTH-9901'}</span>
          <span>{receipt.companyWebsite || 'All rights reserved'}</span>
        </div>
      </div>
    );
  }

  // Minimal Swiss Template
  return (
    <div 
      id="receipt-print-area"
      className="w-full max-w-[400px] mx-auto bg-white text-zinc-900 shadow-xl p-8 border border-zinc-200"
    >
      <div className="border-b-2 border-black pb-5">
        {receipt.logoUrl && (
          <img
            src={receipt.logoUrl}
            alt="Logo"
            className="w-12 h-12 object-contain mb-3 grayscale"
            referrerPolicy="no-referrer"
          />
        )}
        <h1 className="text-xl font-bold tracking-tight uppercase">{receipt.companyName || 'RECEIPT'}</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{receipt.companyAddress}</p>
        <p className="text-xs text-zinc-500">{receipt.companyPhone}</p>
      </div>

      <div className="py-4 text-xs space-y-1 text-zinc-600 border-b border-zinc-200">
        <div className="flex justify-between">
          <span>Receipt No.</span>
          <span className="font-mono font-bold text-black">{receipt.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span>
          <span className="text-black">{receipt.date}</span>
        </div>
        {receipt.customerName && (
          <div className="flex justify-between">
            <span>Customer</span>
            <span className="text-black font-medium">{receipt.customerName}</span>
          </div>
        )}
      </div>

      <div className="py-4 divide-y divide-zinc-100 text-xs">
        {receipt.items.length === 0 ? (
          <div className="py-3 text-center text-zinc-400 italic text-xs">
            No items entered
          </div>
        ) : (
          receipt.items.map((item) => {
            const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
            return (
              <div key={item.id} className="py-2 flex justify-between">
                <div>
                  <span className="font-medium text-black">{item.name || 'Item'}</span>
                  <span className="text-zinc-400 ml-2">×{item.quantity}</span>
                </div>
                <span className="font-mono font-medium">{formatMoney(itemTotal, sym)}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t-2 border-black pt-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-zinc-600">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal, sym)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-zinc-600">
            <span>Discount</span>
            <span>-{formatMoney(discount, sym)}</span>
          </div>
        )}
        {receipt.taxRate > 0 && (
          <div className="flex justify-between text-zinc-600">
            <span>Tax ({receipt.taxRate}%)</span>
            <span>{formatMoney(tax, sym)}</span>
          </div>
        )}
        <div className="border-t border-zinc-200 pt-2 flex justify-between font-bold text-sm text-black">
          <span>Total</span>
          <span className="text-base font-mono">{formatMoney(grandTotal, sym)}</span>
        </div>
      </div>

      {/* Preset Message */}
      {receipt.paymentMessage ? (
        <div className="mt-6 border-t border-zinc-200 pt-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
            {receipt.paymentMessage}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {receipt.paymentMethod} • {receipt.paymentStatus}
          </p>
        </div>
      ) : null}
    </div>
  );
};
