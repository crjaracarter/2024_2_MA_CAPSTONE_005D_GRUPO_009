import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { JobApplication } from '../../../core/interfaces/job-application/job-application.interface';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-application-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './application-success.component.html',
  styleUrl: './application-success.component.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})

export class ApplicationSuccessComponent implements OnInit {
  jobTitle: string = '';
  applicationData: any;
  application: JobApplication | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobOfferService: JobOfferService
  ) {}

  ngOnInit() {
    const applicationId = this.route.snapshot.params['id'];
    if (!applicationId) {
      this.error = 'No se encontró la postulación';
      this.isLoading = false;
      return;
    }

    this.loadApplication(applicationId);
  }

  private async loadApplication(applicationId: string) {
    try {
      this.isLoading = true;
      const application = await this.jobOfferService.getJobApplicationById(applicationId);
      if (application) {
        this.application = application;
      } else {
        this.error = 'No se encontró la postulación';
      }
    } catch (error) {
      console.error('Error loading application:', error);
      this.error = 'Error al cargar la postulación';
    } finally {
      this.isLoading = false;
    }
  }


  sendConfirmationEmail() {
    // Aquí implementarías la lógica para enviar el email
    console.log('Enviando email de confirmación...');
  }

  getFormattedKeys(): string[] {
    if (!this.applicationData) return [];
    return Object.keys(this.applicationData);
  }

  formatQuestionKey(key: string): string {
    if (key === 'coverLetter') return 'Carta de presentación';
    // Remover el prefijo 'question_' y formatear
    return key.replace('question_', 'Pregunta ');
  }
}
