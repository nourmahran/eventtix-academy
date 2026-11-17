import { BookingStorage, Booking } from '../../services/booking-storage';
import { AuthService } from '../../../../core/auth/auth.service';

import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../services/event';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
  private readonly storage = inject(BookingStorage);
  private readonly auth = inject(AuthService);
  error = '';
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  eventId = Number(this.route.snapshot.paramMap.get('id'));
  event = this.eventService.getEventById(this.eventId);

  qrPattern = [
  [1,1,1,1,1,0,1,1,1,1,1],
  [1,0,0,0,1,0,1,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,1,0,0,0,1],
  [1,1,1,1,1,0,1,1,1,1,1],
  [0,0,1,0,0,1,0,1,0,0,0],
  [1,1,0,1,1,0,1,0,1,1,0],
  [1,0,1,0,1,1,0,1,0,1,1],
  [1,1,1,0,0,1,1,0,1,0,1],
  [1,0,0,1,1,0,0,1,1,0,0],
  [1,1,1,1,0,1,1,0,1,1,1]
];

  private readBooking(): Booking | null {
    try { return this.storage.pending(this.eventId); }
    catch (error) { this.error = error instanceof Error ? error.message : 'Unable to load booking.'; return null; }
  }
  booking = this.readBooking();

  selectedSeats = this.booking?.selectedSeats ?? [];
  isStudent = !!this.booking?.isStudent && this.auth.hasRole(['student']);
  totalPrice = this.selectedSeats.length * (this.event?.price ?? 0);
  discountAmount = this.isStudent ? Math.round(this.totalPrice * 10) / 100 : 0;
  finalTotal = Math.round((this.totalPrice - this.discountAmount) * 100) / 100;

  confirmed = false;

ticketCode = '';

confirmBooking(): void {
  if (this.confirmed || !this.booking || !this.event || this.selectedSeats.length === 0) return;
  this.error = '';
  const ticketCode = 'ET-' + crypto.randomUUID();
  try {
    this.storage.confirm({ ...this.booking, totalPrice: this.totalPrice, discountAmount: this.discountAmount, finalTotal: this.finalTotal, isStudent: this.isStudent, ticketCode, eventTitle: this.event.title, eventDate: this.event.date, eventLocation: this.event.location });
    this.ticketCode = ticketCode;
    this.confirmed = true;
  } catch (error) { this.error = error instanceof Error ? error.message : 'Unable to confirm booking.'; }
}
}
