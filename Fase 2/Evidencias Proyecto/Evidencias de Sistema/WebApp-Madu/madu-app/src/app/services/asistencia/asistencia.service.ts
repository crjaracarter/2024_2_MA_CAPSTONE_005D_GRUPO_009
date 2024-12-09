// src/app/services/asistencia/asistencia.service.ts

import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  CollectionReference,
  Query, 
  addDoc
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AsistenciaFiltros {
  fechaInicio?: Date;
  fechaFin?: Date;
  empleadoId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  constructor(private firestore: Firestore) {}

  // Obtener todas las asistencias de los empleados de una empresa específica
  obtenerAsistenciasPorEmpresa(empresaId: string, filtros?: AsistenciaFiltros): Observable<any[]> {
    const asistenciaRef = collection(this.firestore, 'asistencia');
    
    console.log('Consultando asistencias para empresa:', empresaId);
    console.log('Filtros aplicados:', filtros);
  
    let constraints: any[] = [
      where('empresaId', '==', empresaId)
    ];
  
    if (filtros?.fechaInicio) {
      console.log('Filtro fecha inicio:', filtros.fechaInicio);
      constraints.push(where('fecha', '>=', filtros.fechaInicio.toISOString().split('T')[0]));
    }
  
    if (filtros?.fechaFin) {
      console.log('Filtro fecha fin:', filtros.fechaFin);
      constraints.push(where('fecha', '<=', filtros.fechaFin.toISOString().split('T')[0]));
    }
  
    if (filtros?.empleadoId) {
      console.log('Filtro empleado:', filtros.empleadoId);
      constraints.push(where('usuarioId', '==', filtros.empleadoId));
    }
  
    // Añadir orderBy al final
    constraints.push(orderBy('fecha', 'desc'));
  
    const q = query(asistenciaRef, ...constraints);
  
    return from(getDocs(q)).pipe(
      map(snapshot => {
        console.log('Documentos encontrados:', snapshot.size);
        if (snapshot.empty) {
          console.log('No se encontraron registros de asistencia');
          return [];
        }
        
        const asistencias = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Asistencias recuperadas:', asistencias);
        return asistencias;
      })
    );
  }

  // Obtener asistencias del mes actual para una empresa
  obtenerAsistenciasMensuales(empresa: any, mes: Date): Observable<any[]> {
    const primerDiaMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const ultimoDiaMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);
  
    const fechaInicio = primerDiaMes.toISOString().split('T')[0];
    const fechaFin = ultimoDiaMes.toISOString().split('T')[0];
  
    console.log('Buscando asistencias entre:', fechaInicio, 'y', fechaFin);
  
    const asistenciaRef = collection(this.firestore, 'asistencia');

    return this.obtenerAsistenciasPorEmpresa(empresa, {
      fechaInicio: primerDiaMes,
      fechaFin: ultimoDiaMes
    });
  }

  // Obtener asistencias por empleado específico
  obtenerAsistenciasEmpleado(empresaId: string, empleadoId: string, mes: Date): Observable<any[]> {
    const primerDiaMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const ultimoDiaMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);

    return this.obtenerAsistenciasPorEmpresa(empresaId, {
      fechaInicio: primerDiaMes,
      fechaFin: ultimoDiaMes,
      empleadoId: empleadoId
    });
  }

  // Obtener resumen de asistencias para dashboard
  obtenerResumenAsistencias(empresa: any, fecha: Date): Observable<any> {
    const fechaStr = fecha.toISOString().split('T')[0];
    const asistenciaRef = collection(this.firestore, 'asistencia');
    const q = query(
      asistenciaRef,
      where('fecha', '==', fechaStr)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const asistencias = snapshot.docs.map(doc => doc.data());
        return {
          total: asistencias.length,
          presentes: asistencias.filter(a => a['entrada'] && !a['salida']).length,
          completados: asistencias.filter(a => a['entrada'] && a['salida']).length,
          ausentes: 0 // Este valor deberás calcularlo según tu lógica de negocio
        };
      })
    );
  }

  // Exportar reporte de asistencias
  exportarReporteAsistencias(empresaId: string, filtros: AsistenciaFiltros): Observable<any[]> {
    return this.obtenerAsistenciasPorEmpresa(empresaId, filtros).pipe(
      map(asistencias => {
        return asistencias.map(asistencia => ({
          Empleado: asistencia.nombreEmpleado,
          Fecha: asistencia.fecha,
          Entrada: asistencia.entrada ? new Date(asistencia.entrada.seconds * 1000).toLocaleTimeString() : '-',
          Salida: asistencia.salida ? new Date(asistencia.salida.seconds * 1000).toLocaleTimeString() : '-',
          Estado: asistencia.salida ? 'Completado' : 'En curso'
        }));
      })
    );
  }

}