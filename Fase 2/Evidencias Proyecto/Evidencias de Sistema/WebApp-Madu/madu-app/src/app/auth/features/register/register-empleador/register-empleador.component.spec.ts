import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterEmpleadorComponent } from './register-empleador.component';

describe('RegisterEmpleadorComponent', () => {
  let component: RegisterEmpleadorComponent;
  let fixture: ComponentFixture<RegisterEmpleadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterEmpleadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterEmpleadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
