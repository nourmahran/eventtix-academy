import { BookingStorage } from '../../services/booking-storage';
import { AuthService } from '../../../../core/auth/auth.service';

import { Component, computed, inject, signal, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './seat-selection.html',
  styleUrl: './seat-selection.scss'
})
export class SeatSelection {
  private readonly storage = inject(BookingStorage);
  private readonly auth = inject(AuthService);
  error = '';
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);

  eventId = Number(this.route.snapshot.paramMap.get('id'));
  event = this.eventService.getEventById(this.eventId);

  rows = ['A', 'B', 'C', 'D', 'E'];
  seatsPerRow = [1, 2, 3, 4, 5, 6, 7, 8];

  bookedSeats = ['A3', 'A4', 'B2', 'C5', 'D6', 'E1'];
  constructor() { this.refreshSeats(); }
  @HostListener('window:storage')
  refreshSeats(): void {
    try {
      this.bookedSeats = ['A3', 'A4', 'B2', 'C5', 'D6', 'E1', ...this.storage.reservedSeats(this.eventId)];
      this.error = '';
    } catch (error) { this.error = error instanceof Error ? error.message : 'Seat availability is unavailable.'; }
  }

  selectedSeats = signal<string[]>([]);

  totalPrice = computed(() =>
    Math.round(this.selectedSeats().length * (this.event?.price ?? 0) * 100) / 100
  );

  isStudent = signal(this.auth.hasRole(['student']));

discountPercent = 10;

discountAmount = computed(() =>
  this.isStudent() && this.auth.hasRole(['student']) ? Math.round(this.totalPrice() * this.discountPercent) / 100 : 0
);

finalTotal = computed(() =>
  Math.round((this.totalPrice() - this.discountAmount()) * 100) / 100
);

  isSelected(seat: string): boolean {
    return this.selectedSeats().includes(seat);
  }

  isBooked(seat: string): boolean {
    return this.bookedSeats.includes(seat);
  }

  toggleSeat(seat: string): void {
    if (this.error || this.isBooked(seat)) {
      return;
    }

    this.selectedSeats.update(current =>
      current.includes(seat)
        ? current.filter(item => item !== seat)
        : [...current, seat]
    );
  }
  proceedToCheckout(): void {
  if (this.selectedSeats().length === 0 || !this.event) {
    return;
  }

  this.refreshSeats();
  if (this.error) return;
  if (this.selectedSeats().some(seat => this.isBooked(seat))) {
    this.selectedSeats.set(this.selectedSeats().filter(seat => !this.isBooked(seat)));
    this.error = 'Some selected seats were booked in another tab. Choose available seats.';
    return;
  }
  const booking = {
    eventId: this.eventId,
    selectedSeats: this.selectedSeats(),
    isStudent: this.isStudent() && this.auth.hasRole(['student']),
    totalPrice: this.totalPrice(),
    discountAmount: this.discountAmount(),
    finalTotal: this.finalTotal()
  };

  try {
    this.storage.savePending(booking);
    void this.router.navigate(['/events', this.eventId, 'checkout']);
  } catch (error) { this.error = error instanceof Error ? error.message : 'Unable to save booking.'; }
}
}
