import { TestBed } from '@angular/core/testing';

import { EventService } from './event';

describe('Event', () => {
  let service: EventService;

  afterEach(() => localStorage.removeItem('eventtix.events.v1'));
  beforeEach(() => {
    localStorage.removeItem('eventtix.events.v1');
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventService);
  });

  it('persists event edits after service recreation', () => {
    const event = { ...service.getEvents()[0], title: 'Updated event' };
    service.updateEvent(event);
    expect(new EventService().getEventById(event.id)?.title).toBe('Updated event');
  });
  it('rejects booking against an event catalogue changed in another tab', () => {
    const other = new EventService();
    other.updateEvent({ ...other.getEvents()[0], price: 500 });
    expect(() => service.assertCurrent()).toThrowError(/another tab/);
  });
  it('should be created' , () => {
    expect(service).toBeTruthy();
  });
});
