import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomQuestionsBuilderComponent } from './custom-questions-builder.component';

describe('CustomQuestionsBuilderComponent', () => {
  let component: CustomQuestionsBuilderComponent;
  let fixture: ComponentFixture<CustomQuestionsBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomQuestionsBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomQuestionsBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
