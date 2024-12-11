import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../data-access/auth.service';
import { isRequired, hasEmailError } from '../../utils/validators';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';
import {
  Empleador,
  UserRole,
  AccountStatus,
  Gender,
} from '../../../core/interfaces/user.interface';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordModalComponent } from '../forgot-password-modal/forgot-password-modal.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    GoogleButtonComponent,
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _dialog = inject(MatDialog);

  isLoading = false;
  showPassword = false;
  mousePosition = { x: 0, y: 0 };

  // Definición del formulario reactivo
  form = this._formBuilder.group<FormLogin>({
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', Validators.required),
  });

  ngOnInit() {
    this.initializeMouseMove();
  }

  openForgotPasswordModal() {
    this._dialog.open(ForgotPasswordModalComponent, {
      width: '400px',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });
  }

  private initializeMouseMove() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
      this.updateGradient();
    });
  }

  private updateGradient() {
    const bg = document.getElementById('animated-bg');
    if (bg) {
      bg.style.background = `
        radial-gradient(
          circle at ${this.mousePosition.x}% ${this.mousePosition.y}%,
          #5A4FCF 0%,
          #4B0082 50%,
          #8A8EF2 100%
        )
      `;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  getErrorMessage(field: 'email' | 'password'): string {
    const control = this.form.get(field);
    if (!control?.errors) return '';

    const errors: { [key: string]: string } = {
      required: 'Este campo es requerido',
      email: 'Ingrese un correo electrónico válido',
      minlength: 'La contraseña debe tener al menos 6 caracteres',
      pattern: 'El formato del correo no es válido',
    };

    const errorKey = Object.keys(control.errors)[0];
    return errors[errorKey] || 'Error de validación';
  }

  isRequired(field: 'email' | 'password'): boolean {
    const control = this.form.get(field);
    return control ? control.hasError('required') && control.touched : false;
  }

  hasEmailError(): boolean {
    const emailControl = this.form.get('email');
    return emailControl
      ? (emailControl.hasError('email') || emailControl.hasError('pattern')) &&
          emailControl.touched
      : false;
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const { email, password } = this.form.value;

      if (!email || !password) {
        toast.error('Email y contraseña son obligatorios');
        return;
      }

      await this._authService.signIn({
        email,
        password,
        nombres: '',
        apellidos: '',
        telefono: '',
        region: '',
        ciudad: '',
        rut: '',
        rol: UserRole.USUARIO,
        genero: Gender.OTRO,
        estadoCuenta: AccountStatus.ACTIVA,
        fechaCreacion: new Date(),
        ultimoAcceso: new Date(),
      });

      toast.success('¡Bienvenido de nuevo!', {
        duration: 3000,
        position: 'top-right',
      });

      await this._router.navigateByUrl('/dashboard');
    } catch (error: any) {
      const errorMessage = this.getAuthErrorMessage(error.code);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      this.isLoading = false;
    }
  }

  private getAuthErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'El formato del correo electrónico no es válido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/too-many-requests':
        'Demasiados intentos fallidos. Por favor, intente más tarde',
    };

    return errorMessages[errorCode] || 'Ocurrió un error al iniciar sesión';
  }

  async submitWithGoogle() {
    this.isLoading = true;
    try {
      await this._authService.signInWithGoogle();
      toast.success('¡Bienvenido!', {
        duration: 3000,
        position: 'top-right',
      });
      await this._router.navigateByUrl('/dashboard');
    } catch (error: any) {
      toast.error('Error al iniciar sesión con Google', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      this.isLoading = false;
    }
  }
}
export interface FormLogin {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}
