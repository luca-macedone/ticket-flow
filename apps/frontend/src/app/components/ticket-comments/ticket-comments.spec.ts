import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketComments } from './ticket-comments';

describe('TicketComments', () => {
  let component: TicketComments;
  let fixture: ComponentFixture<TicketComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketComments],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketComments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
