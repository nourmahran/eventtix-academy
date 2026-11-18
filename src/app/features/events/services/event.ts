import { LocalRecord, money, text } from '../../../shared/services/local-record';

import { Injectable, signal } from '@angular/core';

export interface Event {
  id: number;
  title: string;
  category: string;
  date: string;
  location: string;
  price: number;
  image: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private readonly seed: Event[] = [
    {
      id: 1,
      title: 'Cairo Music Festival',
      category: 'Concert',
      date: '2026-12-15',
      location: 'Cairo, Egypt',
      price: 350,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      description: 'Experience an unforgettable night of live music.'
    },
    {
      id: 2,
      title: 'Tech Innovation Summit',
      category: 'Conference',
      date: '2026-12-20',
      location: 'New Cairo, Egypt',
      price: 200,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      description: 'Discover the latest technology and innovations.'
    },
    {
      id: 3,
      title: 'Creative Photography Workshop',
      category: 'Workshop',
      date: '2026-12-25',
      location: 'Giza, Egypt',
      price: 150,
      image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
      description: 'Learn photography techniques from professionals.'
    },
    {
      id: 4,
      title: 'Live Jazz Night',
      category: 'Concert',
      date: '2027-01-05',
      location: 'Zamalek, Cairo',
      price: 250,
      image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800',
      description: 'Enjoy an evening of live jazz performances.'
    }
  ];
  private readonly record = new LocalRecord<Event[]>('eventtix.events.v1', this.seed, value =>
    Array.isArray(value) && value.every(e => e && Number.isInteger(e.id) && e.id > 0 &&
      text(e.title) && text(e.category) && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && text(e.location) &&
      money(e.price) && typeof e.image === 'string' && typeof e.description === 'string') && new Set(value.map(e => e.id)).size === value.length);
  readonly error = this.record.error;
  private events = signal<Event[]>(this.record.value);


  getEvents(): Event[] {
    return this.events();
  }

  getEventById(id: number): Event | undefined {
    return this.events().find(event => event.id === id);
  }
  assertCurrent(): void { this.record.assertCurrent(); }
  addEvent(event: Event): void {
  if (this.getEventById(event.id)) throw new Error('An event with this ID already exists.');
  const next = [...this.events(), event];
  this.record.save(next);
  this.events.set(next);
}

updateEvent(updatedEvent: Event): void {
  if (!this.getEventById(updatedEvent.id)) throw new Error('Event no longer exists.');
  const next = this.events().map(event => event.id === updatedEvent.id ? updatedEvent : event);
  this.record.save(next);
  this.events.set(next);
}
}
