// src/app/dashboard/pages/mi-empresa/tabs/ofertas/ofertas.component.ts

import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Empresa } from '../../../../../core/interfaces/empresa.interface';

interface OfertaLaboral {
  id: string;
  titulo: string;
  descripcion: string;
  departamento: string;
  tipoContrato: string;
  modalidad: string;
  salario: {
    rango: {
      min: number;
      max: number;
    };
    moneda: string;
    periodo: string;
  };
  requisitos: string[];
  estado: 'activa' | 'pausada' | 'cerrada';
  fechaPublicacion: Date;
  fechaCierre?: Date;
  ubicacion: string;
  postulaciones: number;
  destacada: boolean;
}

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.scss']
})
export class OfertasComponent implements OnInit {
  @Input() empresa: Empresa | null = null;

  ofertas: OfertaLaboral[] = [];
  filtroEstado: string = 'todas';
  filtroDepartamento: string = 'todos';
  ordenarPor: string = 'fecha';
  busqueda: string = '';
  cargando: boolean = false;
  mostrarModal: boolean = false;
  ofertaSeleccionada: OfertaLaboral | null = null;

  departamentos = [
    'Todos',
    'Tecnología',
    'Recursos Humanos',
    'Ventas',
    'Marketing',
    'Operaciones',
    'Finanzas',
    'Administración'
  ];

  estadosOferta = [
    { valor: 'todas', etiqueta: 'Todas' },
    { valor: 'activa', etiqueta: 'Activas' },
    { valor: 'pausada', etiqueta: 'Pausadas' },
    { valor: 'cerrada', etiqueta: 'Cerradas' }
  ];

  opcionesOrden = [
    { valor: 'fecha', etiqueta: 'Fecha de publicación' },
    { valor: 'postulaciones', etiqueta: 'Número de postulaciones' },
    { valor: 'titulo', etiqueta: 'Título' }
  ];

  ngOnInit() {
    this.cargarOfertas();
  }

  async cargarOfertas() {
    try {
      this.cargando = true;
      // Aquí iría la lógica para cargar ofertas desde Firebase
      // Por ahora usamos datos de ejemplo
      this.ofertas = [
        {
          id: '1',
          titulo: 'Desarrollador Full Stack',
          descripcion: 'Buscamos desarrollador full stack con experiencia en Angular y Node.js',
          departamento: 'Tecnología',
          tipoContrato: 'Indefinido',
          modalidad: 'Remoto',
          salario: {
            rango: {
              min: 1500000,
              max: 2500000
            },
            moneda: 'CLP',
            periodo: 'mensual'
          },
          requisitos: [
            '3+ años de experiencia en desarrollo web',
            'Conocimientos en Angular',
            'Experiencia con bases de datos SQL y NoSQL'
          ],
          estado: 'activa',
          fechaPublicacion: new Date(),
          ubicacion: 'Santiago, Chile',
          postulaciones: 12,
          destacada: true
        }
        // Aquí irían más ofertas
      ];
    } catch (error) {
      console.error('Error al cargar ofertas:', error);
    } finally {
      this.cargando = false;
    }
  }

  filtrarOfertas(): OfertaLaboral[] {
    return this.ofertas.filter(oferta => {
      const cumpleFiltroEstado = this.filtroEstado === 'todas' || oferta.estado === this.filtroEstado;
      const cumpleFiltroDepartamento = this.filtroDepartamento === 'todos' || 
                                     oferta.departamento === this.filtroDepartamento;
      const cumpleBusqueda = oferta.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                            oferta.descripcion.toLowerCase().includes(this.busqueda.toLowerCase());
      return cumpleFiltroEstado && cumpleFiltroDepartamento && cumpleBusqueda;
    }).sort((a, b) => this.ordenarOfertas(a, b));
  }

  ordenarOfertas(a: OfertaLaboral, b: OfertaLaboral): number {
    switch (this.ordenarPor) {
      case 'fecha':
        return b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime();
      case 'postulaciones':
        return b.postulaciones - a.postulaciones;
      case 'titulo':
        return a.titulo.localeCompare(b.titulo);
      default:
        return 0;
    }
  }

  async toggleEstadoOferta(oferta: OfertaLaboral) {
    const nuevoEstado = oferta.estado === 'activa' ? 'pausada' : 'activa';
    try {
      // Aquí iría la lógica para actualizar en Firebase
      oferta.estado = nuevoEstado;
    } catch (error) {
      console.error('Error al actualizar estado de la oferta:', error);
    }
  }

  async destacarOferta(oferta: OfertaLaboral) {
    try {
      // Aquí iría la lógica para actualizar en Firebase
      oferta.destacada = !oferta.destacada;
    } catch (error) {
      console.error('Error al destacar oferta:', error);
    }
  }

  async eliminarOferta(oferta: OfertaLaboral) {
    if (confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      try {
        // Aquí iría la lógica para eliminar en Firebase
        this.ofertas = this.ofertas.filter(o => o.id !== oferta.id);
      } catch (error) {
        console.error('Error al eliminar oferta:', error);
      }
    }
  }

  abrirDetalles(oferta: OfertaLaboral) {
    this.ofertaSeleccionada = oferta;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.ofertaSeleccionada = null;
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearSalario(salario: OfertaLaboral['salario']): string {
    const formatearNumero = (num: number) => 
      new Intl.NumberFormat('es-CL', { 
        style: 'currency', 
        currency: salario.moneda 
      }).format(num);

    return `${formatearNumero(salario.rango.min)} - ${formatearNumero(salario.rango.max)} ${salario.periodo}`;
  }

  obtenerColorEstado(estado: string): string {
    const colores = {
      'activa': 'bg-green-100 text-green-800',
      'pausada': 'bg-yellow-100 text-yellow-800',
      'cerrada': 'bg-red-100 text-red-800'
    };
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  }
}