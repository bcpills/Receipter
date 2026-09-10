export type ReceiptTemplate = 'thermal' | 'modern' | 'minimal' | 'boutique' | 'corporate';

export type PaymentMethod = 
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Apple Pay'
  | 'Google Pay'
  | 'Bank Transfer'
  | 'Venmo'
  | 'Zelle'
  | 'Other';

export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';

export interface ReceiptItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceiptData {
  id: string;
  receiptNumber: string;
  date: string;
  time: string;
  
  // Company Info
  companyName: string;
  companyTagline: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  logoUrl?: string; // base64 or object URL
  
  // Customer Info
  customerName: string;
  customerContact: string;
  
  // Items & Money
  items: ReceiptItem[];
  currency: string;
  currencySymbol: string;
  taxRate: number; // percentage, e.g., 8.5
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  
  // Payment Details
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentMessage: string;
  cashReceived?: number;
  
  // Style & Template
  template: ReceiptTemplate;
  accentColor: string;
  barcodeValue?: string;
  
  // Extra notes
  notes: string;
  createdAt: number;
}

export interface PaymentMessagePreset {
  id: string;
  label: string;
  getMessage: (data: { total: string; method: PaymentMethod; company: string; date: string }) => string;
}
