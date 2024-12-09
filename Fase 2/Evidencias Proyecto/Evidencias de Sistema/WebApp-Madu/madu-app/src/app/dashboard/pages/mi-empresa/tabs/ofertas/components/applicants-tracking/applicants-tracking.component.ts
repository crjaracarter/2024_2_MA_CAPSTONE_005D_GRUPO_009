// applicants-tracking.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApplicationStatus } from '../../../../../../../core/interfaces/job-application/application-status.enum';
import { JobApplication } from '../../../../../../../core/interfaces/job-application/job-application.interface';
import { JobApplicationService } from '../../../../../../../services/job-application/job-application.service';


@Component({
  selector: 'app-applicants-tracking',
  templateUrl: './applicants-tracking.component.html',
  styleUrls: ['./applicants-tracking.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTooltipModule
  ]
})
export class ApplicantsTrackingComponent implements OnInit {
  @Input() jobOfferId!: string;
  
  applicants: JobApplication[] = [];
  filteredApplicants: JobApplication[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  
  displayedColumns: string[] = [
    'applicant',
    'appliedDate',
    'status',
    'evaluation',
    'actions'
  ];

  readonly applicationStatuses = [
    { value: ApplicationStatus.PENDING, label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: ApplicationStatus.REVIEWING, label: 'En Revisión', color: 'bg-blue-100 text-blue-800' },
    { value: ApplicationStatus.INTERVIEWED, label: 'Entrevistado', color: 'bg-purple-100 text-purple-800' },
    { value: ApplicationStatus.ACCEPTED, label: 'Aceptado', color: 'bg-green-100 text-green-800' },
    { value: ApplicationStatus.REJECTED, label: 'Rechazado', color: 'bg-red-100 text-red-800' }
  ];

  constructor(private jobApplicationService: JobApplicationService) {}

  ngOnInit() {
    this.loadApplications();
  }

  async loadApplications() {
    try {
      const applications = await this.jobApplicationService.getApplicationsByJobOffer(this.jobOfferId);
      this.applicants = applications;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  }

  applyFilters() {
    let filtered = [...this.applicants];

    // Aplicar filtro de búsqueda
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.employeeData?.nombres?.toLowerCase().includes(searchLower) ||
        app.employeeData?.apellidos?.toLowerCase().includes(searchLower) ||
        app.employeeData?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtro de estado
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === this.selectedStatus);
    }

    this.filteredApplicants = filtered;
  }

  async updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
    try {
      await this.jobApplicationService.updateApplicationStatus(applicationId, newStatus);
      await this.loadApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  }

  getStatusColor(status: string): string {
    const statusInfo = this.applicationStatuses.find(s => s.value === status);
    return statusInfo?.color || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTimeSinceApplication(appliedAt: Date): string {
    const now = new Date();
    const applied = new Date(appliedAt);
    const diffDays = Math.floor((now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  }

  downloadCV(cvUrl: string, applicantName: string) {
    // Implementar lógica de descarga del CV
    console.log(`Descargando CV de ${applicantName}`);
  }

  async scheduleInterview(applicationId: string) {
    // Implementar lógica para agendar entrevista
    console.log(`Agendando entrevista para aplicación ${applicationId}`);
  }

  get ratingArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  shouldFillStar(star: number, score: number | undefined): boolean {
    return star <= (score || 0);
  }
  getStatusLabel(status: string): string {
    return this.applicationStatuses.find(s => s.value === status)?.label || status;
  }

  // Ayudante para manejar nulls en las urls
  getApplicationDetailUrl(applicationId: string): string[] {
    return ['/dashboard/applications', applicationId];
  }

  // Ayudante para verificar si una aplicación tiene el mismo estado
  isCurrentStatus(application: JobApplication, statusValue: string): boolean {
    return application.status === statusValue;
  }
}