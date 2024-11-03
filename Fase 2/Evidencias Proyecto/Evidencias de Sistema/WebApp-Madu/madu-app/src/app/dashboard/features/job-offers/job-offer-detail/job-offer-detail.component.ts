import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobOfferService } from '../../../../services/job-offer/job-offer.service';
import { AuthService } from '../../../../auth/data-access/auth.service';
import { JobOffer } from '../../../../core/interfaces/job-offer/job-offer.interface';
import { UserRole, Empleador, User } from '../../../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-offer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6" *ngIf="jobOffer">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <!-- Header -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{jobOffer.title}}</h1>
            <p class="text-xl text-gray-600">{{jobOffer.company}}</p>
          </div>
          <div *ngIf="isEmployer && jobOffer.employerId === currentUserId" 
               class="flex gap-2">
            <button (click)="editOffer()" 
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Editar
            </button>
            <button (click)="deleteOffer()" 
                    class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Eliminar
            </button>
          </div>
        </div>

        <!-- Detalles -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 class="text-xl font-semibold mb-3">Detalles del puesto</h2>
            <div class="space-y-2">
              <p><span class="font-medium">Ubicación:</span> {{jobOffer.location}}</p>
              <p><span class="font-medium">Tipo:</span> {{jobOffer.type}}</p>
              <p *ngIf="jobOffer.salary">
                <span class="font-medium">Salario:</span> 
                {{jobOffer.salary.min | currency}} - {{jobOffer.salary.max | currency}}
              </p>
            </div>
          </div>
          <div>
            <h2 class="text-xl font-semibold mb-3">Requisitos</h2>
            <ul class="list-disc list-inside space-y-1">
              <li *ngFor="let req of jobOffer.requirements">{{req}}</li>
            </ul>
          </div>
        </div>

        <!-- Descripción -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-3">Descripción del puesto</h2>
          <p class="text-gray-700 whitespace-pre-line">{{jobOffer.description}}</p>
        </div>

        <!-- Botón de postulación -->
        <div *ngIf="isEmpleado && !hasApplied" class="mt-6">
          <button (click)="applyToJob()" 
                  class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
            Postular a esta oferta
          </button>
        </div>

        <div *ngIf="hasApplied" class="mt-6">
          <p class="text-green-600 text-center font-medium">
            Ya has postulado a esta oferta
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrl: './job-offer-detail.component.scss'
})
export class JobOfferDetailComponent implements OnInit {
  jobOffer: JobOffer | null = null;
  currentUserId: string | null = null;
  isEmployer = false;
  isEmpleado = false;
  hasApplied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobOfferService: JobOfferService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadJobOffer();
    this.checkUserRole();
  }

  private async loadJobOffer() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const jobOffer = await this.jobOfferService.getJobOfferById(id);
      if (jobOffer) {
        this.jobOffer = jobOffer;
        this.checkIfUserHasApplied();
      } else {
        this.router.navigate(['/dashboard/job-offers']);
      }
    }
  }

  private async checkUserRole() {
    this.authService.getUserData().subscribe(user => {
      if (user) {
        this.currentUserId = user.uid ?? null;
        this.isEmployer = user.rol === UserRole.EMPLEADOR;
        this.isEmpleado = user.rol === UserRole.EMPLEADO;
      }
    });
  }

  private async checkIfUserHasApplied() {
    if (this.jobOffer && this.currentUserId) {
      this.hasApplied = this.jobOffer.applicants?.includes(this.currentUserId) || false;
    }
  }

  async applyToJob() {
    if (this.jobOffer?.id && this.currentUserId) {
      try {
        await this.jobOfferService.applyToJob(this.jobOffer.id, this.currentUserId);
        this.hasApplied = true;
      } catch (error) {
        console.error('Error applying to job:', error);
        // Implementar manejo de errores
      }
    }
  }

  editOffer() {
    if (this.jobOffer?.id) {
      this.router.navigate(['/dashboard/job-offers/edit', this.jobOffer.id]);
    }
  }

  async deleteOffer() {
    if (this.jobOffer?.id && confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      try {
        await this.jobOfferService.deleteJobOffer(this.jobOffer.id);
        this.router.navigate(['/dashboard/job-offers']);
      } catch (error) {
        console.error('Error deleting job offer:', error);
        // Implementar manejo de errores
      }
    }
  }
}
