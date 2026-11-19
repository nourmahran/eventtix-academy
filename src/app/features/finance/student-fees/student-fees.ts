import { LocalRecord, money, text } from '../../../shared/services/local-record';

import { FeeLinks } from '../fee-links';
import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface StudentFee {
  id: string;
  name: string;
  totalFees: number;
  paidAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
}

interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid';
}

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-student-fees',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './student-fees.html',
  styleUrl: './student-fees.scss',
})
export class StudentFees {

  private readonly feeLinks = inject(FeeLinks);
  accountUsername = '';
  accountLinkMessage = '';
  linkAccount(): void {
    if (!this.selectedStudentId) return;
    try {
      // Ensure opening balances exist before creating a separate account link.
      if (!this.persist()) return;
      this.feeLinks.link(this.selectedStudentId, this.accountUsername);
      this.accountLinkMessage = this.accountUsername.trim() ? 'Student account linked.' : 'Account link removed.';
      this.accountUsername = '';
    } catch (error) { this.error = error instanceof Error ? error.message : 'Unable to link account.'; }
  }

  // Student records
  students: StudentFee[] = [
    {
      id: '2024001',
      name: 'Ahmed Ali',
      totalFees: 15000,
      paidAmount: 10000,
      status: 'Partial'
    },
    {
      id: '2024002',
      name: 'Sara Mohamed',
      totalFees: 12000,
      paidAmount: 12000,
      status: 'Paid'
    },
    {
      id: '2024003',
      name: 'Omar Hassan',
      totalFees: 15000,
      paidAmount: 5000,
      status: 'Partial'
    },
    {
      id: '2024004',
      name: 'Mariam Adel',
      totalFees: 14000,
      paidAmount: 14000,
      status: 'Paid'
    }
  ];

  // Search and filter
  searchTerm: string = '';
  selectedStatus: string = '';

  // Invoice records
  invoices: Invoice[] = [];

  // Payment history records
  payments: Payment[] = [];

  // Invoice form
  showInvoiceForm: boolean = false;
  invoiceStudentId: string = '';
  invoiceDescription: string = '';
  invoiceAmount: number = 0;
  invoiceDueDate: string = '';

  private readonly record = new LocalRecord('eventtix.fees.v1',
    { students: this.students, invoices: this.invoices, payments: this.payments }, value =>
      value && Array.isArray(value.students) && value.students.every((s: any) => s && text(s.id) && text(s.name) && money(s.totalFees) && money(s.paidAmount) && s.paidAmount <= s.totalFees && ['Paid','Partial','Unpaid'].includes(s.status)) &&
      Array.isArray(value.invoices) && value.invoices.every((i: any) => i && text(i.id) && text(i.studentId) && text(i.studentName) && text(i.description) && money(i.amount) && text(i.dueDate) && ['Paid','Unpaid'].includes(i.status)) &&
      Array.isArray(value.payments) && value.payments.every((t: any) => t && text(t.id) && text(t.studentId) && text(t.studentName) && text(t.invoiceId) && money(t.amount) && text(t.paymentDate) && text(t.paymentMethod)));
  error = this.record.error;
  selectedStudentId: string | null = null;
  constructor() { this.restore(); }
  private restore(): void {
    const value = this.record.value;
    this.students = value.students; this.invoices = value.invoices; this.payments = value.payments;
  }
  private persist(): boolean {
    try { this.record.save({ students: this.students, invoices: this.invoices, payments: this.payments }); this.error = ''; return true; }
    catch (error) { this.restore(); this.error = error instanceof Error ? error.message : 'Unable to save fees.'; return false; }
  }
  get selectedStudent(): StudentFee | undefined { return this.students.find(s => s.id === this.selectedStudentId); }
  get studentInvoices(): Invoice[] { return this.invoices.filter(i => i.studentId === this.selectedStudentId); }
  get studentPayments(): Payment[] { return this.payments.filter(p => p.studentId === this.selectedStudentId); }
  viewStudent(id: string): void { this.selectedStudentId = id; this.accountUsername = ''; this.accountLinkMessage = '';  }

  // Filter students
  get filteredStudents(): StudentFee[] {
    return this.students.filter(student => {

      const matchesSearch =
        student.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.id.includes(this.searchTerm);

      const matchesStatus =
        this.selectedStatus === '' ||
        student.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  // Financial summary calculations
  get totalFees(): number {
    return this.students.reduce(
      (total, student) => total + student.totalFees, 0
    );
  }

  get collectedFees(): number {
    return this.students.reduce(
      (total, student) => total + student.paidAmount, 0
    );
  }

  get outstandingFees(): number {
    return this.totalFees - this.collectedFees;
  }

  get totalStudents(): number {
    return this.students.length;
  }

  // Create a new invoice
  createInvoice(): void {

    const student = this.students.find(
      s => s.id === this.invoiceStudentId
    );

    if (
      !student ||
      !this.invoiceDescription.trim() ||
      this.invoiceAmount <= 0 ||
      !Number.isFinite(this.invoiceAmount) ||
      !this.invoiceDueDate
    ) {
      alert('Please complete all invoice fields correctly.');
      return;
    }

    const unbilled = student.totalFees - student.paidAmount - this.invoices.filter(i => i.studentId === student.id && i.status === 'Unpaid').reduce((sum, i) => sum + i.amount, 0);
    if (this.invoiceAmount > unbilled) {
      this.error = 'Invoice exceeds the balance not already covered by unpaid invoices.';
      return;
    }
    const newInvoice: Invoice = {
      id: 'INV-' + crypto.randomUUID(),
      studentId: student.id,
      studentName: student.name,
      description: this.invoiceDescription,
      amount: this.invoiceAmount,
      dueDate: this.invoiceDueDate,
      status: 'Unpaid'
    };

    this.invoices.push(newInvoice);
    if (!this.persist()) return;

    alert('Invoice created successfully!');

    // Reset form
    this.invoiceStudentId = '';
    this.invoiceDescription = '';
    this.invoiceAmount = 0;
    this.invoiceDueDate = '';
    this.showInvoiceForm = false;
  }

  // Record payment for an invoice
  recordPayment(invoiceId: string): void {

    const invoice = this.invoices.find(
      inv => inv.id === invoiceId
    );

    if (!invoice || invoice.status === 'Paid') {
      return;
    }

    const student = this.students.find(
      s => s.id === invoice.studentId
    );

    if (!student) {
      alert('Student not found.');
      return;
    }

    const remainingBalance =
      student.totalFees - student.paidAmount;

    if (invoice.amount > remainingBalance) {
      alert('Payment exceeds the remaining student balance.');
      return;
    }

    // Update student payment
    student.paidAmount += invoice.amount;

    // Update student payment status
    if (student.paidAmount >= student.totalFees) {
      student.status = 'Paid';
    } else if (student.paidAmount > 0) {
      student.status = 'Partial';
    } else {
      student.status = 'Unpaid';
    }

    // Update invoice status
    invoice.status = 'Paid';

    // Create payment history record
    const newPayment: Payment = {
      id: 'PAY-' + crypto.randomUUID(),
      studentId: student.id,
      studentName: student.name,
      invoiceId: invoice.id,
      amount: invoice.amount,
      paymentDate: new Date().toLocaleDateString(),
      paymentMethod: 'Cash'
    };

    this.payments.push(newPayment);
    if (!this.persist()) return;

    alert('Payment recorded successfully!');
  }

}
