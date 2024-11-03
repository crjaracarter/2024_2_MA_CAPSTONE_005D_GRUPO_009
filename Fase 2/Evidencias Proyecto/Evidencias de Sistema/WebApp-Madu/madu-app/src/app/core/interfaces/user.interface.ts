// src/app/core/interfaces/user.interface.ts

export enum UserRole {
  ADMIN = 'Admin',
  EMPLEADOR = 'Empleador',
  EMPLEADO = 'Empleado',
  USUARIO = 'Usuario'
}

export enum Gender {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  OTRO = 'Otro',
  NO_ESPECIFICA = 'Prefiero no especificar'
}

export enum AccountStatus {
  ACTIVA = 'Activa',
  INACTIVA = 'Inactiva',
  PENDIENTE = 'Pendiente',
  BLOQUEADA = 'Bloqueada'
}

export interface User {
  uid?: string;
  nombres: string;
  apellidos: string;
  password?: string;
  email: string;
  telefono: string;
  region: string;
  ciudad: string;
  rut: string;
  rol: UserRole;
  genero: Gender;
  estadoCuenta: AccountStatus;
  fechaCreacion: Date;
  ultimoAcceso: Date;
}

export interface Empleador extends User {
  nombreEmpresa: string;
  rutEmpresa: string;
  direccionEmpresa: string;
  sectorIndustrial: string;
  sitioWeb?: string;
  descripcionEmpresa: string;
}

export interface Empleado extends User {
  curriculum: string;
  experienciaLaboral: string[];
  educacion: string[];
  habilidades: string[];
  disponibilidadInmediata: boolean;
}

export interface UserSignUpBasic {
  email: string;
  password: string;
}