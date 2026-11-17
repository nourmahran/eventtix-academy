
import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

interface EventExpense {
  description: string;
  amount: number;
}

interface FinanceEvent {
  id: string;
  name: string;
  ticketRevenue: number;
  sponsorship: number;
  otherIncome: number;
  expenses: EventExpense[];
}

@Component({
  selector: 'app-event-finance',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './event-finance.html',
  styleUrl: './event-finance.scss'
})
export class EventFinance implements AfterViewInit, OnDestroy {

  @ViewChild('budgetChart')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  // Mock event financial data
  events: FinanceEvent[] = [
    {
      id: 'EV001',
      name: 'Music Concert',
      ticketRevenue: 50000,
      sponsorship: 20000,
      otherIncome: 0,
      expenses: [
        { description: 'Venue', amount: 18000 },
        { description: 'Equipment', amount: 12000 },
        { description: 'Marketing', amount: 8000 },
        { description: 'Staff', amount: 4000 }
      ]
    },
    {
      id: 'EV002',
      name: 'Tech Conference',
      ticketRevenue: 35000,
      sponsorship: 15000,
      otherIncome: 0,
      expenses: [
        { description: 'Venue', amount: 12000 },
        { description: 'Equipment', amount: 8000 },
        { description: 'Catering', amount: 5000 }
      ]
    },
    {
      id: 'EV003',
      name: 'Design Workshop',
      ticketRevenue: 18000,
      sponsorship: 5000,
      otherIncome: 0,
      expenses: [
        { description: 'Materials', amount: 5000 },
        { description: 'Venue', amount: 4000 }
      ]
    }
  ];

  selectedEventId = 'EV001';

  // Transaction form
  showTransactionForm = false;
  transactionType: 'income' | 'expense' | 'sponsor' = 'expense';
  transactionDescription = '';
  transactionAmount = 0;

  get selectedEvent(): FinanceEvent | undefined {
    return this.events.find(e => e.id === this.selectedEventId);
  }

  getIncome(event: FinanceEvent): number {
    return (
      event.ticketRevenue +
      event.sponsorship +
      event.otherIncome
    );
  }

  getExpenses(event: FinanceEvent): number {
    return event.expenses.reduce(
      (total, expense) => total + expense.amount, 0
    );
  }

  getProfit(event: FinanceEvent): number {
    return this.getIncome(event) - this.getExpenses(event);
  }

  get totalIncome(): number {
    return this.events.reduce(
      (total, e) => total + this.getIncome(e), 0
    );
  }

  get totalExpenses(): number {
    return this.events.reduce(
      (total, e) => total + this.getExpenses(e), 0
    );
  }

  get totalSponsorship(): number {
    return this.events.reduce(
      (total, e) => total + e.sponsorship, 0
    );
  }

  get totalProfit(): number {
    return this.totalIncome - this.totalExpenses;
  }

  // Record new income, expense or sponsor contribution
  addTransaction(): void {
    const event = this.selectedEvent;

    if (
      !event ||
      !this.transactionDescription.trim() ||
      !Number.isFinite(this.transactionAmount) ||
      this.transactionAmount <= 0
    ) {
      alert('Please enter valid transaction details.');
      return;
    }

    if (this.transactionType === 'expense') {
      event.expenses.push({
        description: this.transactionDescription.trim(),
        amount: this.transactionAmount
      });
    } else if (this.transactionType === 'sponsor') {
      event.sponsorship += this.transactionAmount;
    } else {
      event.otherIncome += this.transactionAmount;
    }

    this.transactionDescription = '';
    this.transactionAmount = 0;
    this.showTransactionForm = false;

    this.updateChart();

    alert('Transaction recorded successfully!');
  }

  ngAfterViewInit(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.events.map(e => e.name),
        datasets: [
          {
            label: 'Income',
            data: this.events.map(e => this.getIncome(e)),
            backgroundColor: '#5268d9',
            borderRadius: 6
          },
          {
            label: 'Expenses',
            data: this.events.map(e => this.getExpenses(e)),
            backgroundColor: '#f0a46b',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount (EGP)'
            }
          }
        }
      }
    });
  }

  updateChart(): void {
    if (!this.chart) return;

    this.chart.data.labels = this.events.map(e => e.name);
    this.chart.data.datasets[0].data =
      this.events.map(e => this.getIncome(e));
    this.chart.data.datasets[1].data =
      this.events.map(e => this.getExpenses(e));

    this.chart.update();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
