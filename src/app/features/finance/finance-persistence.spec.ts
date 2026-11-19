import { TestBed } from '@angular/core/testing';
import { StudentFees } from './student-fees/student-fees';
import { Payroll } from './payroll/payroll';
import { EventFinance } from './event-finance/event-finance';
import { AuthService } from '../../core/auth/auth.service';
describe('Finance persistence', () => {
  const clear = () => { for (const name of ['fees','payroll','event-finance','events']) localStorage.removeItem(`eventtix.${name}.v1`); };
  beforeEach(() => { clear(); spyOn(window, 'alert'); }); afterEach(clear);
  it('persists invoices, payments and student details without double payment', () => {
    const fees = TestBed.runInInjectionContext(() => new StudentFees()); fees.invoiceStudentId = '2024001'; fees.invoiceDescription = 'Tuition'; fees.invoiceAmount = 1000; fees.invoiceDueDate = '2026-12-01'; fees.createInvoice();
    const next = TestBed.runInInjectionContext(() => new StudentFees()); expect(next.invoices.length).toBe(1);
    next.recordPayment(next.invoices[0].id); next.recordPayment(next.invoices[0].id);
    const reloaded = TestBed.runInInjectionContext(() => new StudentFees()); reloaded.viewStudent('2024001');
    expect(reloaded.selectedStudent?.paidAmount).toBe(11000); expect(reloaded.studentPayments.length).toBe(1); expect(reloaded.studentInvoices[0].status).toBe('Paid');
  });
  it('rolls back fee mutations if persistence fails', () => {
    const fees = TestBed.runInInjectionContext(() => new StudentFees()); fees.invoiceStudentId = '2024001'; fees.invoiceDescription = 'Tuition'; fees.invoiceAmount = 1000; fees.invoiceDueDate = '2026-12-01';
    spyOn(Storage.prototype, 'setItem').and.throwError('Quota'); fees.createInvoice();
    expect(fees.invoices.length).toBe(0); expect(fees.error).toBeTruthy();
  });
  it('persists staff and monthly event allowances', () => {
    const payroll = new Payroll(); payroll.formName = 'Test Staff'; payroll.formPosition = 'Guide'; payroll.formSalary = 5000; payroll.saveStaff();
    const next = new Payroll(); const staff = next.staff.find(s => s.name === 'Test Staff')!;
    next.selectedStaffId = staff.id; next.selectedMonth = '2026-12'; next.eventName = 'Conference'; next.eventAmount = 300; next.addEventAllowance();
    const reloaded = new Payroll(); reloaded.selectedMonth = '2026-12'; expect(reloaded.getNetSalary(reloaded.staff.find(s => s.id === staff.id)!)).toBe(5300);
    reloaded.selectedMonth = '2026-11'; expect(reloaded.getNetSalary(reloaded.staff.find(s => s.id === staff.id)!)).toBe(5000);
  });
  it('persists event expenses without replacing original budgets', () => {
    TestBed.inject(AuthService).startDemo('accounting');
    const finance = TestBed.runInInjectionContext(() => new EventFinance()); finance.selectedEventId = 'event-1'; finance.transactionDescription = 'Venue'; finance.transactionAmount = 500; finance.addTransaction();
    const next = TestBed.runInInjectionContext(() => new EventFinance()); expect(next.events.find(e => e.id === 'event-1')?.expenses[0].amount).toBe(500); expect(next.events.some(e => e.id === 'EV001')).toBeTrue();
  });
});
