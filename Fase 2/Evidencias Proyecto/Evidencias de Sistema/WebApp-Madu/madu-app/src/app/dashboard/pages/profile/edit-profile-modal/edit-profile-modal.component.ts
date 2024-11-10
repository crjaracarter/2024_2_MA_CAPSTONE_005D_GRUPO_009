// src/app/dashboard/pages/profile/edit-profile-modal/edit-profile-modal.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User, Gender } from '../../../../services/user/user.service';


@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatDialogModule
  ],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">Editar Perfil</h2>
          <button (click)="onCancel()" class="text-white/70 hover:text-white">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
          <div class="space-y-6">
            <!-- Nombres -->
            <div class="form-group">
              <label class="block text-sm font-medium text-white/90 mb-2">Nombres</label>
              <input type="text" formControlName="nombres" class="form-input">
            </div>

            <!-- Apellidos -->
            <div class="form-group">
              <label class="block text-sm font-medium text-white/90 mb-2">Apellidos</label>
              <input type="text" formControlName="apellidos" class="form-input">
            </div>

            <!-- Teléfono -->
            <div class="form-group">
              <label class="block text-sm font-medium text-white/90 mb-2">Teléfono</label>
              <input type="tel" formControlName="telefono" class="form-input">
            </div>

            <!-- Región -->
            <div class="form-group">
              <label class="block text-sm font-medium text-white/90 mb-2">Región</label>
              <select formControlName="region" class="form-input">
                <option value="" disabled>Selecciona una región</option>
                <option *ngFor="let region of regions" [value]="region">{{region}}</option>
              </select>
            </div>

            <!-- Ciudad -->
            <div class="form-group">
              <label class="block text-sm font-medium text-white/90 mb-2">Ciudad</label>
              <input type="text" formControlName="ciudad" class="form-input">
            </div>

            <!-- Género -->
            <div class="form-group">
              <label class="block text-sm font-medium text-white/90 mb-2">Género</label>
              <select formControlName="genero" class="form-input">
                <option value="" disabled>Selecciona un género</option>
                <option [value]="Gender.MASCULINO">Masculino</option>
                <option [value]="Gender.FEMENINO">Femenino</option>
                <option [value]="Gender.OTRO">Otro</option>
                <option [value]="Gender.NO_ESPECIFICA">Prefiero no especificar</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-8">
            <button type="button" 
                    (click)="onCancel()"
                    class="px-6 py-2.5 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all duration-300">
              Cancelar
            </button>
            <button type="submit" 
                    [disabled]="!editForm.valid"
                    class="px-6 py-2.5 bg-[#5A4FCF] text-white rounded-lg hover:bg-[#4B0082] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrl: './edit-profile-modal.component.scss'
})
export class EditProfileModalComponent {
  editForm: FormGroup = new FormGroup({});
  regions: string[];
  readonly Gender = Gender;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditProfileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {user: User, regions: string[]}
  ) {
    this.regions = data.regions;
    this.initForm();
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      nombres: [this.data.user.nombres, [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellidos: [this.data.user.apellidos, [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      telefono: [this.data.user.telefono, [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      region: [this.data.user.region, Validators.required],
      ciudad: [this.data.user.ciudad, [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      genero: [this.data.user.genero, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onCancel();
    }
  }  
}
