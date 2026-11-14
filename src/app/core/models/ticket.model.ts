
export type TicketStatus =
  | 'reserved'
  | 'confirmed'
  | 'cancelled'
  | 'used';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  ticketTierId: string;

  quantity: number;
  unitPrice: number;
  studentDiscountPercent: number;
  totalAmount: number;

  status: TicketStatus;
  paymentStatus: PaymentStatus;

  qrCodeData?: string;
  purchasedAt: string;
}

export interface TicketPurchaseRequest {
  eventId: string;
  userId: string;
  ticketTierId: string;
  quantity: number;
}

export interface TicketInvoice {
  id: string;
  ticketId: string;
  invoiceNumber: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  issuedAt: string;
}

export const TICKET_STATUSES: readonly TicketStatus[] = [
  'reserved',
  'confirmed',
  'cancelled',
  'used'
];

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'pending',
  'paid',
  'failed',
  'refunded'
];
