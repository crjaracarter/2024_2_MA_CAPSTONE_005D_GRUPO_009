// src/app/dashboard/pages/mi-empresa/tabs/asistencias/asistencias.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../../../../services/asistencia/asistencia.service';
import { Empresa } from '../../../../../core/interfaces/empresa.interface';
import { Asistencia } from '../../../../../core/interfaces/asistencia.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResumenAsistencia {
  total: number;
  presentes: number;
  completados: number;
  ausentes: number;
}

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencias.component.html',
  styleUrls: ['./asistencias.component.scss'],
})
export class AsistenciasComponent implements OnInit {
  @Input() empresa!: any;

  asistencias$!: Observable<any[]>;
  resumenDia$!: Observable<any>;
  selectedMonth: Date = new Date();
  empleadoSeleccionado: string = '';
  empleados: any[] = [];
  cargando: boolean = true;

  constructor(private asistenciaService: AsistenciaService) {}

  ngOnInit() {
    if (this.empresa) {
      console.log('Empresa:', this.empresa);
      
      // Verificar si la empresa tiene empleados
      if (this.empresa.empleados?.length) {
        console.log('Empleados de la empresa:', this.empresa.empleados);
        this.cargarDatos();
      } else {
        console.log('La empresa no tiene empleados registrados');
      }
    }
  }

  cargarDatos() {
    this.cargando = true;

    if (!this.empresa?.id) {
      console.log('No hay ID de empresa para cargar datos');
      return;
    }
    
    console.log('Cargando datos para empresa:', this.empresa.id);
    this.cargando = true;
    
    // Suscripción explícita para debug
    this.asistencias$ = this.asistenciaService.obtenerAsistenciasMensuales(
      this.empresa.id,
      this.selectedMonth
    ).pipe(
      map(asistencias => {
        this.cargando = false;
        console.log('Asistencias cargadas:', asistencias);
        return asistencias;
      })
    );

    this.asistencias$.subscribe({
      next: (data) => console.log('Datos recibidos:', data),
      error: (error) => console.error('Error:', error)
    });
  }

  cambiarMes(delta: number) {
    this.selectedMonth = new Date(
      this.selectedMonth.getFullYear(),
      this.selectedMonth.getMonth() + delta,
      1
    );
    this.cargarDatos();
  }

  filtrarPorEmpleado() {
    if (!this.empresa?.id) return;

    this.cargando = true;
    if (this.empleadoSeleccionado) {
      this.asistencias$ = this.asistenciaService
        .obtenerAsistenciasEmpleado(
          this.empresa.id,
          this.empleadoSeleccionado,
          this.selectedMonth
        )
        .pipe(
          map((asistencias) => {
            this.cargando = false;
            return asistencias;
          })
        );
    } else {
      this.cargarDatos();
    }
  }

  exportarReporte() {
    if (!this.empresa?.id) return;

    const filtros = {
      fechaInicio: new Date(
        this.selectedMonth.getFullYear(),
        this.selectedMonth.getMonth(),
        1
      ),
      fechaFin: new Date(
        this.selectedMonth.getFullYear(),
        this.selectedMonth.getMonth() + 1,
        0
      ),
      empleadoId: this.empleadoSeleccionado || undefined,
    };

    this.asistenciaService
      .exportarReporteAsistencias(this.empresa.id, filtros)
      .subscribe((datos) => {
        if (datos.length > 0) {
          this.descargarCSV(datos);
        }
      });
  }

  private descargarCSV(datos: any[]) {
    const headers = Object.keys(datos[0]);
    const csvContent = [
      headers.join(','),
      ...datos.map((row) =>
        headers.map((header) => `"${row[header] || ''}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `asistencias-${
      this.selectedMonth.toISOString().split('T')[0]
    }.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  formatearHora(fecha: any): string {
    if (!fecha) return '-';

    try {
      const fechaObj = fecha.seconds
        ? new Date(fecha.seconds * 1000)
        : new Date(fecha);
      return fechaObj.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error al formatear hora:', error);
      return '-';
    }
  }

  calcularDuracion(entrada: any, salida: any): string {
    if (!entrada || !salida) return '-';

    try {
      const entradaObj = entrada.seconds
        ? new Date(entrada.seconds * 1000)
        : new Date(entrada);
      const salidaObj = salida.seconds
        ? new Date(salida.seconds * 1000)
        : new Date(salida);

      const duracionMs = salidaObj.getTime() - entradaObj.getTime();
      const horas = Math.floor(duracionMs / (1000 * 60 * 60));
      const minutos = Math.floor((duracionMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${horas}h ${minutos}m`;
    } catch (error) {
      console.error('Error al calcular duración:', error);
      return '-';
    }
  }
}
