import { inject, Injectable } from '@angular/core';
import { EventService, eventEnded, seatNumber } from './event';
import { AuthService } from '../../../core/auth/auth.service';

export interface Booking {
  eventId: number;
  selectedSeats: string[];
  isStudent: boolean;
  totalPrice: number;
  discountAmount: number;
  finalTotal: number;
}
export interface SavedTicket extends Booking {
  ticketCode: string;
  bookedAt?: string;
  buyerName?: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

/** Connects Member 2's local demo data to the current Member 1 account. */
@Injectable({ providedIn: 'root' })
export class BookingStorage {
  private readonly auth = inject(AuthService);
  private readonly events = inject(EventService);
  private readonly ledgerKey = 'eventtix.bookings.v2';
  private ledger(): { owner: string; ticket: SavedTicket }[] {
    let value: unknown;
    try { value = JSON.parse(localStorage.getItem(this.ledgerKey) ?? '[]'); }
    catch { throw new Error('Booking storage is unavailable or damaged.'); }
    if (!Array.isArray(value) || value.some(row => !row || typeof row.owner !== 'string' || !this.validTicket(row.ticket)))
      throw new Error('Booking ledger is damaged. Existing data has not been replaced.');
    return value;
  }
  private validTicket(value: unknown): value is SavedTicket {
    const t = value as SavedTicket;
    return this.valid(value) && typeof t.ticketCode === 'string' && typeof t.eventTitle === 'string' &&
      typeof t.eventDate === 'string' && typeof t.eventLocation === 'string';
  }
  private legacyTickets(): SavedTicket[] {
    const result: SavedTicket[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (!key.startsWith('eventtix.ticket-history.v1.')) continue;
      let value: unknown;
      try { value = JSON.parse(localStorage.getItem(key) ?? '[]'); }
      catch { throw new Error('Existing ticket history is damaged. Booking is unavailable until it is repaired.'); }
      if (!Array.isArray(value) || !value.every(t => this.validTicket(t))) throw new Error('Existing ticket history is damaged.');
      result.push(...value);
    }
    return result;
  }
  reservedSeats(eventId: number): string[] {
    return [...new Set([...this.ledger().map(row => row.ticket), ...this.legacyTickets()]
      .filter(t => t.eventId === eventId).flatMap(t => t.selectedSeats))];
  }
  ticketRevenue(eventId: number): number {
    if (!this.auth.hasRole(['admin', 'accounting'])) return 0;
    const tickets = [...this.ledger().map(row => row.ticket), ...this.legacyTickets()];
    return [...new Map(tickets.map(t => [t.ticketCode, t])).values()]
      .filter(t => t.eventId === eventId).reduce((sum, t) => sum + t.finalTotal, 0);
  }
  private key(name: string): string {
    const user = this.auth.user();
    if (!user) throw new Error('Please sign in to manage your bookings.');
    return `eventtix.${name}.v1.${user.id}`;
  }
  private read(name: string): unknown {
    try { const value = localStorage.getItem(this.key(name)); return value ? JSON.parse(value) : null; }
    catch { throw new Error('Booking storage is unavailable or damaged. Please check browser storage.'); }
  }
  private valid(value: unknown): value is Booking {
    const b = value as Booking | null;
    return !!b && Number.isInteger(b.eventId) && Array.isArray(b.selectedSeats) && b.selectedSeats.length > 0 && b.selectedSeats.every(s => typeof s === 'string' && /^[A-E][1-8]$/.test(s)) && new Set(b.selectedSeats).size === b.selectedSeats.length && typeof b.isStudent === 'boolean' && [b.totalPrice, b.discountAmount, b.finalTotal].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0);
  }
  pending(eventId: number): Booking | null {
    if (!this.auth.user()) return null;
    const value = this.read('pending-booking');
    if (value === null) return null;
    if (!this.valid(value)) throw new Error('The saved booking is invalid. Choose your seats again.');
    return value.eventId === eventId ? value : null;
  }
  savePending(booking: Booking): void {
    if (!this.valid(booking)) throw new Error('Choose valid seats before continuing.');
    try { localStorage.setItem(this.key('pending-booking'), JSON.stringify(booking)); }
    catch { throw new Error('Unable to save the booking. Check browser storage and try again.'); }
  }
  tickets(): SavedTicket[] {
    if (!this.auth.user()) return [];
    const value = this.read('ticket-history');
    const current = this.ledger().filter(row => row.owner === this.auth.user()!.id).map(row => row.ticket);
    if (value === null) return current;
    if (!Array.isArray(value) || value.some(t => {
      const ticket = t as Partial<SavedTicket> | null;
      return !this.valid(t) || !ticket || typeof ticket.ticketCode !== 'string' || typeof ticket.eventTitle !== 'string' || typeof ticket.eventDate !== 'string' || typeof ticket.eventLocation !== 'string';
    })) throw new Error('Ticket history is damaged and could not be loaded.');
    return [...value, ...current];
  }
  async confirm(ticket: SavedTicket): Promise<SavedTicket> {
    if (!navigator.locks) throw new Error('Safe booking requires localhost or HTTPS in a browser supporting Web Locks.');
    const owner = this.auth.user()?.id;
    return await navigator.locks.request(this.ledgerKey, () => {
    if (!owner || this.auth.user()?.id !== owner) throw new Error('Please sign in again.');
    const pending = this.pending(ticket.eventId);
    if (!pending || pending.selectedSeats.join(',') !== ticket.selectedSeats.join(',')) throw new Error('This booking changed or was already confirmed. Choose your seats again.');
    this.tickets(); // Check legacy history before accepting a new purchase.
    this.events.assertCurrent();
    const event = this.events.getEventById(ticket.eventId);
    if (!event || this.events.error) throw new Error('Event information is unavailable.');
    if (eventEnded(event)) throw new Error('This event has ended. Booking is closed.');
    if (ticket.selectedSeats.some(seat => seatNumber(seat) > (event.capacity ?? 40))) throw new Error('Selected seat exceeds event capacity.');
    const reserved = this.reservedSeats(ticket.eventId);
    const demoBooked = ['A3', 'A4', 'B2', 'C5', 'D6', 'E1'];
    if (ticket.selectedSeats.some(seat => reserved.includes(seat) || demoBooked.includes(seat)))
      throw new Error('A selected seat has already been booked. Return to seat selection.');
    const total = Math.round(event.price * ticket.selectedSeats.length * 100) / 100;
    const student = pending.isStudent && this.auth.hasRole(['student']);
    const discount = student ? Math.round(total * 10) / 100 : 0;
    if (!this.validTicket(ticket) || ticket.totalPrice !== total || ticket.discountAmount !== discount ||
        ticket.finalTotal !== Math.round((total - discount) * 100) / 100)
      throw new Error('The event price changed. Return to seat selection to review the current total.');
    const ledger = this.ledger();
    if (ledger.some(row => row.ticket.ticketCode === ticket.ticketCode)) throw new Error('Ticket reference already exists.');
    const saved = { ...ticket, isStudent: student, eventTitle: event.title, eventDate: event.date,
      eventLocation: event.location, bookedAt: new Date().toISOString(), buyerName: this.auth.user()!.fullName };
    try { localStorage.setItem(this.ledgerKey, JSON.stringify([...ledger, { owner, ticket: saved }])); }
    catch { throw new Error('Unable to save your ticket. Check browser storage and try again.'); }
    // A successful ticket write must not be reported as a failed booking.
    try { localStorage.removeItem(this.key('pending-booking')); } catch { /* Storage cleanup is best effort. */ }
    return saved;
    });
  }
}
