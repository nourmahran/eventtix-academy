import { LocalRecord, money, text } from '../../../shared/services/local-record';
import { BookingStorage } from '../../events/services/booking-storage';
import { EventService } from '../../events/services/event';

import {
  Component, inject, HostListener,
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

  private readonly bookings = inject(BookingStorage);
  private readonly catalog = inject(EventService);
  private readonly record = new LocalRecord<FinanceEvent[]>('eventtix.event-finance.v1', this.events, value =>
    Array.isArray(value) && value.every(e => e && text(e.id) && text(e.name) && money(e.ticketRevenue) &&
      money(e.sponsorship) && money(e.otherIncome) && Array.isArray(e.expenses) && e.expenses.every((x: any) => x && text(x.description) && money(x.amount))));
  error = this.record.error;
  private revenue: Record<string, number> = {};
  constructor() {
    this.restore();
    this.refreshRevenue();
  }
  private restore(): void {
    this.events = this.record.value;
    for (const event of this.catalog.getEvents()) {
      const id = `event-${event.id}`;
      const existing = this.events.find(e => e.id === id);
      if (existing) existing.name = event.title;
      else this.events.push({ id, name: event.title, ticketRevenue: 0, sponsorship: 0, otherIncome: 0, expenses: [] });
    }
  }
  @HostListener('window:storage')
  refreshRevenue(): void {
    try {
      for (const event of this.events) if (event.id.startsWith('event-')) this.revenue[event.id] = this.bookings.ticketRevenue(Number(event.id.slice(6)));
      this.updateChart();
    } catch (error) { this.error = error instanceof Error ? error.message : 'Ticket revenue is unavailable.'; }
  }
  ticketIncome(event: FinanceEvent): number { return event.id.startsWith('event-') ? (this.revenue[event.id] ?? 0) : event.ticketRevenue; }
  private persist(): boolean {
    try { this.record.save(this.events); this.error = ''; return true; }
    catch (error) { this.restore(); this.error = error instanceof Error ? error.message : 'Unable to save finance records.'; return false; }
  }
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
      this.ticketIncome(event) +
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

    if (!this.persist()) return;
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
            backgroundColor: '#087f74',
            borderRadius: 6
          },
          {
            label: 'Expenses',
            data: this.events.map(e => this.getExpenses(e)),
            backgroundColor: '#b27838',
            borderRadius: 6
          }
        ]
      },
      options: {
        animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : {duration:180},
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#526476' }
          }
        },
        scales: {
          x: { ticks: {color: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#526476'}, grid: {display:false} },
          y: {
            beginAtZero: true, ticks: {color: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#526476'}, grid: {color: getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#cbd5dc'},
            title: {
              display: true,
              text: 'Amount (EGP)', color: getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#526476'
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
