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
  template: `
    <div class="min-h-screen">
      <div class="max-w-7xl mx-auto">
        <!-- Título con mejor contraste -->
        <h1 class="text-3xl font-bold mb-6 text-white drop-shadow-lg">
          Gestión de Postulaciones
        </h1>

        <!-- Selector de Ofertas modernizado -->
        <div class="mb-6 bg-white/10 backdrop-blur-md p-4 rounded-xl">
          <label class="block text-sm font-medium text-white mb-2">
            Seleccionar Oferta
          </label>
          <select
            [(ngModel)]="selectedJobOfferId"
            (change)="loadApplications()"
            class="block w-full rounded-lg border-0 bg-white/90 backdrop-blur-sm
               shadow-lg focus:ring-2 focus:ring-[#C2AFFF] focus:border-transparent
               transition-all duration-300"
          >
            <option value="">Todas las ofertas</option>
            <option *ngFor="let offer of jobOffers" [value]="offer.id">
              {{ offer.title }}
            </option>
          </select>
        </div>

        <!-- Filtros de Estado modernizados -->
        <div class="flex gap-3 mb-6">
          <button
            *ngFor="let status of ['all', 'pending', 'accepted', 'rejected']"
            (click)="filterByStatus(status)"
            [ngClass]="{
              'bg-[#C2AFFF] text-[#4B0082] shadow-lg transform scale-105':
                currentStatus === status,
              'bg-white/80 text-[#4B0082] hover:bg-[#C2AFFF] hover:scale-105':
                currentStatus !== status
            }"
            class="px-4 py-2 rounded-lg transition-all duration-300 font-medium"
          >
            {{ status | titlecase }}
          </button>
        </div>

        <!-- Tabla modernizada -->
        <div
          class="bg-white/95 backdrop-blur-md shadow-xl rounded-xl overflow-hidden"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-[#4B0082]/10">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-xs font-semibold text-[#4B0082] uppercase tracking-wider"
                >
                  Postulante
                </th>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-xs font-semibold text-[#4B0082] uppercase tracking-wider"
                >
                  Oferta
                </th>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-xs font-semibold text-[#4B0082] uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-xs font-semibold text-[#4B0082] uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-xs font-semibold text-[#4B0082] uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                *ngFor="let application of filteredApplications"
                class="hover:bg-[#C2AFFF]/10 transition-colors duration-200"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div
                        class="h-full w-full rounded-full bg-[#5A4FCF]/20 flex items-center justify-center"
                      >
                        <span class="text-[#4B0082] font-medium">
                          {{ application.employeeData?.nombres?.charAt(0) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-[#4B0082]">
                        {{ application.employeeData?.nombres }}
                        {{ application.employeeData?.apellidos }}
                      </div>
                      <div class="text-sm text-gray-600">
                        {{ application.employeeData?.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-[#4B0082]">
                    {{ application.jobTitle }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-[#4B0082]">
                    {{ application.appliedAt | date : 'dd/MM/yyyy' }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800':
                        application.status === 'pending',
                      'bg-green-100 text-green-800':
                        application.status === 'accepted',
                      'bg-red-100 text-red-800':
                        application.status === 'rejected'
                    }"
                  >
                    {{ application.status | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-3">
                    <button
                      *ngIf="application.status === 'pending'"
                      (click)="updateStatus(application.id!, 'accepted')"
                      class="text-sm px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
                    >
                      Aceptar
                    </button>
                    <button
                      *ngIf="application.status === 'pending'"
                      (click)="updateStatus(application.id!, 'rejected')"
                      class="text-sm px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                    >
                      Rechazar
                    </button>
                    <button
                      (click)="viewDetails(application)"
                      class="text-sm px-3 py-1 rounded-lg bg-[#5A4FCF] text-white hover:bg-[#4B0082] transition-colors duration-200"
                    >
                      Ver detalles
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      

      <!-- Modal mejorado -->
      <div
        *ngIf="selectedApplication"
        class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded-xl p-6 max-w-2xl w-full m-4 shadow-2xl transform transition-all duration-300"
        >
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-[#4B0082]">
              Detalles de la Postulación
            </h2>
            <button
              (click)="selectedApplication = null"
              class="rounded-full h-8 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors duration-200"
            >
              ✕
            </button>
          </div>

          <div class="space-y-6">
            <div class="bg-[#C2AFFF]/10 p-4 rounded-lg">
              <h3 class="font-medium text-[#4B0082] mb-2">Postulante</h3>
              <p class="text-gray-800">
                {{ selectedApplication.employeeData?.nombres }}
                {{ selectedApplication.employeeData?.apellidos }}
              </p>
              <p class="text-gray-600">
                {{ selectedApplication.employeeData?.email }}
              </p>
            </div>

            <div class="bg-[#C2AFFF]/10 p-4 rounded-lg">
              <h3 class="font-medium text-[#4B0082] mb-2">
                Carta de Presentación
              </h3>
              <p class="whitespace-pre-line text-gray-800">
                {{
                  selectedApplication.coverLetter ||
                    'No se incluyó carta de presentación'
                }}
              </p>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button
                (click)="selectedApplication = null"
                class="px-4 py-2 rounded-lg bg-[#5A4FCF] text-white hover:bg-[#4B0082] transition-all duration-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
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
