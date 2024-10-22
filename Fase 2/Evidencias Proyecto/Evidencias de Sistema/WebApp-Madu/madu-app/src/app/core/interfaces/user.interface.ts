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
  
  export enum UserRole {
    EMPLEADOR = 'Empleador',
    EMPLEADO = 'Empleado',
    USUARIO = 'Usuario',
    SUPER_ADMIN = 'Super Admin'
  }
  
  export enum Gender {
    MASCULINO = 'Masculino',
    FEMENINO = 'Femenino',
    OTRO = 'Otro',
    NO_ESPECIFICA = 'Prefiero no especificar'
  }
  
  export enum AccountStatus {
    ACTIVA = 'Activa',
    BLOQUEADA = 'Bloqueada',
    ELIMINADA = 'Eliminada'
  }