import { ReceiptData } from '../types';

export function calculateSubtotal(items: ReceiptData['items']): number {
  return items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
}

export function calculateDiscount(subtotal: number, discountAmount: number, discountType: 'percentage' | 'fixed'): number {
  if (!discountAmount || discountAmount <= 0) return 0;
  if (discountType === 'percentage') {
    return Math.min(subtotal, (subtotal * discountAmount) / 100);
  }
  return Math.min(subtotal, discountAmount);
}

export function calculateTax(taxableAmount: number, taxRate: number): number {
  if (!taxRate || taxRate <= 0) return 0;
  return (taxableAmount * taxRate) / 100;
}

export function calculateReceiptTotals(receipt: ReceiptData) {
  const subtotal = calculateSubtotal(receipt.items);
  const discount = calculateDiscount(subtotal, receipt.discountAmount, receipt.discountType);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = calculateTax(taxableAmount, receipt.taxRate);
  const grandTotal = taxableAmount + tax;
  
  const cashReceived = Number(receipt.cashReceived) || 0;
  const changeDue = receipt.paymentMethod === 'Cash' && cashReceived > grandTotal 
    ? cashReceived - grandTotal 
    : 0;

  return {
    subtotal,
    discount,
    taxableAmount,
    tax,
    grandTotal,
    changeDue,
  };
}

export function formatMoney(amount: number, currencySymbol = '$'): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol}${formatted}`;
}
