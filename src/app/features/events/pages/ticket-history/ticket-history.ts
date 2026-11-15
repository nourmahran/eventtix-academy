
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Ticket {
  eventId: number;
  selectedSeats: string[];
  isStudent: boolean;
  totalPrice: number;
  discountAmount: number;
  finalTotal: number;
  ticketCode: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

@Component({
  selector: 'app-ticket-history',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ticket-history.html',
  styleUrl: './ticket-history.scss'
})
export class TicketHistory {

  tickets: Ticket[] = JSON.parse(
    localStorage.getItem('eventtix-ticket-history') || '[]'
  );

}
