import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFinance } from './event-finance';

describe('EventFinance', () => {
  let component: EventFinance;
  let fixture: ComponentFixture<EventFinance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFinance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventFinance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
