import { inject, Injectable } from '@angular/core';
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
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

/** Connects Member 2's local demo data to the current Member 1 account. */
@Injectable({ providedIn: 'root' })
export class BookingStorage {
  private readonly auth = inject(AuthService);
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
    if (value === null) return [];
    if (!Array.isArray(value) || value.some(t => {
      const ticket = t as Partial<SavedTicket> | null;
      return !this.valid(t) || !ticket || typeof ticket.ticketCode !== 'string' || typeof ticket.eventTitle !== 'string' || typeof ticket.eventDate !== 'string' || typeof ticket.eventLocation !== 'string';
    })) throw new Error('Ticket history is damaged and could not be loaded.');
    return value;
  }
  confirm(ticket: SavedTicket): void {
    const pending = this.pending(ticket.eventId);
    if (!pending || pending.selectedSeats.join(',') !== ticket.selectedSeats.join(',')) throw new Error('This booking changed or was already confirmed. Choose your seats again.');
    const tickets = this.tickets();
    try { localStorage.setItem(this.key('ticket-history'), JSON.stringify([...tickets, ticket])); }
    catch { throw new Error('Unable to save your ticket. Check browser storage and try again.'); }
    // A successful ticket write must not be reported as a failed booking.
    try { localStorage.removeItem(this.key('pending-booking')); } catch { /* Storage cleanup is best effort. */ }
  }
}
