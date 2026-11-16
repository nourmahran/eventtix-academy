
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

  private events = signal<Event[]>([
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
  ]);

  getEvents(): Event[] {
    return this.events();
  }

  getEventById(id: number): Event | undefined {
    return this.events().find(event => event.id === id);
  }
  addEvent(event: Event): void {
  this.events.update(current => [...current, event]);
}

updateEvent(updatedEvent: Event): void {
  this.events.update(current =>
    current.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    )
  );
}
}
