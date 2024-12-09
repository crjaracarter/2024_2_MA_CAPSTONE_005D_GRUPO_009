import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import gsap from 'gsap';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Interfaces
import { Empresa } from '../../../core/interfaces/empresa.interface';

// Services
import { EmpresaService } from '../../../services/empresa/empresa.service';
import { AuthService } from '../../../auth/data-access/auth.service';

// Components
import { InformacionGeneralComponent } from './tabs/informacion-general/informacion-general.component';
import { EmpleadosComponent } from './tabs/empleados/empleados.component';
import { EstadisticasComponent } from './tabs/estadisticas/estadisticas.component';
import { DocumentosComponent } from './tabs/documentos/documentos.component';
import { OfertasComponent } from './tabs/ofertas/ofertas.component';
import { ConfiguracionComponent } from './tabs/configuracion/configuracion.component';
import { AsistenciasComponent } from './tabs/asistencias/asistencias.component';

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
    ConfiguracionComponent,
    AsistenciasComponent,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './mi-empresa.component.html',
  styleUrls: ['./mi-empresa.component.scss'],
  animations: [
    trigger('tabAnimation', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', 
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ]),
    trigger('slideDown', [
      state('void', style({ 
        transform: 'translateY(-10px)',
        opacity: 0 
      })),
      state('*', style({ 
        transform: 'translateY(0)',
        opacity: 1 
      })),
      transition('void => *', animate('200ms ease-out')),
      transition('* => void', animate('200ms ease-in'))
    ])
  ]
})
export class MiEmpresaComponent implements OnInit {
  @ViewChild('contentWrapper') contentWrapper!: ElementRef;
  
  // Services
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthService);
  
  // Component State
  empresa: Empresa | null = null;
  activeTab = 'info';
  loading = true;
  error: string | null = null;
  isMobileMenuOpen = false;
  
  // Tab Configuration
  tabs = [
    { 
      id: 'info', 
      label: 'Información General',
      icon: 'building'
    },
    { 
      id: 'empleados', 
      label: 'Empleados',
      icon: 'users'
    },
    { 
      id: 'stats', 
      label: 'Estadísticas',
      icon: 'chart-bar'
    },
    { 
      id: 'docs', 
      label: 'Documentos',
      icon: 'document'
    },
    { 
      id: 'ofertas', 
      label: 'Ofertas',
      icon: 'briefcase'
    },
    { 
      id: 'config', 
      label: 'Configuración',
      icon: 'cog'
    },
    { 
      id: 'asistencias', 
      label: 'Asistencias',
      icon: 'clock'
    }
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
    if (this.activeTab === tabId) return;
    
    gsap.to(this.contentWrapper.nativeElement, {
      opacity: 0,
      y: 20,
      duration: 0.2,
      onComplete: () => {
        this.activeTab = tabId;
        gsap.to(this.contentWrapper.nativeElement, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }

  setActiveTabMobile(tabId: string) {
    this.setActiveTab(tabId);
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  getCurrentTabLabel(): string {
    return this.tabs.find(tab => tab.id === this.activeTab)?.label || '';
  }

  getTabClasses(tabId: string): string {
    return `${tabId === this.activeTab ? 'text-[#C2AFFF] border-[#C2AFFF]' : 'text-white/70 border-transparent hover:text-white'} 
            transition-all duration-300`;
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

  reloadData() {
    this.loadEmpresa();
  }

  closeError() {
    this.error = null;
  }

  // Lifecycle hooks
  ngOnDestroy() {
    // Cleanup any subscriptions or timers if needed
  }
}