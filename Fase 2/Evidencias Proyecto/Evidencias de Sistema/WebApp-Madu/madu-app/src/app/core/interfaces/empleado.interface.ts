import { Gender, UserRole, AccountStatus } from './user.interface';

export interface Empleado {
  id?: string;
  nombres: string;
  apellidos: string;
  email: string;
  rut: string;
  telefono: string;
  region: string;
  ciudad: string;
  genero: Gender;
  rol: UserRole;
  estadoCuenta: AccountStatus;
  curriculum?: string;
  experienciaLaboral: ExperienciaLaboral[];
  educacion: Educacion[];
  habilidades: string[];
  disponibilidadInmediata: boolean;
  empresaId: string;
  fechaCreacion?: Date;
}

export interface ExperienciaLaboral {
  empresa: string;
  cargo: string;
  fechaInicio: Date;
  fechaFin?: Date;
  descripcion: string;
}

export interface Educacion {
  institucion: string;
  titulo: string;
  fechaInicio: Date;
  fechaFin?: Date;
  descripcion?: string;
}