import React, { useState } from 'react';
import { ReceiptData, PaymentMethod, PaymentStatus, ReceiptTemplate } from '../types';
import { LogoUploader } from './LogoUploader';
import { TemplateSelector } from './TemplateSelector';
import { PaymentMessagePresets } from './PaymentMessagePresets';
import { LineItemsEditor } from './LineItemsEditor';
import { calculateReceiptTotals, formatMoney } from '../utils/receiptCalculations';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Receipt,
  CreditCard,
  RefreshCw,
  DollarSign,
  Percent,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Tag,
  ShoppingBag,
  Info,
  Layers,
  Clock,
} from 'lucide-react';

interface ReceiptFormProps {
  receipt: ReceiptData;
  onChangeReceipt: (receipt: ReceiptData) => void;
  onGenerateNewNumber: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Apple Pay',
  'Google Pay',
  'Bank Transfer',
  'Venmo',
  'Zelle',
  'Other',
];

const CURRENCIES = [
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar (C$)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen (¥)' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
];

const TAX_PRESETS = [0, 5, 7.5, 8.5, 10];

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  receipt,
  onChangeReceipt,
  onGenerateNewNumber,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateField = <K extends keyof ReceiptData>(field: K, value: ReceiptData[K]) => {
    onChangeReceipt({ ...receipt, [field]: value });
  };

  const totals = calculateReceiptTotals(receipt);
  const sym = receipt.currencySymbol || '$';

  // Check if user has populated advanced properties so we can show a badge
  const hasAdvancedDetails = Boolean(
    receipt.items.length > 1 ||
    receipt.companyAddress?.trim() ||
    receipt.companyPhone?.trim() ||
    receipt.companyTagline?.trim() ||
    receipt.companyEmail?.trim() ||
    receipt.companyWebsite?.trim() ||
    receipt.customerName?.trim() ||
    receipt.customerContact?.trim() ||
    receipt.notes?.trim() ||
    receipt.discountAmount > 0 ||
    receipt.paymentMethod !== 'Credit Card' ||
    receipt.date?.trim() ||
    receipt.time?.trim()
  );

  // Handle changing total in simple mode
  const handleSimpleTotalChange = (newTotalAmount: number) => {
    const safeTotal = Math.max(0, newTotalAmount);
    const taxRate = receipt.taxRate || 0;

    // Subtotal = Total / (1 + taxRate / 100)
    const targetSubtotal = taxRate > 0
      ? Math.round((safeTotal / (1 + taxRate / 100)) * 100) / 100
      : safeTotal;

    const currentItem = receipt.items[0];
    const itemName = currentItem?.name || '';

    onChangeReceipt({
      ...receipt,
      discountAmount: 0,
      items: [
        {
          id: currentItem?.id || 'item_1',
          name: itemName,
          quantity: 1,
          unitPrice: targetSubtotal,
        },
      ],
    });
  };

  // Handle updating item description in simple mode
  const handleSimpleItemNameChange = (name: string) => {
    const currentItem = receipt.items[0] || {
      id: 'item_1',
      quantity: 1,
      unitPrice: 0,
    };
    const updatedItems = [
      {
        ...currentItem,
        name,
      },
      ...receipt.items.slice(1),
    ];
    onChangeReceipt({
      ...receipt,
      items: updatedItems,
    });
  };

  // Switch multiple items to a single total item
  const handleSimplifyToSingleItem = () => {
    const taxRate = receipt.taxRate || 0;
    const targetSubtotal = taxRate > 0
      ? Math.round((totals.grandTotal / (1 + taxRate / 100)) * 100) / 100
      : totals.grandTotal;

    onChangeReceipt({
      ...receipt,
      discountAmount: 0,
      items: [
        {
          id: 'item_1',
          name: receipt.items[0]?.name || '',
          quantity: 1,
          unitPrice: targetSubtotal,
        },
      ],
    });
  };

  // Get current simple item name
  const simpleItemName = receipt.items[0]?.name || '';

  return (
    <div className="space-y-5">
      {/* 1. Template Selection */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <TemplateSelector
          currentTemplate={receipt.template}
          onSelectTemplate={(template: ReceiptTemplate) => updateField('template', template)}
        />
      </section>

      {/* 2. Company Name & Logo */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Company & Logo
          </h2>
        </div>

        {/* Company Name Input */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Company / Merchant Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={receipt.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            placeholder="e.g. Apex Artisan Coffee & Goods"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Logo Uploader (Phone library / photo support & presets) */}
        <LogoUploader
          logoUrl={receipt.logoUrl}
          onLogoChange={(url) => updateField('logoUrl', url)}
        />
      </section>

      {/* 3. Tax & Total (Clean Simple Default) */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Tax & Total
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
            Total: {formatMoney(totals.grandTotal, sym)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Receipt Total ({sym}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 select-none">
                {sym}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={totals.grandTotal > 0 ? Number(totals.grandTotal.toFixed(2)) : ''}
                onChange={(e) => handleSimpleTotalChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Enter total paid amount. Tax is computed automatically.
            </p>
          </div>

          {/* Tax Rate Input + Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tax Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={receipt.taxRate}
                onChange={(e) => updateField('taxRate', Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.0"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                %
              </span>
            </div>

            {/* Quick tax preset chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-500 font-medium">Presets:</span>
              {TAX_PRESETS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => updateField('taxRate', rate)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                    receipt.taxRate === rate
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {rate === 0 ? '0% (No Tax)' : `${rate}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Description / Item Name in simple mode */}
        <div>
          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
            Item / Service Description (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={simpleItemName}
              onChange={(e) => handleSimpleItemNameChange(e.target.value)}
              placeholder="e.g. General Merchandise / Order Payment"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Live Calculation Summary Breakdown */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span>Subtotal: <strong className="text-slate-900">{formatMoney(totals.subtotal, sym)}</strong></span>
            <span className="text-slate-300">•</span>
            <span>
              Tax ({receipt.taxRate}%): <strong className="text-slate-900">{formatMoney(totals.tax, sym)}</strong>
            </span>
          </div>
          <div className="font-semibold text-slate-900">
            Total: <span className="text-emerald-700 font-bold">{formatMoney(totals.grandTotal, sym)}</span>
          </div>
        </div>

        {/* Multi-item notification if receipt has multiple items */}
        {receipt.items.length > 1 && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between text-xs text-indigo-900 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Currently itemized with <strong>{receipt.items.length} items</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimplifyToSingleItem}
                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline"
              >
                Set as single total
              </button>
              <span className="text-indigo-300">•</span>
              <button
                type="button"
                onClick={() => setShowAdvanced(true)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                Edit in Advanced
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. Payment Message Presets (Core simple requirement) */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <PaymentMessagePresets
          receipt={receipt}
          onMessageChange={(msg) => updateField('paymentMessage', msg)}
        />
      </section>

      {/* 5. "Advanced Options" Collapsible Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`w-full py-3 px-4 rounded-2xl border transition-all flex items-center justify-between group shadow-2xs ${
            showAdvanced
              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
              : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl transition-colors ${
                showAdvanced
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {showAdvanced ? 'Hide Advanced Options' : 'Advanced Options'}
                </span>
                {hasAdvancedDetails && !showAdvanced && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200/60">
                    Configured
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Line items, date, receipt #, customer info, address, payment method
              </p>
            </div>
          </div>

          <div className="text-slate-400 group-hover:text-slate-600 pl-2">
            {showAdvanced ? (
              <ChevronUp className="w-5 h-5 text-indigo-600 transition-transform" />
            ) : (
              <ChevronDown className="w-5 h-5 transition-transform" />
            )}
          </div>
        </button>

        {/* Collapsible Advanced Options Panel */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="space-y-5 overflow-hidden pt-4"
            >
              {/* Advanced Section A: Receipt Details (Number, Date, Currency, Customer) */}
              <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Receipt Details & Customer
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Receipt Number */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Receipt #</span>
                      <button
                        type="button"
                        onClick={onGenerateNewNumber}
                        title="Generate new random receipt number"
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 text-[10px] font-medium"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Auto
                      </button>
                    </label>
                    <input
                      type="text"
                      value={receipt.receiptNumber}
                      onChange={(e) => updateField('receiptNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Date (Optional) */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Date (Optional)</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateField('date', new Date().toISOString().split('T')[0])}
                          className="text-indigo-600 hover:text-indigo-800 text-[10px] font-medium"
                          title="Set to today"
                        >
                          Today
                        </button>
                        {receipt.date && (
                          <button
                            type="button"
                            onClick={() => updateField('date', '')}
                            className="text-slate-400 hover:text-red-600 text-[10px]"
                            title="Clear date"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </label>
                    <input
                      type="date"
                      value={receipt.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Time Stamp (Optional - only if asked) */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Time Stamp (Optional)</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              'time',
                              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-800 text-[10px] font-medium flex items-center gap-0.5"
                          title="Stamp current time"
                        >
                          <Clock className="w-2.5 h-2.5" /> Stamp
                        </button>
                        {receipt.time && (
                          <button
                            type="button"
                            onClick={() => updateField('time', '')}
                            className="text-slate-400 hover:text-red-600 text-[10px]"
                            title="Clear time stamp"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </label>
                    <input
                      type="text"
                      value={receipt.time}
                      onChange={(e) => updateField('time', e.target.value)}
                      placeholder="Blank by default"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Currency
                    </label>
                    <select
                      value={receipt.currencySymbol}
                      onChange={(e) => {
                        const selected = CURRENCIES.find((c) => c.symbol === e.target.value);
                        if (selected) {
                          onChangeReceipt({
                            ...receipt,
                            currencySymbol: selected.symbol,
                            currency: selected.code,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.symbol}>
                          {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Customer Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={receipt.customerName}
                      onChange={(e) => updateField('customerName', e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Customer Email or Phone
                    </label>
                    <input
                      type="text"
                      value={receipt.customerContact}
                      onChange={(e) => updateField('customerContact', e.target.value)}
                      placeholder="e.g. alex.m@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </section>

              {/* Advanced Section B: Extended Company Details */}
              <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Additional Company Info
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Tagline / Business Category
                    </label>
                    <input
                      type="text"
                      value={receipt.companyTagline}
                      onChange={(e) => updateField('companyTagline', e.target.value)}
                      placeholder="e.g. Handcrafted Roasts & Provisions"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={receipt.companyPhone}
                      onChange={(e) => updateField('companyPhone', e.target.value)}
                      placeholder="e.g. (415) 890-2341"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Physical Address / Location
                    </label>
                    <input
                      type="text"
                      value={receipt.companyAddress}
                      onChange={(e) => updateField('companyAddress', e.target.value)}
                      placeholder="e.g. 428 Market Street, Suite 100, San Francisco, CA"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={receipt.companyEmail}
                      onChange={(e) => updateField('companyEmail', e.target.value)}
                      placeholder="e.g. receipts@store.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Website / Social Handle
                    </label>
                    <input
                      type="text"
                      value={receipt.companyWebsite}
                      onChange={(e) => updateField('companyWebsite', e.target.value)}
                      placeholder="e.g. www.store.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </section>

              {/* Advanced Section C: Itemized Line Items & Discounts */}
              <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <LineItemsEditor
                  items={receipt.items}
                  currencySymbol={receipt.currencySymbol}
                  taxRate={receipt.taxRate}
                  discountAmount={receipt.discountAmount}
                  discountType={receipt.discountType}
                  onChangeItems={(items) => updateField('items', items)}
                  onChangeTaxRate={(rate) => updateField('taxRate', rate)}
                  onChangeDiscount={(amount, type) =>
                    onChangeReceipt({ ...receipt, discountAmount: amount, discountType: type })
                  }
                />
              </section>

              {/* Advanced Section D: Payment Method & Policy Notes */}
              <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Payment Method & Policy
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Payment Method
                    </label>
                    <select
                      value={receipt.paymentMethod}
                      onChange={(e) => updateField('paymentMethod', e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {PAYMENT_METHODS.map((pm) => (
                        <option key={pm} value={pm}>
                          {pm}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Payment Status
                    </label>
                    <select
                      value={receipt.paymentStatus}
                      onChange={(e) => updateField('paymentStatus', e.target.value as PaymentStatus)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  {receipt.paymentMethod === 'Cash' && (
                    <div className="sm:col-span-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                      <label className="text-[11px] font-semibold text-amber-900 block mb-1">
                        Cash Tendered by Customer ({receipt.currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={receipt.cashReceived || ''}
                        onChange={(e) => updateField('cashReceived', parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 50.00"
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <p className="text-[10px] text-amber-700 mt-1">
                        Change due will be automatically calculated on the receipt slip.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Notes or Return Policy */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Footer Notes or Return Policy
                  </label>
                  <input
                    type="text"
                    value={receipt.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="e.g. Items can be returned within 30 days with receipt"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

