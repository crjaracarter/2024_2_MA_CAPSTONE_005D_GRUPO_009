import { Component, OnInit  } from '@angular/core';
import { JobOfferService } from '../../../../../services/job-offer/job-offer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../../auth/data-access/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JobOffer} from '../../../../../core/interfaces/job-offer/job-offer.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserRole, Empleador, User, Empleado } from '../../../../../core/interfaces/user.interface';
import { JobApplication } from '../../../../../core/interfaces/job-application/job-application.interface';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Gestión de Postulaciones</h1>

        <!-- Selector de Ofertas -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Oferta
          </label>
          <select 
            [(ngModel)]="selectedJobOfferId"
            (change)="loadApplications()"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Todas las ofertas</option>
            <option *ngFor="let offer of jobOffers" [value]="offer.id">
              {{offer.title}}
            </option>
          </select>
        </div>

        <!-- Filtros de Estado -->
        <div class="flex gap-4 mb-6">
          <button 
            *ngFor="let status of ['all', 'pending', 'accepted', 'rejected']"
            (click)="filterByStatus(status)"
            [class.bg-blue-600]="currentStatus === status"
            [class.text-white]="currentStatus === status"
            class="px-4 py-2 rounded-lg border hover:bg-blue-50">
            {{status | titlecase}}
          </button>
        </div>

        <!-- Lista de Postulaciones -->
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Postulante
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oferta
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let application of filteredApplications">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{application.employeeData?.nombres}} {{application.employeeData?.apellidos}}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{application.employeeData?.email}}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{application.jobTitle}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{application.appliedAt | date:'dd/MM/yyyy'}}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(application.status)">
                    {{application.status | titlecase}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex gap-2">
                    <button 
                      *ngIf="application.status === 'pending'"
                      (click)="updateStatus(application.id!, 'accepted')"
                      class="text-green-600 hover:text-green-900">
                      Aceptar
                    </button>
                    <button 
                      *ngIf="application.status === 'pending'"
                      (click)="updateStatus(application.id!, 'rejected')"
                      class="text-red-600 hover:text-red-900">
                      Rechazar
                    </button>
                    <button
                      (click)="viewDetails(application)"
                      class="text-blue-600 hover:text-blue-900">
                      Ver detalles
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Detalles -->
      <div *ngIf="selectedApplication" 
           class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-bold">Detalles de la Postulación</h2>
            <button (click)="selectedApplication = null" 
                    class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <h3 class="font-medium">Postulante</h3>
              <p>{{selectedApplication.employeeData?.nombres}} {{selectedApplication.employeeData?.apellidos}}</p>
              <p class="text-gray-600">{{selectedApplication.employeeData?.email}}</p>
            </div>

            <div>
              <h3 class="font-medium">Carta de Presentación</h3>
              <p class="whitespace-pre-line">{{selectedApplication.coverLetter || 'No se incluyó carta de presentación'}}</p>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button (click)="selectedApplication = null"
                      class="px-4 py-2 border rounded-md">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './job-applications.component.scss'
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
    this.authService.getUserData().subscribe(user => {
      if (user?.rol !== UserRole.EMPLEADOR) {
        // Redirigir si no es empleador
      }
    });
  }

  private async loadEmployerOffers() {
    this.authService.getUserData().subscribe(async user => {
      if (user && user.uid) {
        this.jobOffers = await this.jobOfferService.getJobOffersByEmployerId(user.uid);
        this.loadApplications();
      }
    });
  }

  async loadApplications() {
    const user = await new Promise<User | null>(resolve => {
      this.authService.getUserData().subscribe(user => resolve(user));
    });
  
    if (!user) return;
  
    if (this.selectedJobOfferId) {
      this.applications = await this.jobOfferService.getApplicationsByJobOffer(this.selectedJobOfferId);
    } else {
      // Cargar todas las aplicaciones del empleador
      if (user.uid) {
        this.applications = await this.jobOfferService.getAllEmployerApplications(user.uid);
      }
    }
    this.filterApplications();
  }

  filterByStatus(status: string) {
    this.currentStatus = status;
    this.filterApplications();
  }

  private filterApplications() {
    this.filteredApplications = this.applications.filter(app => {
      if (this.currentStatus === 'all') return true;
      return app.status === this.currentStatus;
    });
  }

  async updateStatus(applicationId: string, newStatus: 'accepted' | 'rejected') {
    try {
      await this.jobOfferService.updateApplicationStatus(applicationId, newStatus);
      await this.loadApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  }

  viewDetails(application: JobApplication) {
    this.selectedApplication = application;
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ';
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
