
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../services/event';

interface Booking {
  eventId: number;
  selectedSeats: string[];
  isStudent: boolean;
  totalPrice: number;
  discountAmount: number;
  finalTotal: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {
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

  private savedBooking = localStorage.getItem(
    'eventtix-pending-booking'

    
  );

  booking: Booking | null = this.savedBooking
    ? JSON.parse(this.savedBooking)
    : null;

  selectedSeats = this.booking?.selectedSeats ?? [];
  isStudent = this.booking?.isStudent ?? false;
  totalPrice = this.booking?.totalPrice ?? 0;
  discountAmount = this.booking?.discountAmount ?? 0;
  finalTotal = this.booking?.finalTotal ?? 0;

  confirmed = false;

ticketCode = '';

confirmBooking(): void {
  if (!this.booking || this.selectedSeats.length === 0) {
    return;
  }

  this.ticketCode = 'ET-' + Date.now();

  this.confirmed = true;

  const ticket = {
    ...this.booking,
    ticketCode: this.ticketCode,
    eventTitle: this.event?.title,
    eventDate: this.event?.date,
    eventLocation: this.event?.location
  };

  const existingTickets = JSON.parse(
    localStorage.getItem('eventtix-ticket-history') || '[]'
  );

  existingTickets.push(ticket);

  localStorage.setItem(
    'eventtix-ticket-history',
    JSON.stringify(existingTickets)
  );
}
}
