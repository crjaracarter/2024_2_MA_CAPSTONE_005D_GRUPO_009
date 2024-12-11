// forgot-password-modal.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../data-access/auth.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-md mx-auto bg-white rounded-xl">
      <div class="text-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">Recuperar contraseña</h3>
        <p class="text-sm text-gray-600 mt-1">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched"
          >
          <div 
            *ngIf="form.get('email')?.invalid && form.get('email')?.touched"
            class="text-red-500 text-sm mt-1"
          >
            <span *ngIf="form.get('email')?.hasError('required')">
              Este campo es requerido
            </span>
            <span *ngIf="form.get('email')?.hasError('email')">
              Ingrese un correo válido
            </span>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            (click)="close()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            [disabled]="form.invalid || isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-[#5A4FCF] hover:bg-[#4B0082] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8A8EF2] disabled:opacity-50"
          >
            {{ isLoading ? 'Enviando...' : 'Enviar enlace' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class ForgotPasswordModalComponent {
  private _formBuilder = inject(FormBuilder);
  private _dialogRef = inject(MatDialogRef<ForgotPasswordModalComponent>);
  private _authService = inject(AuthService);

  isLoading = false;

  form = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const email = this.form.get('email')?.value;
    if (!email) return;

    this.isLoading = true;

    try {
      await this._authService.resetPassword(email);
      toast.success('Se ha enviado un enlace a tu correo electrónico');
      this._dialogRef.close();
    } catch (error: any) {
      toast.error(this.getErrorMessage(error.code));
    } finally {
      this.isLoading = false;
    }
  }

  close() {
    this._dialogRef.close();
  }

  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
      'auth/invalid-email': 'El correo electrónico no es válido',
      'auth/too-many-requests': 'Demasiados intentos. Intente más tarde'
    };

    return errorMessages[errorCode] || 'Error al enviar el correo de recuperación';
  }
}