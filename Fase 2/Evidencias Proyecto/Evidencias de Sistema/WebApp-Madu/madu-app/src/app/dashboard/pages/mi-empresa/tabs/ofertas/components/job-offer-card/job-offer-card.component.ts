// job-offer-card.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import {
  JobOffer,
  JobOfferStatus,
} from '../../../../../../../core/interfaces/job-offer/job-offer.interface';

@Component({
  selector: 'app-job-offer-card',
  templateUrl: './job-offer-card.component.html',
  styleUrls: ['./job-offer-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
  ],
})
export class JobOfferCardComponent {
  @Input() jobOffer!: JobOffer;
  @Output() edit = new EventEmitter<{ id: string; offer: JobOffer }>();
  @Output() delete = new EventEmitter<{ id: string; offer: JobOffer }>();
  @Output() statusChange = new EventEmitter<{
    id: string;
    offer: JobOffer;
    status: JobOfferStatus;
  }>();
  @Output() duplicate = new EventEmitter<string>();
  @Output() viewApplications = new EventEmitter<string>();
  @Output() preview = new EventEmitter<string>();

  readonly JobOfferStatus = JobOfferStatus;

  getStatusColor(status: JobOfferStatus): string {
    const statusColors = {
      [JobOfferStatus.PUBLISHED]: 'bg-green-100 text-green-800',
      [JobOfferStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [JobOfferStatus.PAUSED]: 'bg-yellow-100 text-yellow-800',
      [JobOfferStatus.CLOSED]: 'bg-red-100 text-red-800',
      [JobOfferStatus.ARCHIVED]: 'bg-purple-100 text-purple-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: JobOfferStatus): string {
    const statusLabels = {
      [JobOfferStatus.PUBLISHED]: 'Publicada',
      [JobOfferStatus.DRAFT]: 'Borrador',
      [JobOfferStatus.PAUSED]: 'Pausada',
      [JobOfferStatus.CLOSED]: 'Cerrada',
      [JobOfferStatus.ARCHIVED]: 'Archivada',
    };
    return statusLabels[status] || status;
  }

  formatDate(date: Date | any): string {
    try {
      // Si es un Timestamp de Firebase, convertirlo a Date
      if (date && typeof date.toDate === 'function') {
        date = date.toDate();
      }

      // Si es string, convertir a Date
      if (typeof date === 'string') {
        date = new Date(date);
      }

      // Verificar si es una fecha válida
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'No disponible';
      }

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'No disponible';
    }
  }

  getDaysRemaining(): number | null {
    if (!this.jobOffer.expiresAt) return null;
    const now = new Date();
    const expiresAt = new Date(this.jobOffer.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  onStatusChange(status: JobOfferStatus) {
    if (this.jobOffer?.id) {
      this.statusChange.emit({
        id: this.jobOffer.id,
        offer: this.jobOffer,
        status,
      });
    }
  }

  onEdit(): void {
    if (this.jobOffer?.id) {
      this.edit.emit({
        id: this.jobOffer.id,
        offer: this.jobOffer
      });
    }
  }

  onDelete(): void {
    if (this.jobOffer?.id) {
      this.delete.emit({
        id: this.jobOffer.id,
        offer: this.jobOffer
      });
    }
  }

  onDuplicate() {
    if (this.jobOffer?.id) {
      this.duplicate.emit(this.jobOffer.id);
    }
  }
  onViewApplications(): void {
    if (this.jobOffer?.id) {
      this.viewApplications.emit(this.jobOffer.id);
    }
  }

  onPreview(): void {
    if (this.jobOffer?.id) {
      this.preview.emit(this.jobOffer.id);
    }
  }
}
