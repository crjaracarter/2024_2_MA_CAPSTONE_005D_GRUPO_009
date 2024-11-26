import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

// Validación de campos requeridos
export const isRequired = (field: 'email' | 'password' | 'nombres' | 'apellidos' | 'rut', form: FormGroup) => {
  const control = form.get(field);
  return control && control.touched && control.hasError('required');
};

// Validación de email
export const hasEmailError = (form: FormGroup) => {
  const control = form.get('email');
  return control && control?.touched && control.hasError('email');
};

// Validación de RUT
export function rutValidator(control: AbstractControl): ValidationErrors | null {
  const rut = control.value;
  
  if (!rut) return null;

  // Limpiar el RUT de puntos y guión
  const rutLimpio = rut.replace(/\./g, '').replace('-', '');
  
  if (rutLimpio.length < 8 || rutLimpio.length > 9) {
    return { rutInvalido: true };
  }

  // Obtener dígito verificador
  const dv = rutLimpio.slice(-1).toUpperCase();
  const rutNumerico = parseInt(rutLimpio.slice(0, -1), 10);
  
  // Calcular dígito verificador
  const dvCalculado = calcularDV(rutNumerico);
  
  if (dv !== dvCalculado) {
    return { rutInvalido: true };
  }

  return null;
}

// Función auxiliar para calcular el dígito verificador
function calcularDV(rut: number): string {
  let suma = 0;
  let multiplicador = 2;
  let rutString = rut.toString();

  // Calcular suma
  for (let i = rutString.length - 1; i >= 0; i--) {
    suma += parseInt(rutString.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dvCalculado = 11 - resto;

  if (dvCalculado === 11) return '0';
  if (dvCalculado === 10) return 'K';
  return dvCalculado.toString();
}

// Función para formatear RUT
export function formatRut(rut: string): string {
  // Eliminar puntos y guión
  let valor = rut.replace(/\./g, '').replace('-', '');
  
  // Eliminar cualquier carácter que no sea número o K
  valor = valor.replace(/[^0-9kK]/g, '');

  // Obtener el cuerpo y dígito verificador
  let cuerpo = valor.slice(0, -1);
  const dv = valor.slice(-1).toUpperCase();

  // Formatear el cuerpo con puntos
  if (cuerpo.length > 3) {
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Unir cuerpo y dígito verificador
  return cuerpo + (dv ? '-' + dv : '');
}

// Validación de contraseña
export const hasPasswordError = (form: FormGroup) => {
  const control = form.get('password');
  return control && control?.touched && 
    (control.hasError('minlength') || control.hasError('pattern'));
};

// Validación de coincidencia de contraseñas (si lo necesitas en el futuro)
export const passwordMatchValidator = (form: FormGroup) => {
  const password = form.get('password');
  const confirmPassword = form.get('confirmPassword');

  if (password && confirmPassword) {
    const error = password.value !== confirmPassword.value;
    confirmPassword.setErrors(error ? { passwordMismatch: true } : null);
    return error;
  }
  return false;
};