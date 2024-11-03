import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { hasEmailError, isRequired } from '../../utils/validators';
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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent],
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
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/),
    ]),
  });

  loading = false;

  async submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    try {
      const { email, password } = this.form.value;

      if (!email || !password) return;

      await this._authService.signUp({
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

      toast.success('Usuario Creado Éxitosamente');
      this._router.navigateByUrl('/dashboard');
    } catch (error) {
      this.loading = false;
      toast.error('Ocurrio un error');
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

export interface FormRegister {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}
