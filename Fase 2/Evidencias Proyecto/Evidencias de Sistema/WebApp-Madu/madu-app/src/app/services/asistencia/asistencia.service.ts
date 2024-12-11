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
  addDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';import { Asistencia } from '../../core/interfaces/asistencia.interface';

export interface AsistenciaFiltros {
  fechaInicio?: Date;
  fechaFin?: Date;
  empleadoId?: string;
  empresaId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  constructor(private firestore: Firestore) {}

  // Obtener la asistencia del día actual para un empleado
  obtenerAsistenciaHoy(empleadoId: string, fecha: string): Observable<Asistencia | null> {
    const asistenciaRef = collection(this.firestore, 'asistencia');
    const q = query(
      asistenciaRef,
      where('usuarioId', '==', empleadoId),
      where('fecha', '==', fecha)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Asistencia;
      }),
      catchError(error => {
        console.error('Error al obtener asistencia del día:', error);
        return throwError(() => error);
      })
    );
  }

  // Registrar entrada de un empleado
  async registrarEntrada(asistencia: Partial<Asistencia>): Promise<string> {
    try {
      const asistenciaRef = collection(this.firestore, 'asistencia');
      const docRef = await addDoc(asistenciaRef, {
        ...asistencia,
        entrada: Timestamp.fromDate(asistencia.entrada as Date),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al registrar entrada:', error);
      throw error;
    }
  }

  // Registrar salida de un empleado
  async registrarSalida(asistenciaId: string, ubicacionSalida: any): Promise<void> {
    try {
      const asistenciaRef = doc(this.firestore, 'asistencia', asistenciaId);
      await updateDoc(asistenciaRef, {
        salida: Timestamp.now(),
        ubicacionSalida,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error al registrar salida:', error);
      throw error;
    }
  }

  // Obtener asistencias por empleado con filtros
  obtenerAsistenciasPorEmpleado(
    empleadoId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Observable<Asistencia[]> {
    const asistenciaRef = collection(this.firestore, 'asistencia');
    const q = query(
      asistenciaRef,
      where('usuarioId', '==', empleadoId),
      where('fecha', '>=', fechaInicio.toISOString().split('T')[0]),
      where('fecha', '<=', fechaFin.toISOString().split('T')[0]),
      orderBy('fecha', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          entrada: doc.data()['entrada']?.toDate(),
          salida: doc.data()['salida']?.toDate()
        })) as Asistencia[];
      }),
      catchError(error => {
        console.error('Error al obtener asistencias:', error);
        return throwError(() => error);
      })
    );
  }

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