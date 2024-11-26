import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JobApplication } from '../../../../../core/interfaces/job-application/job-application.interface';
import { JobApplicationService } from '../../../../../services/job-application/job-application.service';
import { ApplicationStatus } from '../../../../../core/interfaces/job-application/application-status.enum';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss'
})
export class ApplicationDetailComponent implements OnInit {
  application?: JobApplication;
  isLoading = true;
  error?: string;

  statusTranslations = {
    [ApplicationStatus.PENDING]: 'Pendiente',
    [ApplicationStatus.IN_REVIEW]: 'En Revisión',
    [ApplicationStatus.ACCEPTED]: 'Aceptada',
    [ApplicationStatus.REJECTED]: 'Rechazada'
  };

  constructor(
    private route: ActivatedRoute,
    private jobApplicationService: JobApplicationService
  ) {}

  ngOnInit(): void {
    const applicationId = this.route.snapshot.paramMap.get('id');
    if (applicationId) {
      this.loadApplication(applicationId);
    }
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<ApplicationStatus, string> = {
      [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ApplicationStatus.IN_REVIEW]: 'bg-blue-100 text-blue-800',
      [ApplicationStatus.ACCEPTED]: 'bg-green-100 text-green-800',
      [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800'
    };
    return statusClasses[status as ApplicationStatus] || '';
  }

  getStatusTranslation(status: string): string {
    return this.statusTranslations[status as ApplicationStatus] || status;
  }

  private async loadApplication(id: string): Promise<void> {
    try {
      this.isLoading = true;
      // Necesitaremos implementar este método en el servicio
      // this.application = await this.jobApplicationService.getApplicationById(id);
    } catch (error) {
      this.error = 'Error al cargar los detalles de la postulación';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}
