import { Component, OnInit } from '@angular/core';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobOffer } from '../../../core/interfaces/job-offer/job-offer.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  UserRole,
  Empleador,
  User,
  Empleado,
} from '../../../core/interfaces/user.interface';
import { JobApplication } from '../../../core/interfaces/job-application/job-application.interface';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(20px)' })
        ),
      ]),
    ]),
    trigger('staggeredFade', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('50ms', [
              animate(
                '400ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  templateUrl: './job-applications.component.html',
  styleUrl: './job-applications.component.scss',
})
export class JobApplicationsComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  applications: JobApplication[] = [];
  filteredApplications: JobApplication[] = [];
  selectedJobOfferId: string = '';
  currentStatus: string = 'all';
  selectedApplication: JobApplication | null = null;

  constructor(
    private jobOfferService: JobOfferService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkUserAccess();
    this.loadEmployerOffers();
  }

  private async checkUserAccess() {
    this.authService.getUserData().subscribe((user) => {
      if (user?.rol !== UserRole.EMPLEADOR) {
        // Redirigir si no es empleador
      }
    });
  }

  private async loadEmployerOffers() {
    this.authService.getUserData().subscribe(async (user) => {
      if (user && user.uid) {
        this.jobOffers = await this.jobOfferService.getJobOffersByEmployerId(
          user.uid
        );
        this.loadApplications();
      }
    });
  }

  async loadApplications() {
    const user = await new Promise<User | null>((resolve) => {
      this.authService.getUserData().subscribe((user) => resolve(user));
    });

    if (!user || !user.uid) {
      console.log('No hay usuario autenticado o no tiene uid');
      return;
    }

    try {
      if (this.selectedJobOfferId) {
        console.log(
          'Cargando aplicaciones para la oferta:',
          this.selectedJobOfferId
        );
        this.applications =
          await this.jobOfferService.getApplicationsByJobOffer(
            this.selectedJobOfferId
          );
      } else {
        console.log('Cargando todas las aplicaciones del empleador:', user.uid);
        this.applications =
          await this.jobOfferService.getAllEmployerApplications(user.uid);
      }

      console.log('Aplicaciones cargadas:', this.applications);
      this.filterApplications();
    } catch (error) {
      console.error('Error al cargar las aplicaciones:', error);
    }
  }

  filterByStatus(status: string) {
    this.currentStatus = status;
    this.filterApplications();
  }

  private filterApplications() {
    this.filteredApplications = this.applications.filter((app) => {
      if (this.currentStatus === 'all') return true;
      return app.status === this.currentStatus;
    });
  }

  async updateStatus(
    applicationId: string,
    newStatus: 'accepted' | 'rejected'
  ) {
    try {
      await this.jobOfferService.updateApplicationStatus(
        applicationId,
        newStatus
      );
      await this.loadApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  }

  viewDetails(application: JobApplication) {
    this.selectedApplication = application;
  }

  getStatusClass(status: string): string {
    const baseClasses =
      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ';
    switch (status) {
      case 'pending':
        return baseClasses + 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return baseClasses + 'bg-green-100 text-green-800';
      case 'rejected':
        return baseClasses + 'bg-red-100 text-red-800';
      default:
        return baseClasses + 'bg-gray-100 text-gray-800';
    }
  }
}
