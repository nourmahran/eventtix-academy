import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { BookingStorage, Booking, SavedTicket } from './booking-storage';
describe('Seat reservations', () => {
  let auth: AuthService; let storage: BookingStorage;
  const booking: Booking = { eventId: 1, selectedSeats: ['A1'], isStudent: false, totalPrice: 350, discountAmount: 0, finalTotal: 350 };
  const ticket: SavedTicket = { ...booking, ticketCode: 'ET-race', eventTitle: 'Concert', eventDate: '2026-12-15', eventLocation: 'Cairo' };
  const clear = () => {
    localStorage.removeItem('eventtix.bookings.v2'); localStorage.removeItem('eventtix.events.v1');
    for (const role of ['student','admin','accounting']) for (const kind of ['pending-booking','ticket-history']) localStorage.removeItem(`eventtix.${kind}.v1.demo-${role}`);
  };
  beforeEach(() => { clear(); auth = TestBed.inject(AuthService); storage = TestBed.inject(BookingStorage); auth.startDemo('student'); });
  afterEach(clear);
  it('reserves seats across accounts and reloads without exposing another account’s ticket', async () => {
    storage.savePending(booking); await storage.confirm(ticket);
    auth.startDemo('admin'); expect(storage.tickets()).toEqual([]); expect(storage.reservedSeats(1)).toContain('A1');
    storage.savePending(booking); await expectAsync(storage.confirm({ ...ticket, ticketCode: 'ET-other' })).toBeRejectedWithError(/already been booked/);
    expect(storage.ticketRevenue(1)).toBe(350);
    TestBed.resetTestingModule(); expect(TestBed.inject(BookingStorage).reservedSeats(1)).toContain('A1');
  });
  it('allows only one of two concurrent confirmations', async () => {
    storage.savePending(booking);
    const results = await Promise.allSettled([storage.confirm(ticket), storage.confirm({ ...ticket, ticketCode: 'ET-second' })]);
    expect(results.filter(r => r.status === 'fulfilled').length).toBe(1);
    expect(storage.tickets().length).toBe(1);
  });
  it('does not reserve seats or consume a pending booking when saving fails', async () => {
    storage.savePending(booking);
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');
    await expectAsync(storage.confirm(ticket)).toBeRejectedWithError(/Unable to save/);
    expect(storage.reservedSeats(1)).toEqual([]); expect(storage.pending(1)).not.toBeNull();
  });
  it('preserves legacy tickets and prevents resale of their seats', () => {
    localStorage.setItem('eventtix.ticket-history.v1.demo-student', JSON.stringify([ticket]));
    expect(storage.tickets()).toEqual([ticket]); expect(storage.reservedSeats(1)).toEqual(['A1']);
  });
});
