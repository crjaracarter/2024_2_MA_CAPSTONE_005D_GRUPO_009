import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiEmpresaComponent } from './mi-empresa.component';

describe('MiEmpresaComponent', () => {
  let component: MiEmpresaComponent;
  let fixture: ComponentFixture<MiEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
