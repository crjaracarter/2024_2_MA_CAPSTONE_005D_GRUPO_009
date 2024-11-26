// src/app/dashboard/pages/mi-empresa/tabs/estadisticas/estadisticas.component.ts

import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartConfiguration, ChartType } from 'chart.js';
import { Empresa } from '../../../../../core/interfaces/empresa.interface';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

interface ChartData {
  [key: string]: Chart<ChartType, any[], unknown>;
}
type ChartMap = {
  [key: string]: Chart<'line' | 'bar' | 'doughnut', number[], unknown>;
};




@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit {
  @Input() empresa: Empresa | null = null;

  // Estadísticas generales
  totalEmpleados: number = 0;
  empleadosActivos: number = 0;
  ofertasActivas: number = 0;
  postulacionesRecibidas: number = 0;
  

  // Para las gráficas
  charts: ChartMap = {};

  // Datos de ejemplo (en un caso real, estos vendrían de tu servicio)
  datosContrataciones = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    data: [4, 6, 3, 8, 5, 7]
  };

  datosPostulaciones = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    data: [15, 22, 18, 25, 30, 28]
  };

  distribucionDepartamentos = {
    labels: ['TI', 'RRHH', 'Ventas', 'Marketing', 'Operaciones'],
    data: [30, 15, 25, 10, 20]
  };

  ngOnInit() {
    this.cargarEstadisticas();
    this.inicializarGraficas();
  }

  async cargarEstadisticas() {
    try {
      // Aquí irían las llamadas a Firebase para obtener los datos reales
      this.totalEmpleados = 45;
      this.empleadosActivos = 42;
      this.ofertasActivas = 8;
      this.postulacionesRecibidas = 156;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  inicializarGraficas() {
    this.crearGraficaContrataciones();
    this.crearGraficaPostulaciones();
    this.crearGraficaDepartamentos();
  }

  crearGraficaContrataciones() {
    const ctx = document.getElementById('graficaContrataciones') as HTMLCanvasElement;
    if (!ctx) return;

    this.charts['contrataciones'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.datosContrataciones.labels,
        datasets: [{
          label: 'Contrataciones Mensuales',
          data: this.datosContrataciones.data,
          borderColor: '#5A4FCF',
          backgroundColor: 'rgba(90, 79, 207, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  crearGraficaPostulaciones() {
    const ctx = document.getElementById('graficaPostulaciones') as HTMLCanvasElement;
    if (!ctx) return;

    this.charts['postulaciones'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.datosPostulaciones.labels,
        datasets: [{
          label: 'Postulaciones Recibidas',
          data: this.datosPostulaciones.data,
          backgroundColor: '#4CAF50',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  crearGraficaDepartamentos() {
    const ctx = document.getElementById('graficaDepartamentos') as HTMLCanvasElement;
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.distribucionDepartamentos.labels,
        datasets: [{
          data: this.distribucionDepartamentos.data,
          backgroundColor: [
            '#4B0082',
            '#5A4FCF',
            '#8A8EF2',
            '#C2AFFF',
            '#4CAF50'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };

    this.charts['departamentos'] = new Chart(ctx, config);
  }

  ngOnDestroy() {
    // Destruir todas las gráficas al salir del componente
    Object.values(this.charts).forEach(chart => chart.destroy());
  }

  // Función auxiliar para formatear números grandes
  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-CL').format(num);
  }

  // Función para calcular el porcentaje de empleados activos
  calcularPorcentajeActivos(): number {
    return this.totalEmpleados > 0 
      ? Math.round((this.empleadosActivos / this.totalEmpleados) * 100) 
      : 0;
  }
}