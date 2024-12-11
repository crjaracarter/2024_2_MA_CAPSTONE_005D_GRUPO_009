import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, NavController, AlertController } from '@ionic/angular';
import { AutenticacionService } from '../autenticacion.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  regForm: FormGroup;
  isLoading = false;
  formSubmitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AutenticacionService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private navController: NavController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.regForm = this.formBuilder.group({
      nombres: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')
      ]],
      apellidos: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
      ]],
      rut: ['', [
        Validators.required, 
        Validators.pattern('[0-9]{1,2}\\.[0-9]{3}\\.[0-9]{3}-[0-9kK]{1}'),
        this.validarRut
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern('^\\+569[0-9]{8}$')
      ]],
      ciudad: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{4,}$')
      ]],
      region: ['', [Validators.required]],
      genero: ['', [Validators.required]]
    });
  }

  // Getter para facilitar el acceso a los campos del formulario
  get f() { return this.regForm.controls; }

  // Validador personalizado para RUT chileno
 // Validador personalizado para RUT chileno
validarRut(control: AbstractControl): {[key: string]: any} | null {
  const rut = control.value;
  if (!rut) return null;

  // Validar el formato básico
  if (!rut.match(/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/)) {
    return { 'rutInvalido': true };
  }

  // Eliminar puntos y guión
  let rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  const dv = rutLimpio.slice(-1).toUpperCase();
  const rutNumero = parseInt(rutLimpio.slice(0, -1));

  if (!rutLimpio.match(/^[0-9]+[0-9Kk]$/)) {
    return { 'rutInvalido': true };
  }

  let suma = 0;
  let multiplicador = 2;

  // Calcular dígito verificador
  for (let i = rutLimpio.length - 2; i >= 0; i--) {
    suma += parseInt(rutLimpio[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalculado: string;
  
  if (dvEsperado === 11) dvCalculado = '0';
  else if (dvEsperado === 10) dvCalculado = 'K';
  else dvCalculado = dvEsperado.toString();

  if (dv !== dvCalculado) {
    return { 'rutInvalido': true };
  }

  return null;
}

  getErrorMessage(controlName: string): string {
    const control = this.regForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    const errorMessages: { [key: string]: { [key: string]: string } } = {
      nombres: {
        required: 'El nombre es obligatorio',
        minlength: 'El nombre debe tener al menos 2 caracteres',
        pattern: 'El nombre solo debe contener letras'
      },
      apellidos: {
        required: 'Los apellidos son obligatorios',
        minlength: 'Los apellidos deben tener al menos 2 caracteres',
        pattern: 'Los apellidos solo deben contener letras'
      },
      email: {
        required: 'El correo electrónico es obligatorio',
        email: 'Ingresa un correo electrónico válido',
        pattern: 'Ingresa un correo electrónico válido'
      },
      password: {
        required: 'La contraseña es obligatoria',
        minlength: 'La contraseña debe tener al menos 6 caracteres',
        pattern: 'La contraseña debe contener al menos una letra y un número'
      },
      rut: {
        required: 'El RUT es obligatorio',
        pattern: 'Formato de RUT inválido (Ej: 12.345.678-9 o 12.345.678-K)',
        rutInvalido: 'El RUT ingresado no es válido'
      },
      telefono: {
        required: 'El teléfono es obligatorio',
        pattern: 'Formato inválido. Debe ser +569XXXXXXXX'
      },
      ciudad: {
        required: 'La ciudad es obligatoria',
        minlength: 'La ciudad debe tener al menos 4 caracteres',
        pattern: 'La ciudad solo debe contener letras'
      },
      region: {
        required: 'Selecciona una región'
      },
      genero: {
        required: 'Selecciona un género'
      }
    };

    // Verificar si existen mensajes para este control
    if (!errorMessages[controlName]) {
      return 'Error de validación';
    }

    // Obtener el primer error
    const firstError = Object.keys(errors)[0];
    
    // Retornar el mensaje correspondiente o un mensaje genérico
    return errorMessages[controlName][firstError] || 'Error de validación';
  }

  async onSubmit() {
    this.formSubmitted = true;

    if (this.regForm.valid) {
      const { email, password, ...userData } = this.regForm.value;
      const loading = await this.loadingController.create({
        message: 'Creando cuenta...'
      });
      
      try {
        await loading.present();

        // Registrar usuario en Authentication
        const userCredential = await this.authService.registerUser2(email, password);
        
        // Preparar datos adicionales del usuario
        const userDetails = {
          ...userData,
          email,
          estadoCuenta: 'Activa',
          fechaCreacion: new Date().toISOString(),
          ultimoAcceso: new Date().toISOString(),
          rol: 'Empleado',
          uid: userCredential.user?.uid
        };

        // Guardar datos adicionales en Firestore
        await this.authService.createUserData(userCredential.user?.uid, userDetails);

        await loading.dismiss();
        await this.mostrarMensajeExito();
        this.navController.navigateRoot('/login');
      } catch (error) {
        await loading.dismiss();
        await this.mostrarError(error);
      }
    } else {
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.regForm.controls).forEach(key => {
        const control = this.regForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  private async mostrarMensajeExito() {
    const toast = await this.toastController.create({
      message: 'Cuenta creada exitosamente. Por favor, inicia sesión.',
      duration: 3000,
      color: 'success',
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private async mostrarError(error: any) {
    const alert = await this.alertController.create({
      header: 'Error al crear la cuenta',
      message: this.obtenerMensajeError(error),
      buttons: ['OK'],
      cssClass: 'error-alert'
    });

    await alert.present();
  }

  private obtenerMensajeError(error: any): string {
    switch(error.code) {
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado. Por favor, utiliza otro correo.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/operation-not-allowed':
        return 'El registro de usuarios está deshabilitado temporalmente. Por favor, intenta más tarde.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres y combinar letras y números.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.';
      default:
        return 'Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde.';
    }
  }
}