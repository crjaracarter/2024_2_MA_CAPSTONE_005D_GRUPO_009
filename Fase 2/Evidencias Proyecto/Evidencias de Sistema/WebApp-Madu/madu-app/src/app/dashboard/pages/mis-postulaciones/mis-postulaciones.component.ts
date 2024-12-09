// mis-postulaciones.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplicationService } from '../../../services/job-application/job-application.service';
import { JobApplication } from '../../../core/interfaces/job-application/job-application.interface';
import { ApplicationStatus } from '../../../core/interfaces/job-application/application-status.enum';

@Component({
  selector: 'app-mis-postulaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-postulaciones.component.html',
  styleUrls: ['./mis-postulaciones.component.scss']
})
export class MisPostulacionesComponent implements OnInit {
  postulaciones: JobApplication[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private jobApplicationService: JobApplicationService) {}

  ngOnInit(): void {
    this.cargarPostulaciones();
  }

  async cargarPostulaciones(): Promise<void> {
    try {
      this.loading = true;
      this.postulaciones = await this.jobApplicationService.getUserApplications();
      this.loading = false;
    } catch (error) {
      this.error = 'Error al cargar las postulaciones';
      this.loading = false;
      console.error('Error:', error);
    }
  }

  getStatusText(status: 'pending' | 'accepted' | 'rejected'): string {
    const statusMap = {
      'pending': 'Pendiente',
      'accepted': 'Aceptada',
      'rejected': 'Rechazada'
    };
    return statusMap[status] || 'Desconocido';
}

  getStatusClass(status: 'pending' | 'accepted' | 'rejected'): string {
    const statusClasses = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'accepted': 'text-green-600 bg-green-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return statusClasses[status] || 'text-gray-600 bg-gray-100';
}


  formatDate(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}