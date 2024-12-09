import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostulacionCardComponent } from './postulacion-card.component';

describe('PostulacionCardComponent', () => {
  let component: PostulacionCardComponent;
  let fixture: ComponentFixture<PostulacionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostulacionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostulacionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
