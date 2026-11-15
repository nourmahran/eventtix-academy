
import { Component, computed, inject, signal } from '@angular/core';
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);

  eventId = Number(this.route.snapshot.paramMap.get('id'));
  event = this.eventService.getEventById(this.eventId);

  rows = ['A', 'B', 'C', 'D', 'E'];
  seatsPerRow = [1, 2, 3, 4, 5, 6, 7, 8];

  bookedSeats = ['A3', 'A4', 'B2', 'C5', 'D6', 'E1'];

  selectedSeats = signal<string[]>([]);

  totalPrice = computed(() =>
    this.selectedSeats().length * (this.event?.price ?? 0)
  );

  isStudent = signal(false);

discountPercent = 10;

discountAmount = computed(() =>
  this.isStudent() ? this.totalPrice() * this.discountPercent / 100 : 0
);

finalTotal = computed(() =>
  this.totalPrice() - this.discountAmount()
);

  isSelected(seat: string): boolean {
    return this.selectedSeats().includes(seat);
  }

  isBooked(seat: string): boolean {
    return this.bookedSeats.includes(seat);
  }

  toggleSeat(seat: string): void {
    if (this.isBooked(seat)) {
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

  const booking = {
    eventId: this.eventId,
    selectedSeats: this.selectedSeats(),
    isStudent: this.isStudent(),
    totalPrice: this.totalPrice(),
    discountAmount: this.discountAmount(),
    finalTotal: this.finalTotal()
  };

  localStorage.setItem(
    'eventtix-pending-booking',
    JSON.stringify(booking)
  );

  this.router.navigate(['/events', this.eventId, 'checkout']);
}
}
