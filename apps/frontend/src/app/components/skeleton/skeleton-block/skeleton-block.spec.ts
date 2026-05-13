import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonBlock } from './skeleton-block';

describe('SkeletonBlock', () => {
  let component: SkeletonBlock;
  let fixture: ComponentFixture<SkeletonBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonBlock],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonBlock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
