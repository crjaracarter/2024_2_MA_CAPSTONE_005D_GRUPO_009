import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobOfferService } from '../../../../services/job-offer/job-offer.service';
import { AuthService } from '../../../../auth/data-access/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserRole, Empleador, User } from '../../../../core/interfaces/user.interface';


@Component({
  selector: 'app-job-offer-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-4 max-w-3xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Crear Nueva Oferta Laboral</h2>

      <form [formGroup]="jobOfferForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Título</label>
          <input type="text" 
                 formControlName="title"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea formControlName="description"
                    rows="4"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Ubicación</label>
          <input type="text" 
                 formControlName="location"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>

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

        <div class="flex gap-4">
          <button type="submit"
                  [disabled]="jobOfferForm.invalid"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            Crear Oferta
          </button>
          <button type="button"
                  (click)="cancel()"
                  class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `
})
export class JobOfferCreateComponent {
  jobOfferForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private jobOfferService: JobOfferService,
    private authService: AuthService,
    private router: Router
  ) {
    this.jobOfferForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      type: ['full-time', Validators.required],
      requirements: [[]],
      salary: this.fb.group({
        min: [null],
        max: [null],
        currency: ['USD']
      })
    });
  }

  async onSubmit() {
    if (this.jobOfferForm.valid) {
      try {
        const empleador = await this.authService.getEmpleadorData();
        
        if (empleador) {
          const jobOffer = {
            ...this.jobOfferForm.value,
            employerId: empleador.uid,
            company: empleador.nombreEmpresa || 'Empresa no especificada',
            status: 'active'
          };
  
          await this.jobOfferService.createJobOffer(jobOffer);
          this.router.navigate(['/dashboard/job-offers']);
        }
      } catch (error) {
        console.error('Error creating job offer:', error);
        // Implementar manejo de errores
      }
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/job-offers']);
  }
}