import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Empresa } from '../../../core/interfaces/empresa.interface';
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { InformacionGeneralComponent } from './tabs/informacion-general/informacion-general.component';
import { EmpleadosComponent } from './tabs/empleados/empleados.component';
import { EstadisticasComponent } from './tabs/estadisticas/estadisticas.component';
import { DocumentosComponent } from './tabs/documentos/documentos.component';
import { OfertasComponent } from './tabs/ofertas/ofertas.component';
import { ConfiguracionComponent } from './tabs/configuracion/configuracion.component';

@Component({
  selector: 'app-mi-empresa',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InformacionGeneralComponent,
    EmpleadosComponent,
    EstadisticasComponent,
    DocumentosComponent,
    OfertasComponent,
    ConfiguracionComponent
  ],
  templateUrl: './mi-empresa.component.html',
  styleUrls: ['./mi-empresa.component.scss']
})
export class MiEmpresaComponent implements OnInit {
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthService);
  
  empresa: Empresa | null = null;
  activeTab = 'info';
  loading = true;
  error: string | null = null;
  
  tabs = [
    { id: 'info', label: 'Información' },
    { id: 'empleados', label: 'Empleados' },
    { id: 'stats', label: 'Estadísticas' },
    { id: 'docs', label: 'Documentos' },
    { id: 'ofertas', label: 'Ofertas Laborales' },
    { id: 'config', label: 'Configuración' }
  ];

  ngOnInit() {
    this.loadEmpresa();
  }

  async loadEmpresa() {
    try {
      this.loading = true;
      this.error = null;
      
      const user = await this.authService.getCurrentUser();
      if (!user) {
        this.error = 'No se encontró un usuario autenticado';
        return;
      }

      console.log('Cargando empresa para empleador:', user.uid);
      this.empresa = await this.empresaService.getEmpresaByEmpleadorId(user.uid);
      
      if (!this.empresa) {
        this.error = 'No se encontró información de la empresa';
      }
    } catch (error) {
      console.error('Error al cargar la empresa:', error);
      this.error = 'Error al cargar la información de la empresa';
    } finally {
      this.loading = false;
    }
  }

  setActiveTab(tabId: string) {
    this.loading = true;
    this.activeTab = tabId;
    setTimeout(() => this.loading = false, 200);
  }

  getTabClasses(tabId: string): string {
    const baseClasses = `
      relative min-w-0 flex-1 overflow-hidden px-4 py-3 
      text-sm font-medium text-center 
      focus:z-10 focus:outline-none
      transition-all duration-200 ease-in-out
    `;

    const activeClasses = `text-[#5A4FCF]`;
    const inactiveClasses = `text-[#7D7D7D] hover:text-[#8A8EF2]`;

    return `${baseClasses} ${tabId === this.activeTab ? activeClasses : inactiveClasses}`;
  }

  async onEmpresaUpdated(updatedEmpresa: Partial<Empresa>) {
    try {
      if (this.empresa?.id) {
        await this.empresaService.updateEmpresa(this.empresa.id, updatedEmpresa);
        await this.loadEmpresa();
      }
    } catch (error) {
      console.error('Error al actualizar la empresa:', error);
      this.error = 'Error al actualizar la información de la empresa';
    }
  }
}