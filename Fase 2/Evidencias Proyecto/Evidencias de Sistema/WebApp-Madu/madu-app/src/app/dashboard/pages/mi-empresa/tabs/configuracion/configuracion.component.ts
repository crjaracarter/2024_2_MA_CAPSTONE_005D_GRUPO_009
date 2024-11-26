// src/app/dashboard/pages/mi-empresa/tabs/configuracion/configuracion.component.ts

import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Empresa } from '../../../../../core/interfaces/empresa.interface';

interface NotificacionConfig {
  id: string;
  titulo: string;
  descripcion: string;
  habilitado: boolean;
}

interface ConfiguracionEmpresa {
  notificaciones: {
    email: boolean;
    pushWeb: boolean;
    frecuencia: string;
  };
  privacidad: {
    perfilPublico: boolean;
    mostrarEstadisticas: boolean;
    mostrarEmpleados: boolean;
  };
  reclutamiento: {
    permitirPostulacionesExternas: boolean;
    requerirCV: boolean;
    preguntasPersonalizadas: boolean;
  };
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  @Input() empresa: Empresa | null = null;
  
  private fb = inject(FormBuilder);
  
  configForm: FormGroup;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  notificacionesConfig: NotificacionConfig[] = [
    {
      id: 'nuevasPostulaciones',
      titulo: 'Nuevas Postulaciones',
      descripcion: 'Recibe notificaciones cuando alguien postule a tus ofertas laborales',
      habilitado: true
    },
    {
      id: 'actualizacionesPostulantes',
      titulo: 'Actualizaciones de Postulantes',
      descripcion: 'Recibe notificaciones cuando los postulantes actualicen su información',
      habilitado: true
    },
    {
      id: 'recordatoriosEntrevistas',
      titulo: 'Recordatorios de Entrevistas',
      descripcion: 'Recibe recordatorios de entrevistas programadas',
      habilitado: true
    },
    {
      id: 'vencimientoOfertas',
      titulo: 'Vencimiento de Ofertas',
      descripcion: 'Recibe alertas cuando tus ofertas laborales estén por vencer',
      habilitado: true
    }
  ];

  constructor() {
    this.configForm = this.fb.group({
      notificaciones: this.fb.group({
        email: [true],
        pushWeb: [true],
        frecuencia: ['inmediata']
      }),
      privacidad: this.fb.group({
        perfilPublico: [true],
        mostrarEstadisticas: [true],
        mostrarEmpleados: [true]
      }),
      reclutamiento: this.fb.group({
        permitirPostulacionesExternas: [true],
        requerirCV: [true],
        preguntasPersonalizadas: [true]
      })
    });
  }

  ngOnInit() {
    this.cargarConfiguracion();
  }

  async cargarConfiguracion() {
    if (!this.empresa?.id) return;

    try {
      // Aquí iría la lógica para cargar la configuración desde Firebase
      const configuracionInicial: ConfiguracionEmpresa = {
        notificaciones: {
          email: true,
          pushWeb: true,
          frecuencia: 'inmediata'
        },
        privacidad: {
          perfilPublico: true,
          mostrarEstadisticas: true,
          mostrarEmpleados: true
        },
        reclutamiento: {
          permitirPostulacionesExternas: true,
          requerirCV: true,
          preguntasPersonalizadas: true
        }
      };

      this.configForm.patchValue(configuracionInicial);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      this.mostrarError('Error al cargar la configuración');
    }
  }

  async guardarConfiguracion() {
    if (this.configForm.invalid) return;

    try {
      this.guardando = true;
      // Aquí iría la lógica para guardar en Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      
      this.mostrarExito('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      this.mostrarError('Error al guardar la configuración');
    } finally {
      this.guardando = false;
    }
  }

  async toggleNotificacion(notificacion: NotificacionConfig) {
    notificacion.habilitado = !notificacion.habilitado;
    try {
      // Aquí iría la lógica para actualizar en Firebase
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulación
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      notificacion.habilitado = !notificacion.habilitado; // Revertir cambio
      this.mostrarError('Error al actualizar la configuración de notificaciones');
    }
  }

  private mostrarExito(mensaje: string) {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 3000);
  }

  private mostrarError(mensaje: string) {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 3000);
  }
}