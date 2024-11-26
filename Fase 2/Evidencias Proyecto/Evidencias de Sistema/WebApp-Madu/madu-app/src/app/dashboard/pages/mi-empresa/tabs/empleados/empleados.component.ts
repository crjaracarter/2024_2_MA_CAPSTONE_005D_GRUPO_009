// src/app/dashboard/pages/mi-empresa/tabs/empleados/empleados.component.ts

import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Empresa } from '../../../../../core/interfaces/empresa.interface';
import { Empleado, UserRole } from '../../../../../core/interfaces/user.interface';

interface EmpleadoConAcciones extends Empleado {
  acciones?: {
    puedeEditar: boolean;
    puedeEliminar: boolean;
  };
}

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.scss']
})
export class EmpleadosComponent implements OnInit {
  @Input() empresa: Empresa | null = null;

  empleados: EmpleadoConAcciones[] = [];
  filtroNombre: string = '';
  mostrarInactivos: boolean = false;
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalEmpleados: number = 0;
  cargando: boolean = false;
  showModal: boolean = false;
  empleadoSeleccionado: EmpleadoConAcciones | null = null;
  protected Math = Math;

  async ngOnInit() {
    await this.cargarEmpleados();
  }

  async cargarEmpleados() {
    try {
      this.cargando = true;
      // Aquí iría la lógica para cargar empleados desde Firebase
      // Por ahora usaremos datos de ejemplo
      this.empleados = [
        {
          uid: '1',
          nombres: 'Juan',
          apellidos: 'Pérez',
          email: 'juan@ejemplo.com',
          telefono: '123456789',
          region: 'Metropolitana',
          ciudad: 'Santiago',
          rut: '12345678-9',
          rol: UserRole.EMPLEADO,
          genero: 'Masculino' as any,
          estadoCuenta: 'Activa' as any,
          fechaCreacion: new Date(),
          ultimoAcceso: new Date(),
          curriculum: 'url_curriculum',
          experienciaLaboral: ['Experiencia 1'],
          educacion: ['Educación 1'],
          habilidades: ['Habilidad 1'],
          disponibilidadInmediata: true,
          acciones: {
            puedeEditar: true,
            puedeEliminar: true
          }
        }
      ];
      this.totalEmpleados = this.empleados.length;
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    } finally {
      this.cargando = false;
    }
  }

  async eliminarEmpleado(empleado: EmpleadoConAcciones) {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${empleado.nombres} ${empleado.apellidos}?`)) {
      try {
        // Aquí iría la lógica para eliminar el empleado en Firebase
        this.empleados = this.empleados.filter(e => e.uid !== empleado.uid);
        this.totalEmpleados--;
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
      }
    }
  }

  filtrarEmpleados(): EmpleadoConAcciones[] {
    return this.empleados.filter(empleado => {
      const nombreCompleto = `${empleado.nombres} ${empleado.apellidos}`.toLowerCase();
      const filtro = this.filtroNombre.toLowerCase();
      const cumpleFiltroNombre = nombreCompleto.includes(filtro);
      const cumpleFiltroEstado = this.mostrarInactivos ? true : empleado.estadoCuenta === 'Activa';
      return cumpleFiltroNombre && cumpleFiltroEstado;
    });
  }

  obtenerEmpleadosPaginados(): EmpleadoConAcciones[] {
    const empleadosFiltrados = this.filtrarEmpleados();
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return empleadosFiltrados.slice(inicio, inicio + this.elementosPorPagina);
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
  }

  obtenerPaginas(): number[] {
    const totalPaginas = Math.ceil(this.filtrarEmpleados().length / this.elementosPorPagina);
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  abrirDetalles(empleado: EmpleadoConAcciones) {
    this.empleadoSeleccionado = empleado;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.empleadoSeleccionado = null;
  }

  formatFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}