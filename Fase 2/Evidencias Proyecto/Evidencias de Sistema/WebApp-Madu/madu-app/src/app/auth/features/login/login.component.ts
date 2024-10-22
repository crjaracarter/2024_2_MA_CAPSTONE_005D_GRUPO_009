import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../data-access/auth.service';
import { isRequired, hasEmailError } from '../../utils/validators';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})


export class LoginComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  // Definición del formulario reactivo
  form = this._formBuilder.group<FormLogin>({
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', Validators.required),
  });

  // Implementación de validaciones manuales
  isRequired(field: 'email' | 'password'): boolean {
    const control = this.form.get(field);
    return control ? control.hasError('required') && control.touched : false;
  }

  hasEmailError(): boolean {
    const emailControl = this.form.get('email');
    return emailControl ? emailControl.hasError('email') && emailControl.touched : false;
  }

  async submit() {
    if (this.form.invalid) return;

    try {
      const { email, password } = this.form.value;

      console.log('Intentando iniciar sesión con:', email, password);

      if (!email || !password) {
        toast.error('Email y contraseña son obligatorios');
        return;
      }

      await this._authService.signIn({ email, password });

      toast.success('Hola nuevamente');
      this._router.navigateByUrl('/dashboard');
    } catch (error: any) {
      console.error('Error en inicio de sesión:', error);
      toast.error(error.message || 'Ocurrió un error al iniciar sesión');
      this.form.reset();
    }
  }

  async submitWithGoogle() {
    try {
      console.log('Iniciando sesión con Google');
      await this._authService.signInWithGoogle();
      toast.success('Bienvenido de nuevo');
      this._router.navigateByUrl('/dashboard');
    } catch (error: any) {
      console.error('Error en inicio de sesión con Google:', error);
      toast.error(error.message || 'Ocurrió un error al iniciar sesión con Google');
    }
  }
}

export interface FormLogin {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}