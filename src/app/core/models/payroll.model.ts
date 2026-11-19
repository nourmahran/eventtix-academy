
export type PayrollStatus =
  | 'pending'
  | 'approved'
  | 'paid';

export interface EventStaff {
  id: string;
  fullName: string;
  email: string;
  position: string;
  baseSalary: number;
  isActive: boolean;
}

export interface PayrollAllowance {
  id: string;
  staffId: string;
  eventId: string;
  description: string;
  amount: number;
  status: PayrollStatus;
  createdAt: string;
  paidAt?: string;
}

export interface PayrollSummary {
  staffId: string;
  baseSalary: number;
  totalAllowances: number;
  totalPayment: number;
}
