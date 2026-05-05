import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketView } from './ticket-view';

describe('TicketView', () => {
  let component: TicketView;
  let fixture: ComponentFixture<TicketView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketView],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
