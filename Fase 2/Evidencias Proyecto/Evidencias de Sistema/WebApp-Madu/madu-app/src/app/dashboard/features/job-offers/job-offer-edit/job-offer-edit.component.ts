import { Component, OnInit  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobOfferService } from '../../../../services/job-offer/job-offer.service';
import { AuthService } from '../../../../auth/data-access/auth.service';
import { JobOffer } from '../../../../core/interfaces/job-offer/job-offer.interface';
import { UserRole, Empleador, User } from '../../../../core/interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-job-offer-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto p-6" *ngIf="jobOfferForm">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold mb-6">Editar Oferta Laboral</h1>

        <form [formGroup]="jobOfferForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Título -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Título</label>
            <input type="text" 
                   formControlName="title"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <p *ngIf="jobOfferForm.get('title')?.errors?.['required'] && jobOfferForm.get('title')?.touched"
               class="mt-1 text-sm text-red-600">
              El título es requerido
            </p>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea formControlName="description"
                      rows="4"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            </textarea>
            <p *ngIf="jobOfferForm.get('description')?.errors?.['required'] && jobOfferForm.get('description')?.touched"
               class="mt-1 text-sm text-red-600">
              La descripción es requerida
            </p>
          </div>

          <!-- Ubicación -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Ubicación</label>
            <input type="text" 
                   formControlName="location"
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <p *ngIf="jobOfferForm.get('location')?.errors?.['required'] && jobOfferForm.get('location')?.touched"
               class="mt-1 text-sm text-red-600">
              La ubicación es requerida
            </p>
          </div>

          <!-- Tipo de trabajo -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Tipo de trabajo</label>
            <select formControlName="type"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="full-time">Tiempo completo</option>
              <option value="part-time">Medio tiempo</option>
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>

          <!-- Salario -->
          <div formGroupName="salary" class="space-y-4">
            <h3 class="text-lg font-medium">Rango Salarial</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Mínimo</label>
                <input type="number" 
                       formControlName="min"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Máximo</label>
                <input type="number" 
                       formControlName="max"
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              </div>
            </div>
          </div>

          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Estado de la oferta</label>
            <select formControlName="status"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="active">Activa</option>
              <option value="closed">Cerrada</option>
            </select>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-4">
            <button type="button"
                    (click)="cancel()"
                    class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
                    [disabled]="jobOfferForm.invalid || isSubmitting"
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
              {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrl: './job-offer-edit.component.scss'
})

export class JobOfferEditComponent implements OnInit {
  jobOfferForm: FormGroup | null = null;
  isSubmitting = false;
  currentUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private jobOfferService: JobOfferService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkUserAccess();
    this.loadJobOffer();
  }

  private async checkUserAccess() {
    this.authService.getUserData().subscribe(user => {
      if (user) {
        this.currentUserId = user.uid ?? null;
        if (user.rol !== UserRole.EMPLEADOR) {
          this.router.navigate(['/dashboard/job-offers']);
        }
      }
    });
  }

  private async loadJobOffer() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const jobOffer = await this.jobOfferService.getJobOfferById(id);
      if (jobOffer) {
        if (jobOffer.employerId !== this.currentUserId) {
          this.router.navigate(['/dashboard/job-offers']);
          return;
        }
        this.initForm(jobOffer);
      }
    }
  }

  private initForm(jobOffer: JobOffer) {
    this.jobOfferForm = this.fb.group({
      title: [jobOffer.title, Validators.required],
      description: [jobOffer.description, Validators.required],
      location: [jobOffer.location, Validators.required],
      type: [jobOffer.type, Validators.required],
      salary: this.fb.group({
        min: [jobOffer.salary?.min || null],
        max: [jobOffer.salary?.max || null],
        currency: [jobOffer.salary?.currency || 'CLP']
      }),
      status: [jobOffer.status, Validators.required],
      requirements: [jobOffer.requirements || []]
    });
  }

  async onSubmit() {
    if (this.jobOfferForm?.valid) {
      this.isSubmitting = true;
      const id = this.route.snapshot.paramMap.get('id');
      
      try {
        if (id) {
          await this.jobOfferService.updateJobOffer(id, this.jobOfferForm.value);
          this.router.navigate(['/dashboard/job-offers', id]);
        }
      } catch (error) {
        console.error('Error updating job offer:', error);
        // Implementar manejo de errores
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  cancel() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/dashboard/job-offers', id]);
    } else {
      this.router.navigate(['/dashboard/job-offers']);
    }
  }
}
