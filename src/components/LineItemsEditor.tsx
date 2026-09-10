import React from 'react';
import { ReceiptItem, ReceiptData } from '../types';
import { formatMoney } from '../utils/receiptCalculations';
import { Plus, Trash2, ShoppingBag, Percent } from 'lucide-react';

interface LineItemsEditorProps {
  items: ReceiptItem[];
  currencySymbol: string;
  taxRate: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  onChangeItems: (items: ReceiptItem[]) => void;
  onChangeTaxRate: (rate: number) => void;
  onChangeDiscount: (amount: number, type: 'percentage' | 'fixed') => void;
}

export const LineItemsEditor: React.FC<LineItemsEditorProps> = ({
  items,
  currencySymbol,
  taxRate,
  discountAmount,
  discountType,
  onChangeItems,
  onChangeTaxRate,
  onChangeDiscount,
}) => {
  const handleAddItem = () => {
    const newItem: ReceiptItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      name: '',
      quantity: 1,
      unitPrice: 0,
    };
    onChangeItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof ReceiptItem, value: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChangeItems(updated);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      // Keep at least one empty item
      onChangeItems([{ id: 'item_' + Date.now(), name: '', quantity: 1, unitPrice: 0 }]);
      return;
    }
    onChangeItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
          Receipt Items ({items.length})
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-2.5">
        {items.map((item, index) => {
          const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
          return (
            <div
              key={item.id}
              className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative group hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 w-4 text-center">
                  {index + 1}
                </span>
                <input
                  type="text"
                  placeholder="Item description or product name"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                  className="flex-1 text-xs font-medium text-slate-800 px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  title="Remove item"
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3 pl-6">
                {/* Quantity */}
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'quantity', Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Unit Price */}
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-full text-xs font-medium text-slate-800 px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Line Total */}
                <div className="w-24 text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Total
                  </span>
                  <span className="text-xs font-bold text-slate-800 py-1.5 block">
                    {formatMoney(itemTotal, currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tax and Discount settings */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
            <span>Tax Rate (%)</span>
            <span className="text-slate-400 font-normal">e.g. 8.5%</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => onChangeTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
            <span>Discount</span>
            <div className="flex gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => onChangeDiscount(discountAmount, 'fixed')}
                className={`px-1.5 py-0.5 rounded ${
                  discountType === 'fixed'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currencySymbol}
              </button>
              <button
                type="button"
                onClick={() => onChangeDiscount(discountAmount, 'percentage')}
                className={`px-1.5 py-0.5 rounded ${
                  discountType === 'percentage'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                %
              </button>
            </div>
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={discountAmount}
            onChange={(e) =>
              onChangeDiscount(Math.max(0, parseFloat(e.target.value) || 0), discountType)
            }
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
