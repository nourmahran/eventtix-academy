import { EventService } from '../../events/services/event';
import { RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
 private readonly catalogue = inject(EventService);
 get featured() { return this.catalogue.getEvents().slice(0,3); }

}
