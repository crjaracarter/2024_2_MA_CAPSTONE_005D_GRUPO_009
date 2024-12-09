import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosPostulacionComponent } from './filtros-postulacion.component';

describe('FiltrosPostulacionComponent', () => {
  let component: FiltrosPostulacionComponent;
  let fixture: ComponentFixture<FiltrosPostulacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosPostulacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrosPostulacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
