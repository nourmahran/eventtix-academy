
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService, Event as EventModel } from '../../services/event';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss'
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  event = signal<EventModel | undefined>(undefined);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.event.set(this.eventService.getEventById(id));
  }
}
