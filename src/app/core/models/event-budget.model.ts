
export type BudgetExpenseCategory =
  | 'venue'
  | 'staff'
  | 'equipment'
  | 'marketing'
  | 'catering'
  | 'other';

export interface BudgetExpense {
  id: string;
  eventId: string;
  category: BudgetExpenseCategory;
  description: string;
  amount: number;
  date: string;
}

export interface Sponsorship {
  id: string;
  eventId: string;
  sponsorName: string;
  amount: number;
  receivedAt: string;
}

export interface EventBudget {
  eventId: string;
  ticketRevenue: number;
  sponsorshipRevenue: number;
  totalIncome: number;
  expenses: BudgetExpense[];
  totalExpenses: number;
  netProfit: number;
  updatedAt: string;
}

export interface EventFinancialSummary {
  totalTicketRevenue: number;
  totalSponsorshipRevenue: number;
  totalIncome: number;
  totalExpenses: number;
  totalProfit: number;
}

export const BUDGET_EXPENSE_CATEGORIES:
  readonly BudgetExpenseCategory[] = [
    'venue',
    'staff',
    'equipment',
    'marketing',
    'catering',
    'other'
  ];
