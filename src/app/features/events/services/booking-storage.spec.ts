import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingStorage, Booking } from './booking-storage';

describe('Booking account integration', () => {
  let auth: AuthService;
  let storage: BookingStorage;
  const booking: Booking = { eventId: 1, selectedSeats: ['A1'], isStudent: true, totalPrice: 350, discountAmount: 35, finalTotal: 315 };
  const ticket = { ...booking, ticketCode: 'TEST-1', eventTitle: 'Demo event', eventDate: '2026-12-15', eventLocation: 'Cairo' };
  const clear = () => {
    localStorage.removeItem('eventtix.bookings.v2');
    localStorage.removeItem('eventtix.events.v1');
    for (const role of ['student', 'accounting']) for (const kind of ['pending-booking', 'ticket-history']) localStorage.removeItem(`eventtix.${kind}.v1.demo-${role}`);
  };
  beforeEach(() => { clear(); auth = TestBed.inject(AuthService); storage = TestBed.inject(BookingStorage); auth.startDemo('student'); });
  afterEach(clear);

  it('isolates pending bookings and ticket history between accounts', async () => {
    storage.savePending(booking);
    auth.startDemo('accounting');
    expect(storage.pending(1)).toBeNull();
    expect(storage.tickets()).toEqual([]);
    auth.startDemo('student');
    await storage.confirm(ticket);
    expect(storage.tickets().length).toBe(1);
    auth.startDemo('accounting');
    expect(storage.tickets()).toEqual([]);
  });

  it('does not confirm a different event or confirm twice', async () => {
    storage.savePending(booking);
    expect(storage.pending(2)).toBeNull();
    await expectAsync(storage.confirm({ ...ticket, eventId: 2 })).toBeRejected();
    await storage.confirm(ticket);
    expect(storage.pending(1)).toBeNull();
    await expectAsync(storage.confirm(ticket)).toBeRejected();
    expect(storage.tickets().length).toBe(1);
  });

  it('reports damaged history without overwriting it', async () => {
    storage.savePending(booking);
    localStorage.setItem('eventtix.ticket-history.v1.demo-student', '{broken');
    await expectAsync(storage.confirm(ticket)).toBeRejected();
    expect(localStorage.getItem('eventtix.ticket-history.v1.demo-student')).toBe('{broken');
  });
});
