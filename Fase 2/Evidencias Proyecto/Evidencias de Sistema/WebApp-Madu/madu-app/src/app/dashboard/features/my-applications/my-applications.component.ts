import { Component, OnInit } from '@angular/core';
import { JobApplication } from '../../../core/interfaces/job-application/job-application.interface';
import { JobApplicationService } from '../../../services/job-application/job-application.service';
import { ApplicationStatus } from '../../../core/interfaces/job-application/application-status.enum';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApplicationCardComponent } from './components/application-card/application-card.component';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule, ApplicationCardComponent],
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.scss',
})

export class MyApplicationsComponent implements OnInit {
  applications: JobApplication[] = [];
  filteredApplications: JobApplication[] = [];
  isLoading = true;
  error: string | null = null;
  selectedStatus: ApplicationStatus | 'all' = 'all';
  ApplicationStatus = ApplicationStatus;

  applicationStatuses: (ApplicationStatus | 'all')[] = [
    'all',
    ApplicationStatus.PENDING,
    ApplicationStatus.IN_REVIEW,
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
  ];

  // Añadimos un mapa para las traducciones
  statusTranslations = {
    all: 'Todas',
    [ApplicationStatus.PENDING]: 'Pendiente',
    [ApplicationStatus.IN_REVIEW]: 'En Revisión',
    [ApplicationStatus.ACCEPTED]: 'Aceptada',
    [ApplicationStatus.REJECTED]: 'Rechazada',
  };

  constructor(
    private jobApplicationService: JobApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  async loadApplications(): Promise<void> {
    try {
      this.isLoading = true;
      this.applications =
        await this.jobApplicationService.getUserApplications();
      this.filterApplications();
    } catch (err) {
      this.error = 'Error al cargar las postulaciones';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  filterApplications(): void {
    this.filteredApplications =
      this.selectedStatus === 'all'
        ? this.applications
        : this.applications.filter((app) => app.status === this.selectedStatus);
  }

  onStatusFilterChange(status: ApplicationStatus | 'all'): void {
    this.selectedStatus = status;
    this.filterApplications();
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<ApplicationStatus, string> = {
      [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ApplicationStatus.IN_REVIEW]: 'bg-blue-100 text-blue-800',
      [ApplicationStatus.ACCEPTED]: 'bg-green-100 text-green-800',
      [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
    };
    return statusClasses[status as ApplicationStatus] || '';
  }

  // Modificar el método getStatusTranslation para aceptar string
  getStatusTranslation(status: string | ApplicationStatus): string {
    return (
      this.statusTranslations[status as ApplicationStatus | 'all'] || status
    );
  }

  onViewApplicationDetails(applicationId: string): void {
    // Navegar al detalle
    this.router.navigate(['/dashboard/my-applications', applicationId]);
  }
}
