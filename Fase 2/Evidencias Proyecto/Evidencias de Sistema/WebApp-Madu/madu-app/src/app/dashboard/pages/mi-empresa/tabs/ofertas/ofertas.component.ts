// src/app/dashboard/pages/mi-empresa/tabs/ofertas/ofertas.component.ts

import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Servicios
import { JobOfferService } from '../../../../../services/job-offer/job-offer.service';
import { AuthService } from '../../../../../auth/data-access/auth.service';
import { NotificationService } from '../../../../../core/notification/notification.service';
import { EmpresaService } from '../../../../../services/empresa/empresa.service';

// Interfaces
import { JobOffer, JobOfferStatus, JobType, WorkModality } from '../../../../../core/interfaces/job-offer/job-offer.interface';
import { User } from '../../../../../core/interfaces/user.interface';
import { Empresa } from '../../../../../core/interfaces/empresa.interface';

// Componentes
import { JobOfferFormComponent } from './components/job-offer-form/job-offer-form.component';
import { CustomQuestionsBuilderComponent } from './components/custom-questions-builder/custom-questions-builder.component';
import { JobPreviewComponent } from './components/job-preview/job-preview.component';
import { JobOfferCardComponent } from './components/job-offer-card/job-offer-card.component';
import { ApplicantsTrackingComponent } from './components/applicants-tracking/applicants-tracking.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    JobOfferFormComponent,
    CustomQuestionsBuilderComponent,
    JobPreviewComponent,
    JobOfferCardComponent,
    ApplicantsTrackingComponent,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.scss']
})
export class OfertasComponent implements OnInit, OnDestroy {
  @Input() empresa: Empresa | null = null;
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private jobOfferService = inject(JobOfferService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private empresaService = inject(EmpresaService);
  

  // Estados del componente
  isLoading = false;
  showCreateModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  selectedOffer: JobOffer | null = null;
  currentUser: User | null = null;
  empresaActual: Empresa | null = null;
  empresaId: string = '';

  // Datos y filtros
  jobOffers: JobOffer[] = [];
  filteredOffers: JobOffer[] = [];
  searchTerm = '';
  selectedStatus: JobOfferStatus | 'all' = 'all';
  selectedDepartment = 'all';
  sortBy: 'date' | 'applications' | 'status' = 'date';

  // Estadísticas
  statistics = {
    total: 0,
    active: 0,
    paused: 0,
    closed: 0,
    totalApplications: 0
  };

  // Filtros y opciones
  statusOptions = Object.values(JobOfferStatus);
  departmentOptions = [
    'Todos',
    'Tecnología',
    'Marketing',
    'Ventas',
    'Recursos Humanos',
    'Operaciones',
    'Finanzas',
    'Administración'
  ];

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadJobOffers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    console.log('Iniciando loadCurrentUser');
    this.authService.getUserData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          console.log('Usuario cargado:', user);
          this.currentUser = user;
          if (user?.uid) {
            // Cargar la empresa del usuario
            this.empresaService.getEmpresaByEmpleadorId(user.uid)
              .then(empresa => {
                if (empresa?.id) {
                  this.empresaActual = empresa;
                  // Ahora puedes declarar empresaId como propiedad de la clase
                  this.empresaId = empresa.id;
                  this.loadJobOffers();
                }
              })
              .catch(error => {
                console.error('Error al cargar empresa:', error);
                this.notificationService.error('Error al cargar datos de la empresa');
              });
          }
        },
        error: (error) => {
          console.error('Error en loadCurrentUser:', error);
          this.notificationService.error('Error al cargar datos del usuario');
        }
      });
  }

  private loadJobOffers(): void {
    console.log('Iniciando loadJobOffers');
    if (!this.currentUser?.uid) {
      console.log('No hay UID de usuario disponible');
      return;
    }

    this.isLoading = true;
    console.log('Buscando ofertas para UID:', this.currentUser.uid);

    this.jobOfferService.getJobOffersByEmployer(this.currentUser.uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (offers) => {
          console.log('Ofertas recibidas:', offers);
          this.jobOffers = offers;
          this.updateStatistics();
          this.applyFilters();
          console.log('Ofertas filtradas:', this.filteredOffers);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error en loadJobOffers:', error);
          this.notificationService.error('Error al cargar ofertas laborales');
          this.isLoading = false;
        }
      });
  }

  private updateStatistics(): void {
    this.statistics = {
      total: this.jobOffers.length,
      active: this.jobOffers.filter(o => o.status === JobOfferStatus.PUBLISHED).length,
      paused: this.jobOffers.filter(o => o.status === JobOfferStatus.PAUSED).length,
      closed: this.jobOffers.filter(o => o.status === JobOfferStatus.CLOSED).length,
      totalApplications: this.jobOffers.reduce((acc, curr) => acc + (curr.metrics?.applications || 0), 0)
    };
  }

  applyFilters(): void {
    this.filteredOffers = this.jobOffers.filter(offer => {
      const matchesSearch = this.searchTerm ? 
        offer.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(this.searchTerm.toLowerCase()) : 
        true;

      const matchesStatus = this.selectedStatus === 'all' ? 
        true : 
        offer.status === this.selectedStatus;

      const matchesDepartment = this.selectedDepartment === 'all' ? 
        true : 
        offer.department === this.selectedDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });

    this.sortOffers();
  }

  private sortOffers(): void {
    this.filteredOffers.sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0);
        case 'applications':
          return (b.metrics?.applications || 0) - (a.metrics?.applications || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }

  // Acciones de ofertas
  openCreateModal(): void {
    this.showCreateModal = true;
  }

  openEditModal(event: {id: string, offer: JobOffer}): void {
    this.selectedOffer = event.offer;
    this.showEditModal = true;
  }

  confirmDelete(event: {id: string, offer: JobOffer}): void {
    this.selectedOffer = event.offer;
    this.showDeleteConfirm = true;
    // Aquí podrías mostrar un diálogo de confirmación
  }

  async deleteOffer(): Promise<void> {
    if (!this.selectedOffer?.id) return;
  
    try {
      await this.jobOfferService.deleteJobOffer(this.selectedOffer.id);
      this.notificationService.success('Oferta eliminada exitosamente');
      this.loadJobOffers();
    } catch (error) {
      this.notificationService.error('Error al eliminar la oferta');
      console.error('Error deleting offer:', error);
    } finally {
      this.showDeleteConfirm = false;
      this.selectedOffer = null;
    }
  }

  async toggleOfferStatus(event: {id: string, offer: JobOffer, status: JobOfferStatus}): Promise<void> {
    try {
      await this.jobOfferService.updateJobOffer(event.id, { status: event.status });
      this.notificationService.success('Estado de la oferta actualizado');
      this.loadJobOffers();
    } catch (error) {
      this.notificationService.error('Error al actualizar el estado');
      console.error('Error updating offer status:', error);
    }
  }

  // Manejadores de modales
  handleCreateSuccess(): void {
    this.showCreateModal = false;
    
    this.loadJobOffers();
    this.notificationService.success('Oferta creada exitosamente');
  }

  handleEditSuccess(): void {
    this.showEditModal = false;
    this.selectedOffer = null;
    this.loadJobOffers();
    this.notificationService.success('Oferta actualizada exitosamente');
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteConfirm = false;
    this.selectedOffer = null;
  }

  openPreview(jobOfferId: string): void {
    this.router.navigate(['/dashboard/mi-empresa/ofertas', jobOfferId, 'preview']);
  }

  viewApplications(jobOfferId: string): void {
    this.router.navigate(['/dashboard/mi-empresa/ofertas', jobOfferId, 'applications']);
  }

  async onDuplicate(jobOfferId: string): Promise<void> {
    try {
      const originalOffer = await this.jobOfferService.getJobOfferById(jobOfferId);
      if (originalOffer && this.empresaActual) {
        if (!this.empresaActual?.id) {
          throw new Error('No se encontró una empresa actual válida');
        }
        const duplicatedOffer = {
          ...originalOffer,
          title: `${originalOffer.title} (Copia)`,
          empresaId: this.empresaActual.id,
          status: JobOfferStatus.DRAFT,
          createdAt: new Date(),
          updatedAt: new Date(),
          metrics: {
            views: 0,
            applications: 0,
            shares: 0
          }
        };
        delete (duplicatedOffer as any).id;
        
        await this.jobOfferService.createJobOffer(duplicatedOffer);
        this.notificationService.success('Oferta duplicada exitosamente');
        this.loadJobOffers();
      }
    } catch (error) {
      console.error('Error al duplicar oferta:', error);
      this.notificationService.error('Error al duplicar la oferta');
    }
  }
}