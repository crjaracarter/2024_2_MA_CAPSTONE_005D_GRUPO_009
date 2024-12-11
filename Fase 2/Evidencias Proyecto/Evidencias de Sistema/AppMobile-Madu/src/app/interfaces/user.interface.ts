export enum UserRole {
  ADMIN = 'Admin',
  EMPLEADOR = 'Empleador',
  EMPLEADO = 'Empleado',
  USUARIO = 'USUARIO'
}

export enum AccountStatus {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA',
  PENDIENTE = 'PENDIENTE',
  BLOQUEADA = 'BLOQUEADA'
}

export enum Gender {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO',
  NO_ESPECIFICADO = 'NO_ESPECIFICADO'
}

export interface User {
  uid: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  region: string;
  ciudad: string;
  rut: string;
  genero: string; // Cambié de Gender a string para que coincida con los datos de Firebase
  rol: string;
  estadoCuenta: string;
  fechaCreacion: any;
  ultimoAcceso: any;
}