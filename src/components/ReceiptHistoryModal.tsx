import React, { useState } from 'react';
import { ReceiptData } from '../types';
import { calculateReceiptTotals, formatMoney } from '../utils/receiptCalculations';
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  Copy,
  Download,
  FileText,
  X,
  Calendar,
  DollarSign,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ReceiptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ReceiptData[];
  onLoadReceipt: (receipt: ReceiptData) => void;
  onDuplicateReceipt: (receipt: ReceiptData) => void;
  onDeleteReceipt: (id: string) => void;
  onClearHistory: () => void;
}

export const ReceiptHistoryModal: React.FC<ReceiptHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadReceipt,
  onDuplicateReceipt,
  onDeleteReceipt,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.receiptNumber.toLowerCase().includes(q) ||
      r.companyName.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.paymentMethod.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Receipt History Log</h2>
              <p className="text-xs text-slate-500">
                {history.length} {history.length === 1 ? 'receipt' : 'receipts'} saved in this browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search receipt #, company, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all receipt history?')) {
                  onClearHistory();
                }
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 self-end sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All History
            </button>
          )}
        </div>

        {/* Receipt List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No past receipts found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No receipts match your search terms. Try clearing the filter.'
                  : 'Generated and exported receipts will automatically appear here in your history log.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const totals = calculateReceiptTotals(item);
              const totalDisplay = formatMoney(totals.grandTotal, item.currencySymbol || '$');

              return (
                <div
                  key={item.id}
                  className="p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3.5">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt="Logo"
                        className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                        {item.companyName.charAt(0) || 'R'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 font-mono">
                          {item.receiptNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.paymentStatus}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-mono">
                          {item.template}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {item.companyName || 'Company'}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                        {(item.date || item.time) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {[item.date, item.time].filter(Boolean).join(' ')}
                          </span>
                        )}
                        {item.customerName && (
                          <span>To: {item.customerName}</span>
                        )}
                        <span>via {item.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                        Total
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {totalDisplay}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadReceipt(item);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                      >
                        Load <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onDuplicateReceipt(item);
                          onClose();
                        }}
                        title="Duplicate as new receipt"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteReceipt(item.id)}
                        title="Delete from history"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
