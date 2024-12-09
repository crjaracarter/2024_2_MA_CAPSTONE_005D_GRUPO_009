// src/app/core/interfaces/asistencia.interface.ts

export interface Asistencia {
    id?: string;
    usuarioId: string;
    nombreEmpleado: string;
    entrada: Date;
    salida: Date | null;
    fecha: string;
    ubicacionEntrada: {
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: number;
    };
    ubicacionSalida?: {
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: number;
    };
  }