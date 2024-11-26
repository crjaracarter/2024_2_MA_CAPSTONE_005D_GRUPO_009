import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { 
  isRequired, 
  hasEmailError, 
  rutValidator, 
  formatRut, 
  hasPasswordError 
} from '../../utils/validators';
import { AuthService } from '../../data-access/auth.service';
import { toast } from 'ngx-sonner';
import { Router, RouterLink } from '@angular/router';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';
import {
  Empleador,
  UserRole,
  AccountStatus,
  Gender,
} from '../../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';

export interface FormRegister {
  nombres: FormControl<string | null>;
  apellidos: FormControl<string | null>;
  rut: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    GoogleButtonComponent,
    CommonModule,
  ],
  providers: [AuthService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  isRequired(field: keyof FormRegister) {
    return (
      this.form.get(field)?.hasError('required') &&
      this.form.get(field)?.touched
    );
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  form = this._formBuilder.group<FormRegister>({
    nombres: this._formBuilder.control('', [Validators.required]),
    apellidos: this._formBuilder.control('', [Validators.required]),
    rut: this._formBuilder.control('', [Validators.required, rutValidator]),
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/),
    ])
  });

  onRutInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = formatRut(input.value);
    this.form.get('rut')?.setValue(input.value);
  }


  loading = false;

  async submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    try {
      const { email, password, nombres, apellidos } = this.form.value;

      if (!email || !password || !nombres || !apellidos) {
        this.loading = false;
        return;
      }

      await this._authService.signUp({
        email,
        password,
        nombres,
        apellidos,
        telefono: '',
        region: '',
        ciudad: '',
        rut: '',
        rol: UserRole.USUARIO,
        genero: Gender.NO_ESPECIFICA,
        estadoCuenta: AccountStatus.ACTIVA,
        fechaCreacion: new Date(),
        ultimoAcceso: new Date(),
      });

      toast.success('Usuario Creado Éxitosamente');

      // Asegúrate de que la navegación se ejecute
      await this._router.navigate(['/dashboard']);
    } catch (error: any) {
      this.loading = false;
      let errorMessage = 'Ocurrió un error durante el registro';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado';
      }

      toast.error(errorMessage);
      console.error('Error en registro:', error);
    }
  }

  async submitWithGoogle() {
    try {
      await this._authService.signInWithGoogle();
      toast.success('Bienvenido');
      this._router.navigateByUrl('/dashboard');
    } catch (error: any) {
      console.error('Error durante el inicio de sesión con Google:', error);
      toast.error('Ocurrió un error al iniciar sesión con Google');
    }
  }
}

