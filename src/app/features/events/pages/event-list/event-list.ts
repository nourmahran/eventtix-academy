
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss'
})
export class EventList {
  private eventService = inject(EventService);

  searchTerm = signal('');
  selectedCategory = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('category') ?? 'All');
 get eventCount() { return this.eventService.getEvents().length; }

  categories = ['All', 'Concert', 'Conference', 'Workshop'];

  filteredEvents = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();

    return this.eventService.getEvents().filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search);

      const matchesCategory =
        category === 'All' || event.category === category;

      return matchesSearch && matchesCategory;
    });
  });
}
