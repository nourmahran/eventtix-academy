
export type StudentFeeStatus =
  | 'unpaid'
  | 'partially_paid'
  | 'paid'
  | 'overdue';

export interface StudentFee {
  id: string;
  studentId: string;
  courseName: string;
  academicTerm: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: StudentFeeStatus;
}

export interface StudentFeePayment {
  id: string;
  studentFeeId: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  transactionReference: string;
}

export interface StudentFeeSummary {
  studentId: string;
  totalFees: number;
  totalPaid: number;
  remainingBalance: number;
}
