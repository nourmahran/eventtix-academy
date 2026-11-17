import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingStorage, Booking } from './booking-storage';

describe('Booking account integration', () => {
  let auth: AuthService;
  let storage: BookingStorage;
  const booking: Booking = { eventId: 1, selectedSeats: ['A1'], isStudent: true, totalPrice: 350, discountAmount: 35, finalTotal: 315 };
  const ticket = { ...booking, ticketCode: 'TEST-1', eventTitle: 'Demo event', eventDate: '2026-12-15', eventLocation: 'Cairo' };
  const clear = () => {
    for (const role of ['student', 'accounting']) for (const kind of ['pending-booking', 'ticket-history']) localStorage.removeItem(`eventtix.${kind}.v1.demo-${role}`);
  };
  beforeEach(() => { clear(); auth = TestBed.inject(AuthService); storage = TestBed.inject(BookingStorage); auth.startDemo('student'); });
  afterEach(clear);

  it('isolates pending bookings and ticket history between accounts', () => {
    storage.savePending(booking);
    auth.startDemo('accounting');
    expect(storage.pending(1)).toBeNull();
    expect(storage.tickets()).toEqual([]);
    auth.startDemo('student');
    storage.confirm(ticket);
    expect(storage.tickets().length).toBe(1);
    auth.startDemo('accounting');
    expect(storage.tickets()).toEqual([]);
  });

  it('does not confirm a different event or confirm twice', () => {
    storage.savePending(booking);
    expect(storage.pending(2)).toBeNull();
    expect(() => storage.confirm({ ...ticket, eventId: 2 })).toThrowError();
    storage.confirm(ticket);
    expect(storage.pending(1)).toBeNull();
    expect(() => storage.confirm(ticket)).toThrowError();
    expect(storage.tickets().length).toBe(1);
  });

  it('reports damaged history without overwriting it', () => {
    storage.savePending(booking);
    localStorage.setItem('eventtix.ticket-history.v1.demo-student', '{broken');
    expect(() => storage.confirm(ticket)).toThrowError();
    expect(localStorage.getItem('eventtix.ticket-history.v1.demo-student')).toBe('{broken');
  });
});
