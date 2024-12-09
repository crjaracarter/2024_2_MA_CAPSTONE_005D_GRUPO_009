import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantsTrackingComponent } from './applicants-tracking.component';

describe('ApplicantsTrackingComponent', () => {
  let component: ApplicantsTrackingComponent;
  let fixture: ComponentFixture<ApplicantsTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantsTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantsTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
