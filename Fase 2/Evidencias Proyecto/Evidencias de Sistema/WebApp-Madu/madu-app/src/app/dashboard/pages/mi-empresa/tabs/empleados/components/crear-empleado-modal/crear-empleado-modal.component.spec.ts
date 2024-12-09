import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEmpleadoModalComponent } from './crear-empleado-modal.component';

describe('CrearEmpleadoModalComponent', () => {
  let component: CrearEmpleadoModalComponent;
  let fixture: ComponentFixture<CrearEmpleadoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearEmpleadoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearEmpleadoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
