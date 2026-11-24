import { TestBed } from '@angular/core/testing';
import { AuthService } from './core/auth/auth.service';
import { EventService } from './features/events/services/event';
import { BookingStorage, Booking, SavedTicket } from './features/events/services/booking-storage';
import { Payroll } from './features/finance/payroll/payroll';
import { HelpWidget } from './shared/help/help-widget';
import { ChatService } from './shared/help/chat.service';

describe('Audit edge cases', () => {
  const clear=()=>{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i)!;if(k.startsWith('eventtix.'))localStorage.removeItem(k);}};
  beforeEach(()=>{clear();spyOn(window,'alert');});afterEach(clear);
  const b:Booking={eventId:1,selectedSeats:['A1'],isStudent:false,totalPrice:350,discountAmount:0,finalTotal:350};
  const t:SavedTicket={...b,ticketCode:'ET-edge',eventTitle:'Event',eventDate:'2026-12-15',eventLocation:'Cairo'};
  it('rejects empty, duplicate, nonexistent seats and negative totals',()=>{
    TestBed.inject(AuthService).startDemo('student');const store=TestBed.inject(BookingStorage);
    for(const selectedSeats of [[],['A1','A1'],['Z9'],['A0']])expect(()=>store.savePending({...b,selectedSeats})).toThrow();
    expect(()=>store.savePending({...b,finalTotal:-1})).toThrow();
  });
  it('rejects seats beyond configured capacity',async()=>{
    TestBed.inject(AuthService).startDemo('student');const events=TestBed.inject(EventService);events.updateEvent({...events.getEvents()[0],capacity:1});
    const store=TestBed.inject(BookingStorage);store.savePending({...b,selectedSeats:['A2']});
    await expectAsync(store.confirm({...t,selectedSeats:['A2']})).toBeRejectedWithError(/capacity/);
  });
  it('rejects a second booking when the only available seat is sold',async()=>{
    const auth=TestBed.inject(AuthService);auth.startDemo('student');const events=TestBed.inject(EventService);events.updateEvent({...events.getEvents()[0],capacity:1});
    const store=TestBed.inject(BookingStorage);store.savePending(b);await store.confirm(t);auth.startDemo('accounting');store.savePending(b);
    await expectAsync(store.confirm({...t,ticketCode:'ET-second'})).toBeRejectedWithError(/already been booked/);
  });
  it('does not allow accounting to claim student discount',async()=>{
    TestBed.inject(AuthService).startDemo('accounting');const store=TestBed.inject(BookingStorage);store.savePending({...b,isStudent:true});
    await expectAsync(store.confirm({...t,isStudent:true,discountAmount:35,finalTotal:315})).toBeRejectedWithError(/price changed/);
  });
  it('retains pending checkout through service recreation and rejects repeat confirmation',async()=>{
    TestBed.inject(AuthService).startDemo('student');let store=TestBed.inject(BookingStorage);store.savePending(b);
    store=TestBed.runInInjectionContext(()=>new BookingStorage());expect(store.pending(1)).toEqual(b);await store.confirm(t);
    await expectAsync(store.confirm({...t,ticketCode:'ET-repeat'})).toBeRejected();expect(store.tickets().length).toBe(1);
  });
  it('rejects invalid dates, prices, times and capacities without overwriting catalogue',()=>{
    const events=TestBed.inject(EventService);const original=events.getEvents()[0];
    for(const fields of [{date:'2026-02-30'},{price:-1},{price:NaN},{time:'25:00'},{capacity:0},{capacity:41},{capacity:1.5}])expect(()=>events.updateEvent({...original,...fields})).toThrow();
    expect(events.getEventById(1)).toEqual(original);
  });
  it('handles zero salary and cumulative monthly allowances with cent precision',()=>{
    const payroll=new Payroll();payroll.selectedMonth='2026-11';
    const staff={id:'zero',name:'Zero',position:'Tutor',basicSalary:0,allowances:0,deductions:0,eventAllowances:[{eventName:'One',amount:0.1,month:'2026-11'},{eventName:'Two',amount:0.2,month:'2026-11'},{eventName:'Next',amount:500,month:'2026-12'}]};
    expect(payroll.getNetSalary(staff)).toBe(0.3);payroll.selectedMonth='2027-01';expect(payroll.getNetSalary(staff)).toBe(0);
    const before=payroll.staff.length;payroll.formName='Negative';payroll.formPosition='Tutor';payroll.formSalary=-1;payroll.saveStaff();expect(payroll.staff.length).toBe(before);
  });
  it('rejects empty and oversized chatbot input without provider calls',async()=>{
    const chat=jasmine.createSpyObj<ChatService>('ChatService',['send']);TestBed.configureTestingModule({providers:[{provide:ChatService,useValue:chat}]});
    const widget=TestBed.createComponent(HelpWidget).componentInstance;await widget.send('   ');await widget.send('x'.repeat(2001));expect(chat.send).not.toHaveBeenCalled();
  });
});
