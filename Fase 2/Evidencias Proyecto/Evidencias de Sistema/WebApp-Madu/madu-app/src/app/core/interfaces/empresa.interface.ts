// src/app/core/interfaces/empresa.interface.ts

export interface Empresa {
    id?: string;
    empleadorId: string;
    nombreEmpresa: string;
    rutEmpresa: string;
    direccionEmpresa: string;
    sectorIndustrial: string;
    sitioWeb?: string;
    descripcionEmpresa: string;
    logo?: string;
    empleados?: string[]; // Array de IDs de empleados
    documentos?: {
      nombre: string;
      url: string;
      fecha: Date;
    }[];
    fechaCreacion: Date;
    fechaActualizacion: Date;
  }