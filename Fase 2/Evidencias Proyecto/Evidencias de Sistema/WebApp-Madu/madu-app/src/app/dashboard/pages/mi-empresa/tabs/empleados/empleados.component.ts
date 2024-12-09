// src/app/dashboard/pages/mi-empresa/tabs/empleados/empleados.component.ts

import { Component, Input, OnInit, inject, OnDestroy  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Empresa } from '../../../../../core/interfaces/empresa.interface';
import { Empleado, UserRole } from '../../../../../core/interfaces/user.interface';
import { UserService } from '../../../../../services/user/user.service';
import { EmpresaService } from '../../../../../services/empresa/empresa.service';
import { Subscription } from 'rxjs';
import { CrearEmpleadoModalComponent } from './components/crear-empleado-modal/crear-empleado-modal.component';
import { AuthService } from '../../../../../auth/data-access/auth.service';



interface EmpleadoConAcciones extends Empleado {
  acciones?: {
    puedeEditar: boolean;
    puedeEliminar: boolean;
  };
}

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearEmpleadoModalComponent],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.scss']
})
export class EmpleadosComponent implements OnInit, OnDestroy {
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
  error: string | null = null;
  private subscriptions: Subscription = new Subscription();
  protected Math = Math;
  showCrearModal = false;

  constructor(
    private userService: UserService,
    private empresaService: EmpresaService,
    private authService: AuthService
  ) {}

  mostrarModalCrearEmpleado() {
    this.showCrearModal = true;
  }

  ngOnInit() {
    if (this.empresa?.id) {
      this.cargarEmpleados();
    }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async cargarEmpleados() {
    try {
      this.cargando = true;
      this.error = null;

      if (!this.empresa?.id) {
        throw new Error('ID de empresa no disponible');
      }

      // Obtener IDs de empleados de la empresa
      const empleadosIds = await this.empresaService.getEmpleadosByEmpresaId(this.empresa.id);
      const empleadosPromises = empleadosIds.map(async (id) => {
        const empleado = await this.userService.getUserById(id);
        if (empleado && empleado.rol === UserRole.EMPLEADO) {
          return {
            ...empleado,
            acciones: {
              puedeEditar: true, // Aquí puedes implementar lógica de permisos
              puedeEliminar: true
            }
          } as EmpleadoConAcciones;
        }
        return null;
      });
  
      const empleados = (await Promise.all(empleadosPromises))
        .filter((emp): emp is EmpleadoConAcciones => emp !== null);
  
      this.empleados = empleados;
      this.totalEmpleados = empleados.length;
      
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      this.error = 'Error al cargar los empleados';
    } finally {
      this.cargando = false;
    }
  }

  async eliminarEmpleado(empleado: EmpleadoConAcciones) {
    if (!empleado.uid || !this.empresa?.id) return;

    if (confirm(`¿Estás seguro de que deseas eliminar a ${empleado.nombres} ${empleado.apellidos}?`)) {
      try {
        await this.empresaService.removeEmpleadoFromEmpresa(this.empresa.id, empleado.uid);
        this.empleados = this.empleados.filter(e => e.uid !== empleado.uid);
        this.totalEmpleados--;
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
        this.error = 'Error al eliminar el empleado';
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
    if (!(fecha instanceof Date)) {
      fecha = new Date(fecha);
    }
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  async crearEmpleado(empleadoData: any) {
    try {
      if (!this.empresa?.id) {
        throw new Error('ID de empresa no disponible');
      }
  
      // Crear el empleado usando AuthService
      const resultado = await this.authService.signUpEmpleado(empleadoData);
      
      // Actualizar la empresa con el nuevo empleado
      if (resultado.user?.uid) {
        const empresaActual = await this.empresaService.getEmpleadosByEmpresaId(this.empresa.id);
        await this.empresaService.updateEmpresa(this.empresa.id, {
          empleados: [...empresaActual, resultado.user.uid]
        });
        
        // Recargar la lista de empleados
        await this.cargarEmpleados();
      }
  
      this.showCrearModal = false;
    } catch (error) {
      console.error('Error al crear empleado:', error);
      this.error = 'Error al crear el empleado';
    }
  }
}