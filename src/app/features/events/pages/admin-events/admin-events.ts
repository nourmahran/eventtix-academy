
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService, Event } from '../../services/event';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-events.html',
  styleUrl: './admin-events.scss'
})
export class AdminEvents {
  private eventService = inject(EventService);

  events = signal<Event[]>(this.eventService.getEvents());

  editing = signal(false);
  editingId: number | null = null;

  form: Event = this.emptyEvent();

  emptyEvent(): Event {
    return {
      id: 0,
      title: '',
      category: 'Concert',
      date: '',
      location: '',
      price: 0,
      image: '',
      description: ''
    };
  }

  saveEvent(): void {
    if (
      !this.form.title.trim() ||
      !this.form.date ||
      !this.form.location.trim() ||
      this.form.price <= 0
    ) {
      return;
    }

    if (this.editing()) {
      this.eventService.updateEvent(this.form);
    } else {
      const newEvent = {
        ...this.form,
        id: Date.now()
      };

      this.eventService.addEvent(newEvent);
    }

    this.events.set(this.eventService.getEvents());
    this.cancelEdit();
  }

  editEvent(event: Event): void {
    this.form = { ...event };
    this.editing.set(true);
    this.editingId = event.id;
  }

  cancelEdit(): void {
    this.form = this.emptyEvent();
    this.editing.set(false);
    this.editingId = null;
  }
}
