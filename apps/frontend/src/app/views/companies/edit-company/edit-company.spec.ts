import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCompany } from './edit-company';

describe('EditCompany', () => {
  let component: EditCompany;
  let fixture: ComponentFixture<EditCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCompany],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCompany);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
