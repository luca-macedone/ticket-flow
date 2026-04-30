import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketTable } from './data-table';

describe('TicketTable', () => {
  let component: TicketTable;
  let fixture: ComponentFixture<TicketTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTable],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
