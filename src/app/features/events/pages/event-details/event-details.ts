import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.event.set(this.eventService.getEventById(Number(params.get('id'))));
    });
  }
}
