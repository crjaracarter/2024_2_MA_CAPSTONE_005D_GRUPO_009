// mis-postulaciones.component.ts
import { Component, OnInit } from '@angular/core';
import { JobApplicationService } from '../../../services/job-application/job-application.service';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { JobApplication } from '../../../core/interfaces/job-application/job-application.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface EnrichedJobApplication extends JobApplication {
  offerTitle?: string;
  companyName?: string;
  jobType?: string;
  jobModality?: string;
}

@Component({
  selector: 'app-mis-postulaciones',
  templateUrl: './mis-postulaciones.component.html',
  styleUrls: ['./mis-postulaciones.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MisPostulacionesComponent implements OnInit {
  applications: EnrichedJobApplication[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private jobApplicationService: JobApplicationService,
    private jobOfferService: JobOfferService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  async loadApplications(): Promise<void> {
    try {
      this.isLoading = true;
      const apps = await this.jobApplicationService.getUserApplications();
      
      // Enriquecer las aplicaciones con datos de las ofertas
      const enrichedApps = await Promise.all(
        apps.map(async (app) => {
          try {
            const jobOffer = await this.jobOfferService.getJobOfferById(app.jobOfferId);
            return {
              ...app,
              appliedAt: this.toDate(app.appliedAt),
              updatedAt: this.toDate(app.updatedAt),
              createdAt: this.toDate(app.createdAt),
              offerTitle: jobOffer?.title || 'Sin título',
              companyName: jobOffer?.companyName || 'Empresa no especificada',
              jobType: jobOffer?.type,
              jobModality: jobOffer?.modality
            };
          } catch (error) {
            console.error('Error fetching job offer details:', error);
            return {
              ...app,
              appliedAt: this.toDate(app.appliedAt),
              updatedAt: this.toDate(app.updatedAt),
              createdAt: this.toDate(app.createdAt),
              offerTitle: 'Sin título',
              companyName: 'Empresa no especificada'
            };
          }
        })
      );

      this.applications = enrichedApps.sort((a, b) => 
        this.toDate(b.appliedAt).getTime() - this.toDate(a.appliedAt).getTime()
      );
    } catch (error) {
      this.error = 'Error al cargar las postulaciones';
      console.error('Error loading applications:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private toDate(date: any): Date {
    if (date instanceof Date) return date;
    if (date?.toDate) return date.toDate();
    if (date?.seconds) return new Date(date.seconds * 1000);
    if (typeof date === 'string') return new Date(date);
    return new Date();
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    } as const;

    return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const statusTexts = {
      'pending': 'Pendiente',
      'accepted': 'Aceptado',
      'rejected': 'Rechazado'
    };
    return statusTexts[status as keyof typeof statusTexts] || 'Pendiente';
  }

  formatDate(date: Date | any): string {
    const validDate = this.toDate(date);
    return validDate.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async deleteApplication(applicationId: string): Promise<void> {
    if (confirm('¿Estás seguro que deseas eliminar esta postulación?')) {
      try {
        await this.jobApplicationService.deleteApplication(applicationId);
        this.applications = this.applications.filter(app => app.id !== applicationId);
      } catch (error) {
        console.error('Error deleting application:', error);
        this.error = 'Error al eliminar la postulación';
      }
    }
  }

  getJobTypeText(type: string | undefined): string {
    if (!type) return 'No especificado';
    
    const typeTexts = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      'contract': 'Contrato',
      'temporary': 'Temporal',
      'internship': 'Práctica'
    };
    
    return typeTexts[type as keyof typeof typeTexts] || type;
  }

  getModalityText(modality: string | undefined): string {
    if (!modality) return 'No especificado';
    
    const modalityTexts = {
      'on-site': 'Presencial',
      'remote': 'Remoto',
      'hybrid': 'Híbrido'
    };
    
    return modalityTexts[modality as keyof typeof modalityTexts] || modality;
  }
}