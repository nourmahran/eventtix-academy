import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventList } from './event-list';

describe('EventList', () => {
  let component: EventList;
  let fixture: ComponentFixture<EventList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [EventList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
