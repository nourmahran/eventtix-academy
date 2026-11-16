import { BookingStorage, SavedTicket } from '../../services/booking-storage';

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ticket-history',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ticket-history.html',
  styleUrl: './ticket-history.scss'
})
export class TicketHistory {

  error = '';
  tickets: SavedTicket[] = [];
  constructor() {
    try { this.tickets = inject(BookingStorage).tickets(); }
    catch (error) { this.error = error instanceof Error ? error.message : 'Unable to load tickets.'; }
  }
}
