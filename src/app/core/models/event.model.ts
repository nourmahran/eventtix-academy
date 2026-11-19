
export type EventCategory =
  | 'conference'
  | 'concert'
  | 'workshop';

export type EventStatus =
  | 'draft'
  | 'published'
  | 'cancelled'
  | 'completed';

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  studentDiscountPercent: number;
}

export interface AcademyEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  venue: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  ticketTiers: TicketTier[];
  sponsorIncome: number;
  createdAt: string;
  updatedAt: string;
}

export const EVENT_CATEGORIES: readonly EventCategory[] = [
  'conference',
  'concert',
  'workshop'
];

export const EVENT_STATUSES: readonly EventStatus[] = [
  'draft',
  'published',
  'cancelled',
  'completed'
];
