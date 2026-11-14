
import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EventAllowance {
  eventName: string;
  amount: number;
  month: string;
}

interface Staff {
  id: string;
  name: string;
  position: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  eventAllowances: EventAllowance[];
}

@Component({
  selector: 'app-payroll',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './payroll.html',
  styleUrl: './payroll.scss'
})
export class Payroll {

  // Selected payroll month
  selectedMonth = new Date().toLocaleDateString('en-CA').slice(0, 7);

  // Sample staff data
  staff: Staff[] = [
    {
      id: 'ST001',
      name: 'Mohamed Ahmed',
      position: 'Security',
      basicSalary: 8000,
      allowances: 1000,
      deductions: 200,
      eventAllowances: []
    },
    {
      id: 'ST002',
      name: 'Mariam Hassan',
      position: 'Event Manager',
      basicSalary: 12000,
      allowances: 2000,
      deductions: 500,
      eventAllowances: []
    },
    {
      id: 'ST003',
      name: 'Ali Mahmoud',
      position: 'Technician',
      basicSalary: 7000,
      allowances: 500,
      deductions: 100,
      eventAllowances: []
    }
  ];

  // Add/Edit staff form
  showStaffForm = false;
  editingStaffId: string | null = null;

  formName = '';
  formPosition = '';
  formSalary = 0;
  formAllowances = 0;
  formDeductions = 0;

  // Event allowance form
  showEventForm = false;
  selectedStaffId = '';
  eventName = '';
  eventAmount = 0;

  // Calculate event allowances for selected month
  getEventAllowance(staffMember: Staff): number {
    return staffMember.eventAllowances
      .filter(a => a.month === this.selectedMonth)
      .reduce((total, a) => total + a.amount, 0);
  }

  // Calculate net salary
  getNetSalary(staffMember: Staff): number {
    return (
      staffMember.basicSalary +
      staffMember.allowances +
      this.getEventAllowance(staffMember) -
      staffMember.deductions
    );
  }

  // Dashboard summary calculations
  get totalStaff(): number {
    return this.staff.length;
  }

  get totalAllowances(): number {
    return this.staff.reduce(
      (total, s) =>
        total + s.allowances + this.getEventAllowance(s), 0
    );
  }

  get totalDeductions(): number {
    return this.staff.reduce(
      (total, s) => total + s.deductions, 0
    );
  }

  get totalPayroll(): number {
    return this.staff.reduce(
      (total, s) => total + this.getNetSalary(s), 0
    );
  }

  // Open form to add staff
  openAddStaff(): void {
    this.editingStaffId = null;
    this.formName = '';
    this.formPosition = '';
    this.formSalary = 0;
    this.formAllowances = 0;
    this.formDeductions = 0;
    this.showStaffForm = true;
  }

  // Open form to edit staff
  editStaff(staffMember: Staff): void {
    this.editingStaffId = staffMember.id;
    this.formName = staffMember.name;
    this.formPosition = staffMember.position;
    this.formSalary = staffMember.basicSalary;
    this.formAllowances = staffMember.allowances;
    this.formDeductions = staffMember.deductions;
    this.showStaffForm = true;
  }

  // Save new or edited staff
  saveStaff(): void {
    const amounts = [
      this.formSalary,
      this.formAllowances,
      this.formDeductions
    ];

    if (
      !this.formName.trim() ||
      !this.formPosition.trim() ||
      amounts.some(n => !Number.isFinite(n) || n < 0)
    ) {
      alert('Please enter valid staff information.');
      return;
    }

    if (this.editingStaffId) {
      const existing = this.staff.find(
        s => s.id === this.editingStaffId
      );

      if (!existing) {
        alert('Staff member not found.');
        return;
      }

      existing.name = this.formName.trim();
      existing.position = this.formPosition.trim();
      existing.basicSalary = this.formSalary;
      existing.allowances = this.formAllowances;
      existing.deductions = this.formDeductions;

    } else {
      this.staff.push({
        id: 'ST-' + Date.now(),
        name: this.formName.trim(),
        position: this.formPosition.trim(),
        basicSalary: this.formSalary,
        allowances: this.formAllowances,
        deductions: this.formDeductions,
        eventAllowances: []
      });
    }

    this.showStaffForm = false;
    this.editingStaffId = null;
  }

  // Add a per-event allowance
  addEventAllowance(): void {
    const staffMember = this.staff.find(
      s => s.id === this.selectedStaffId
    );

    if (
      !staffMember ||
      !this.eventName.trim() ||
      !Number.isFinite(this.eventAmount) ||
      this.eventAmount <= 0 ||
      !this.selectedMonth
    ) {
      alert('Please enter valid event allowance details.');
      return;
    }

    staffMember.eventAllowances.push({
      eventName: this.eventName.trim(),
      amount: this.eventAmount,
      month: this.selectedMonth
    });

    this.selectedStaffId = '';
    this.eventName = '';
    this.eventAmount = 0;
    this.showEventForm = false;

    alert('Event allowance added successfully!');
  }

  // Download monthly salary report as JSON
  exportReport(): void {
    const report = {
      month: this.selectedMonth,
      generatedAt: new Date().toISOString(),

      staff: this.staff.map(s => ({
        id: s.id,
        name: s.name,
        position: s.position,
        basicSalary: s.basicSalary,
        allowances: s.allowances,
        eventAllowances: s.eventAllowances.filter(
          a => a.month === this.selectedMonth
        ),
        deductions: s.deductions,
        netSalary: this.getNetSalary(s)
      })),

      totalStaff: this.totalStaff,
      totalAllowances: this.totalAllowances,
      totalDeductions: this.totalDeductions,
      totalPayroll: this.totalPayroll
    };

    const file = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = url;
    link.download = `payroll-${this.selectedMonth}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }
}
