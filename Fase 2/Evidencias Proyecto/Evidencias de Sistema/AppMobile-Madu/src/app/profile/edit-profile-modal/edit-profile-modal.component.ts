import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface User {
  uid: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  region: string;
  ciudad: string;
  rut: string;
  genero: string;
  rol: string;
  estadoCuenta: string;
  fechaCreacion: any;
  ultimoAcceso: any;
}

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class EditProfileModalComponent implements OnInit {
  @Input() user!: User;
  @Input() regions!: string[];
  editForm: FormGroup;
  isSubmitting = false;

  generos = [
    'Masculino',
    'Femenino',
    'Otro',
    'Prefiero no especificar'
  ];

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
  ) {
    this.editForm = this.fb.group({
      nombres: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^\+?[0-9]{8,15}$/)
      ]],
      region: ['', Validators.required],
      ciudad: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      genero: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.user) {
      this.editForm.patchValue({
        nombres: this.user.nombres,
        apellidos: this.user.apellidos,
        telefono: this.user.telefono,
        region: this.user.region,
        ciudad: this.user.ciudad,
        genero: this.user.genero
      });
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async onSubmit() {
    if (this.editForm.valid) {
      this.isSubmitting = true;
      try {
        await this.modalController.dismiss(this.editForm.value);
      } catch (error) {
        console.error('Error al guardar los cambios:', error);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      Object.keys(this.editForm.controls).forEach(key => {
        const control = this.editForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.editForm.get(controlName);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    const errorMessages: { [key: string]: string } = {
      required: 'Este campo es requerido',
      minlength: `Mínimo ${errors['minlength']?.requiredLength} caracteres`,
      pattern: {
        nombres: 'Solo se permiten letras y espacios',
        apellidos: 'Solo se permiten letras y espacios',
        telefono: 'Formato de teléfono inválido',
        ciudad: 'Solo se permiten letras y espacios',
      }[controlName] || 'Formato inválido'
    };

    const firstError = Object.keys(errors)[0];
    return errorMessages[firstError] || 'Error de validación';
  }
}