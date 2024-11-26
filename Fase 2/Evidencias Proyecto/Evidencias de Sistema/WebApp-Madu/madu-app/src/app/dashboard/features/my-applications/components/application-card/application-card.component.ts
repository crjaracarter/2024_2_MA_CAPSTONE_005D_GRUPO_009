import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobApplication } from '../../../../../core/interfaces/job-application/job-application.interface';
import { ApplicationStatus } from '../../../../../core/interfaces/job-application/application-status.enum';

@Component({
  selector: 'app-application-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './application-card.component.html',
  styleUrl: './application-card.component.scss'
})

export class ApplicationCardComponent {
  @Input() application!: JobApplication;
  @Output() viewDetails = new EventEmitter<string>();

  // Traducciones de estados
  statusTranslations = {
    [ApplicationStatus.PENDING]: 'Pendiente',
    [ApplicationStatus.IN_REVIEW]: 'En Revisión',
    [ApplicationStatus.ACCEPTED]: 'Aceptada',
    [ApplicationStatus.REJECTED]: 'Rechazada'
  };

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

  onViewDetails(): void {
    this.viewDetails.emit(this.application.id);
  }
}
