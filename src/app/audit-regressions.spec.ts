import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { EventService } from './features/events/services/event';
import { BookingStorage } from './features/events/services/booking-storage';
import { Payroll } from './features/finance/payroll/payroll';

describe('Comprehensive audit regressions', () => {
  beforeEach(() => {
    for (const key of ['eventtix.events.v1','eventtix.bookings.v2','eventtix.pending-booking.v1.demo-student','eventtix.payroll.v1']) localStorage.removeItem(key);
    TestBed.configureTestingModule({providers:[provideRouter(routes)]});
  });
  afterEach(() => {
    for (const key of ['eventtix.events.v1','eventtix.bookings.v2','eventtix.pending-booking.v1.demo-student','eventtix.payroll.v1']) localStorage.removeItem(key);
  });
  it('rejects booking an expired event', async () => {
    TestBed.inject(AuthService).startDemo('student');
    const events=TestBed.inject(EventService);
    events.updateEvent({...events.getEvents()[0],date:'2000-01-01'});
    const store=TestBed.inject(BookingStorage);
    const booking={eventId:1,selectedSeats:['A1'],isStudent:false,totalPrice:350,discountAmount:0,finalTotal:350};
    store.savePending(booking);
    await expectAsync(store.confirm({...booking,ticketCode:'ET-expired-audit',eventTitle:'Expired',eventDate:'2000-01-01',eventLocation:'Cairo'})).toBeRejectedWithError(/ended|expired/i);
    expect(store.tickets().length).toBe(0);
  });
  it('updates event details on same-component parameter navigation', async () => {
    const harness=await RouterTestingHarness.create();
    await harness.navigateByUrl('/events/1');
    await harness.navigateByUrl('/events/2');
    expect(harness.routeNativeElement?.textContent).toContain('Tech Innovation Summit');
    expect(harness.routeNativeElement?.textContent).not.toContain('Cairo Music Festival');
  });
  it('exports monetary salary results rounded to cents', () => {
    const payroll=new Payroll();
    const staff={id:'test',name:'Test',position:'Tutor',basicSalary:0.1,allowances:0.2,deductions:0,eventAllowances:[]};
    expect(payroll.getNetSalary(staff)).toBe(0.3);
  });
});
