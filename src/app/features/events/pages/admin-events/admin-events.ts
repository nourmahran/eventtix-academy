import { BookingStorage } from '../../services/booking-storage';

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService, Event, seatNumber, eventEnded, validEventDate } from '../../services/event';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-events.html',
  styleUrl: './admin-events.scss'
})
export class AdminEvents {
  private eventService = inject(EventService);

  private bookings = inject(BookingStorage);
  error = this.eventService.error;
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
      description: '', time: '18:00', capacity: 40
    };
  }

  saveEvent(): void {
    if (
      !this.form.title.trim() ||
      !this.form.date ||
      !this.form.location.trim() ||
      !Number.isFinite(this.form.price) || this.form.price <= 0
    ) {
      this.error = 'Enter a title, date, location and positive price.';
      return;
    }
    const capacity = this.form.capacity ?? 40;
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 40) {
      this.error = 'Seat capacity must be a whole number from 1 to 40.';
      return;
    }
    if (!validEventDate(this.form.date) || (this.form.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(this.form.time))) {
      this.error = 'Enter a valid date and start time.';
      return;
    }
    // New events, and edits that move an event, must be scheduled in the future.
    const original = this.editingId ? this.eventService.getEventById(this.editingId) : undefined;
    const moved = !original || original.date !== this.form.date || (original.time ?? '') !== (this.form.time ?? '');
    if (moved && eventEnded(this.form)) {
      this.error = 'Choose a future date and time for this event.';
      return;
    }

    try {
    const reserved = this.editingId ? this.bookings.reservedSeats(this.editingId) : [];
    if (reserved.some(seat => seatNumber(seat) > (this.form.capacity ?? 40))) throw new Error('Capacity cannot exclude seats already sold.');
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
    this.error = '';
    } catch (error) { this.error = error instanceof Error ? error.message : 'Unable to save event.'; }
  }

  async deleteEvent(event: Event): Promise<void> {
    if (!confirm(`Delete ${event.title}? Events with sold tickets cannot be deleted.`)) return;
    try {
      if (!navigator.locks) throw new Error('Safe event deletion requires localhost or HTTPS.');
      await navigator.locks.request('eventtix.bookings.v2', () => {
        if (this.bookings.reservedSeats(event.id).length) throw new Error('This event has sold tickets and cannot be deleted.');
        this.eventService.removeEvent(event.id);
      });
      this.events.set(this.eventService.getEvents()); this.error = '';
      if (this.editingId === event.id) this.cancelEdit();
    } catch (error) { this.error = error instanceof Error ? error.message : 'Unable to delete event.'; }
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
