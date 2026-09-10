import React from 'react';
import { PAYMENT_MESSAGE_PRESETS } from '../utils/presets';
import { ReceiptData } from '../types';
import { calculateReceiptTotals, formatMoney } from '../utils/receiptCalculations';
import { MessageSquare, Sparkles, Check } from 'lucide-react';

interface PaymentMessagePresetsProps {
  receipt: ReceiptData;
  onMessageChange: (message: string) => void;
}

export const PaymentMessagePresets: React.FC<PaymentMessagePresetsProps> = ({
  receipt,
  onMessageChange,
}) => {
  const totals = calculateReceiptTotals(receipt);
  const formattedTotal = formatMoney(totals.grandTotal, receipt.currencySymbol || '$');

  const handleApplyPreset = (presetId: string) => {
    const preset = PAYMENT_MESSAGE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const message = preset.getMessage({
      total: formattedTotal,
      method: receipt.paymentMethod,
      company: receipt.companyName || 'our store',
      date: receipt.date,
    });

    onMessageChange(message);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          Payment Message & Presets
        </label>
        <span className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Click preset to apply
        </span>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-1.5">
        {PAYMENT_MESSAGE_PRESETS.map((preset) => {
          // Compute what this preset will generate
          const previewText = preset.getMessage({
            total: formattedTotal,
            method: receipt.paymentMethod,
            company: receipt.companyName || 'our store',
            date: receipt.date,
          });

          const isCurrent = receipt.paymentMessage.trim() === previewText.trim();

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              {isCurrent && <Check className="w-3 h-3 text-white" />}
              {preset.label.replace('{amt}', formattedTotal).replace('{method}', receipt.paymentMethod)}
            </button>
          );
        })}
      </div>

      {/* Editable Current Message Input */}
      <div>
        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
          <span>Message on receipt:</span>
          <span>Editable</span>
        </div>
        <input
          type="text"
          value={receipt.paymentMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="e.g. Thank you for your payment"
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
        />
      </div>
    </div>
  );
};
