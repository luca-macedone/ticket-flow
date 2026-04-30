import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipBase } from './tooltip-base';

describe('TooltipBase', () => {
  let component: TooltipBase;
  let fixture: ComponentFixture<TooltipBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipBase],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipBase);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
