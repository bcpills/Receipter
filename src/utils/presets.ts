import { ReceiptData, PaymentMessagePreset } from '../types';

export const PAYMENT_MESSAGE_PRESETS: PaymentMessagePreset[] = [
  {
    id: 'thank-you',
    label: 'Thank you for your payment',
    getMessage: () => 'Thank you for your payment',
  },
  {
    id: 'amt-paid-full',
    label: '{amt} Paid in Full',
    getMessage: ({ total }) => `${total} Paid in Full`,
  },
  {
    id: 'amt-paid',
    label: '{amt} Paid',
    getMessage: ({ total }) => `${total} Paid`,
  },
  {
    id: 'with-thanks',
    label: 'Payment Received with Thanks',
    getMessage: () => 'Payment Received with Thanks!',
  },
  {
    id: 'method-authorized',
    label: 'Paid via {method} - Authorized',
    getMessage: ({ method }) => `Paid via ${method} • Transaction Authorized`,
  },
  {
    id: 'small-biz',
    label: 'Thank you for supporting our small business',
    getMessage: () => 'Thank you for supporting our small business! We appreciate you.',
  },
  {
    id: 'no-balance',
    label: 'Paid in Full - Balance Due: $0.00',
    getMessage: () => 'Paid in Full — Balance Due: $0.00',
  },
  {
    id: 'sales-policy',
    label: 'Keep receipt for return / exchange (30 days)',
    getMessage: () => 'Thank you! Please retain this receipt for returns or exchanges within 30 days.',
  },
];

export const SAMPLE_LOGOS = [
  {
    name: 'Coffee & Cafe',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%231e293b"/><path d="M28 40h44v24a14 14 0 0 1-14 14H42a14 14 0 0 1-14-14V40Z" fill="%23f8fafc"/><path d="M72 44h8a8 8 0 0 1 8 8v4a8 8 0 0 1-8 8h-8v-20Z" stroke="%23f8fafc" stroke-width="4"/><path d="M38 24c0 4-4 6-4 10m12-10c0 4-4 6-4 10m12-10c0 4-4 6-4 10" stroke="%23fbbf24" stroke-width="3" stroke-linecap="round"/></svg>',
  },
  {
    name: 'Modern Studio',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%230f172a"/><circle cx="50" cy="50" r="30" stroke="%2338bdf8" stroke-width="6"/><path d="M42 38l18 24M60 38L42 62" stroke="%23ffffff" stroke-width="5" stroke-linecap="round"/></svg>',
  },
  {
    name: 'Artisan Boutique',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23431407"/><circle cx="50" cy="50" r="32" stroke="%23d97706" stroke-width="2" stroke-dasharray="4 4"/><path d="M50 28l6 14 15 2-11 10 3 15-13-7-13 7 3-15-11-10 15-2z" fill="%23fef3c7"/></svg>',
  },
  {
    name: 'Retail Goods',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23064e3b"/><path d="M30 42h40l-6 32H36l-6-32Z" fill="%2334d399"/><path d="M42 42V32a8 8 0 1 1 16 0v10" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/></svg>',
  },
];

export const createBlankReceipt = (): ReceiptData => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const dateYear = new Date().getFullYear();
  return {
    id: 'rcpt_' + Date.now(),
    receiptNumber: `REC-${dateYear}-${randomDigits}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

    companyName: '',
    companyTagline: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    logoUrl: undefined,

    customerName: '',
    customerContact: '',

    items: [],

    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0,
    discountAmount: 0,
    discountType: 'fixed',

    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    paymentMessage: '',

    template: 'thermal',
    accentColor: '#0f172a',
    barcodeValue: `${dateYear}${randomDigits}`,
    notes: '',
    createdAt: Date.now(),
  };
};

export const INITIAL_RECEIPT: ReceiptData = createBlankReceipt();
