// src/app/auth/features/register-empleador/register-empleador.component.ts
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../../auth/data-access/auth.service';
import { hasEmailError, isRequired } from '../../../../auth/utils/validators';
import { GoogleButtonComponent } from '../../../ui/google-button/google-button.component';
import {
  Empleador,
  User,
  UserRole,
  AccountStatus,
  Gender,
} from '../../../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-empleador',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    GoogleButtonComponent,
    CommonModule,
  ],
  providers: [AuthService],
  templateUrl: './register-empleador.component.html',
  styleUrls: ['./register-empleador.component.scss'],
})
export class RegisterEmpleadorComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  Gender = Gender;
  console: any;

  checkFormValidity() {
    console.log('Form Status:', {
      valid: this.form.valid,
      invalid: this.form.invalid,
      touched: this.form.touched,
      dirty: this.form.dirty,
    });

    // Revisar cada control
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      console.log(`${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched,
      });
    });
  }

  isRequired(field: keyof FormRegisterEmpleador) {
    return (
      this.form.get(field)?.hasError('required') &&
      this.form.get(field)?.touched
    );
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  form = this._formBuilder.group<FormRegisterEmpleador>({
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    nombres: this._formBuilder.control('', Validators.required),
    apellidos: this._formBuilder.control('', Validators.required),
    telefono: this._formBuilder.control('', Validators.required),
    region: this._formBuilder.control('', Validators.required),
    ciudad: this._formBuilder.control('', Validators.required),
    rut: this._formBuilder.control('', Validators.required),
    genero: this._formBuilder.control<Gender | null>(null, Validators.required),
    nombreEmpresa: this._formBuilder.control('', Validators.required),
    rutEmpresa: this._formBuilder.control('', Validators.required),
    direccionEmpresa: this._formBuilder.control('', Validators.required),
    sectorIndustrial: this._formBuilder.control('', Validators.required),
    sitioWeb: this._formBuilder.control(''),
    descripcionEmpresa: this._formBuilder.control('', Validators.required),
  });

  loading = false;

  async submit() {
    console.log('Submit iniciado');

    if (this.form.invalid || this.loading) {
      console.log('Formulario inválido o loading:', {
        invalid: this.form.invalid,
        loading: this.loading,
      });
      return;
    }
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    try {
      console.log('Intentando registrar empleador...', this.form.value);
      const formValue = this.form.value;
      await this._authService.signUpEmpleador({
        email: formValue.email!,
        password: formValue.password!,
        nombres: formValue.nombres!,
        apellidos: formValue.apellidos!,
        telefono: formValue.telefono!,
        region: formValue.region!,
        ciudad: formValue.ciudad!,
        rut: formValue.rut!,
        genero: formValue.genero as Gender,
        rol: UserRole.EMPLEADOR,
        estadoCuenta: AccountStatus.ACTIVA,
        fechaCreacion: new Date(),
        ultimoAcceso: new Date(),
        nombreEmpresa: formValue.nombreEmpresa!,
        rutEmpresa: formValue.rutEmpresa!,
        direccionEmpresa: formValue.direccionEmpresa!,
        sectorIndustrial: formValue.sectorIndustrial!,
        sitioWeb: formValue.sitioWeb || undefined,
        descripcionEmpresa: formValue.descripcionEmpresa!,
      });

      console.log('Registro exitoso');
      toast.success('Empresa registrada exitosamente');
      this._router.navigateByUrl('/dashboard');
    } catch (error) {
      console.error('Error en el registro:', error);
      toast.error('Ocurrió un error en el registro');
    } finally {
      this.loading = false;
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

export interface FormRegisterEmpleador {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  nombres: FormControl<string | null>;
  apellidos: FormControl<string | null>;
  telefono: FormControl<string | null>;
  region: FormControl<string | null>;
  ciudad: FormControl<string | null>;
  rut: FormControl<string | null>;
  genero: FormControl<Gender | null>;
  nombreEmpresa: FormControl<string | null>;
  rutEmpresa: FormControl<string | null>;
  direccionEmpresa: FormControl<string | null>;
  sectorIndustrial: FormControl<string | null>;
  sitioWeb: FormControl<string | null>;
  descripcionEmpresa: FormControl<string | null>;
}
