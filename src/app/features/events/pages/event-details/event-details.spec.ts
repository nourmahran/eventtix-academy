import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetails } from './event-details';

describe('EventDetails', () => {
  let component: EventDetails;
  let fixture: ComponentFixture<EventDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [EventDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
