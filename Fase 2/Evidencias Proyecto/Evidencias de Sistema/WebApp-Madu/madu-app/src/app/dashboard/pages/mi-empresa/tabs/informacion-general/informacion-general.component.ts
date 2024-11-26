// src/app/dashboard/pages/mi-empresa/tabs/informacion-general/informacion-general.component.ts

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Empresa } from '../../../../../core/interfaces/empresa.interface';

@Component({
  selector: 'app-informacion-general',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './informacion-general.component.html',
  styleUrls: ['./informacion-general.component.scss']
})
export class InformacionGeneralComponent {
  @Input() empresa: Empresa | null = null;
  @Output() updated = new EventEmitter<Partial<Empresa>>();

  private fb = inject(FormBuilder);
  
  empresaForm: FormGroup;
  isEditing = false;
  
  sectoresIndustriales = [
    'Tecnología',
    'Salud',
    'Educación',
    'Retail',
    'Manufactura',
    'Servicios Financieros',
    'Construcción',
    'Agricultura',
    'Transporte',
    'Otros'
  ];

  constructor() {
    this.empresaForm = this.fb.group({
      nombreEmpresa: ['', [Validators.required, Validators.minLength(3)]],
      rutEmpresa: ['', [Validators.required]],
      direccionEmpresa: ['', [Validators.required]],
      sectorIndustrial: ['', [Validators.required]],
      sitioWeb: ['', [Validators.pattern('https?://.+')]],
      descripcionEmpresa: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  ngOnChanges() {
    if (this.empresa) {
      this.empresaForm.patchValue({
        nombreEmpresa: this.empresa.nombreEmpresa,
        rutEmpresa: this.empresa.rutEmpresa,
        direccionEmpresa: this.empresa.direccionEmpresa,
        sectorIndustrial: this.empresa.sectorIndustrial,
        sitioWeb: this.empresa.sitioWeb || '',
        descripcionEmpresa: this.empresa.descripcionEmpresa
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.empresa) {
      this.empresaForm.patchValue(this.empresa);
    }
  }

  async onSubmit() {
    if (this.empresaForm.valid) {
      this.updated.emit(this.empresaForm.value);
      this.isEditing = false;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.empresaForm.get(controlName);
    if (!control?.errors) return '';

    const errors = {
      required: 'Este campo es requerido',
      minlength: `Mínimo ${control.errors['minlength']?.requiredLength} caracteres`,
      pattern: 'Formato inválido'
    };

    const firstError = Object.keys(control.errors)[0];
    return errors[firstError as keyof typeof errors] || 'Error de validación';
  }
}