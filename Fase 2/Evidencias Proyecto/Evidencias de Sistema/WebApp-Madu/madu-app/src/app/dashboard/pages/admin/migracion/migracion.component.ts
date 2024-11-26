// src/app/dashboard/pages/admin/migracion/migracion.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresaService } from '../../../../services/empresa/empresa.service';

@Component({
  selector: 'app-migracion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-6">Herramienta de Migración</h2>
      
      <!-- Estado actual -->
      <div class="mb-6 p-4 bg-gray-50 rounded">
        <h3 class="font-semibold mb-2">Estado Actual:</h3>
        <p *ngIf="!estado">Cargando estado...</p>
        <div *ngIf="estado">
          <p>Total Empleadores: {{estado.totalEmpleadores}}</p>
          <p>Total Empresas: {{estado.totalEmpresas}}</p>
          <p>Faltantes por migrar: {{estado.faltantes}}</p>
        </div>
      </div>

      <!-- Resultados de la migración -->
      <div *ngIf="resultado" class="mb-6 p-4 bg-green-50 rounded">
        <h3 class="font-semibold mb-2">Resultados:</h3>
        <p>Empresas creadas: {{resultado.creados}}</p>
        <p>Ya existentes: {{resultado.yaExistentes}}</p>
        <p>Errores: {{resultado.errores}}</p>
      </div>

      <!-- Botón de migración -->
      <button 
        (click)="ejecutarMigracion()"
        [disabled]="migrando"
        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400">
        {{migrando ? 'Migrando...' : 'Iniciar Migración'}}
      </button>
    </div>
  `
})
export class MigracionComponent {
  private empresaService = inject(EmpresaService);
  
  estado: { totalEmpleadores: number; totalEmpresas: number; faltantes: number; } | null = null;
  resultado: { creados: number; yaExistentes: number; errores: number; } | null = null;
  migrando = false;

  ngOnInit() {
    this.verificarEstado();
  }

  async verificarEstado() {
    this.estado = await this.empresaService.verificarEstadoMigracion();
  }

  async ejecutarMigracion() {
    if (this.migrando) return;

    try {
      this.migrando = true;
      this.resultado = await this.empresaService.migrarEmpleadoresExistentes();
      await this.verificarEstado();
    } catch (error) {
      console.error('Error en la migración:', error);
    } finally {
      this.migrando = false;
    }
  }
}