import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketHistory } from './ticket-history';

describe('TicketHistory', () => {
  let component: TicketHistory;
  let fixture: ComponentFixture<TicketHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [TicketHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
