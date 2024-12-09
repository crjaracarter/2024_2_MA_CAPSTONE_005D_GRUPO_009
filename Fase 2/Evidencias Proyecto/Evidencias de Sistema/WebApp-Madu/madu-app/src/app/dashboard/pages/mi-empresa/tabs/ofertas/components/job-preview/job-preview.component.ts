// job-preview.component.ts

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  JobOffer, 
  JobType, 
  WorkModality, 
  ExperienceLevel 
} from '../../../../../../../core/interfaces/job-offer/job-offer.interface';
import { FormQuestion } from '../../../../../../../core/interfaces/application-form/form-question.interface';
import { JobOfferService } from '../../../../../../../services/job-offer/job-offer.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-job-preview',
  templateUrl: './job-preview.component.html',
  styleUrls: ['./job-preview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,

  ]
})
export class JobPreviewComponent implements OnInit {
  @Input() jobOffer!: JobOffer;
  @Input() customQuestions: FormQuestion[] = [];
  @Output() preview = new EventEmitter<string>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private jobOfferService: JobOfferService
  ) {
    // Intentar obtener datos del state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['jobOffer']) {
      this.jobOffer = navigation.extras.state['jobOffer'];
    }
  }
  ngOnInit() {
    // Si no hay datos en el state, cargar por ID
    if (!this.jobOffer) {
      const jobOfferId = this.route.snapshot.paramMap.get('id');
      if (jobOfferId) {
        this.jobOfferService.getJobOfferById(jobOfferId)
          .then(offer => {
            if (offer) {
              this.jobOffer = offer;
            } else {
              // Manejar el caso de oferta no encontrada
            }
          })
          .catch(error => {
            console.error('Error loading job offer:', error);
          });
      }
    }
  }


  formatSalaryRange(): string {
    if (!this.jobOffer.salary.showInOffer) {
      return 'Salario a convenir';
    }

    const { min, max, currency, period } = this.jobOffer.salary;
    const periodMap = {
      'hourly': 'por hora',
      'monthly': 'mensual',
      'yearly': 'anual'
    };

    if (min === max) {
      return `${currency} ${min.toLocaleString()} ${periodMap[period]}`;
    }

    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} ${periodMap[period]}`;
  }

  getJobTypeLabel(type: JobType): string {
    const typeMap = {
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
      'contract': 'Contrato',
      'temporary': 'Temporal',
      'internship': 'Práctica'
    };
    return typeMap[type] || type;
  }

  getModalityLabel(modality: WorkModality): string {
    const modalityMap = {
      'on-site': 'Presencial',
      'remote': 'Remoto',
      'hybrid': 'Híbrido'
    };
    return modalityMap[modality] || modality;
  }

  getExperienceLevelLabel(level: ExperienceLevel): string {
    const levelMap = {
      'trainee': 'Trainee',
      'junior': 'Junior',
      'semi-senior': 'Semi-Senior',
      'senior': 'Senior',
      'lead': 'Lead',
      'manager': 'Gerente',
      'director': 'Director'
    };
    return levelMap[level] || level;
  }

  getDaysUntilDeadline(): number | null {
    if (!this.jobOffer.applicationDeadline) return null;
    
    const deadline = new Date(this.jobOffer.applicationDeadline);
    const today = new Date();
    const diffTime = Math.abs(deadline.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onPreview(): void {
    if (this.jobOffer?.id) {
      this.preview.emit(this.jobOffer.id);
    }
  }


}