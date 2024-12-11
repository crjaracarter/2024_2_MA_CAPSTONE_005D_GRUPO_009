import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiAsistenciaComponent } from './mi-asistencia.component';

describe('MiAsistenciaComponent', () => {
  let component: MiAsistenciaComponent;
  let fixture: ComponentFixture<MiAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiAsistenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
