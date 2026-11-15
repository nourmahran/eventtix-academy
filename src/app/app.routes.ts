
import { Routes } from '@angular/router';
import { EventList } from './features/events/pages/event-list/event-list';
import { EventDetails } from './features/events/pages/event-details/event-details';
import { SeatSelection } from './features/events/pages/seat-selection/seat-selection';
import { Checkout } from './features/events/pages/checkout/checkout';
import { TicketHistory } from './features/events/pages/ticket-history/ticket-history';
import { AdminEvents } from './features/events/pages/admin-events/admin-events';

export const routes: Routes = [
  {
    path: 'events',
    component: EventList
  },
  {
    path: 'events/:id/seats',
    component: SeatSelection
  },
  {
  path: 'events/:id/checkout',
  component: Checkout
},
  {
    path: 'events/:id',
    component: EventDetails
  },
  {
  path: 'admin/events',
  component: AdminEvents
},
  {
  path: 'ticket-history',
  component: TicketHistory
},
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'events'
  }
];
