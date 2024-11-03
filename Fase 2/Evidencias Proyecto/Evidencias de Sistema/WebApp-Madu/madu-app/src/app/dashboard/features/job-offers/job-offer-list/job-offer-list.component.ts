import { Component, OnInit } from '@angular/core';
import { JobOfferService } from '../../../../services/job-offer/job-offer.service';
import { AuthService } from '../../../../auth/data-access/auth.service';
import { JobOffer } from '../../../../core/interfaces/job-offer/job-offer.interface';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../../../../core/interfaces/user.interface';


@Component({
  selector: 'app-job-offer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Ofertas Laborales</h2>
        <button *ngIf="isEmployer" 
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                routerLink="create">
          Crear Nueva Oferta
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let offer of jobOffers" 
             class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 class="text-xl font-semibold mb-2">{{offer.title}}</h3>
          <p class="text-gray-600 mb-2">{{offer.company}}</p>
          <p class="text-sm text-gray-500 mb-4">{{offer.location}}</p>
          <div class="flex justify-between items-center">
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {{offer.type}}
            </span>
            <button (click)="viewDetails(offer.id!)" 
                    class="text-blue-600 hover:text-blue-800">
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './job-offer-list.component.scss'
})
export class JobOfferListComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  isEmployer = false;

  constructor(
    private jobOfferService: JobOfferService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadJobOffers();
    this.checkUserRole();
  }

  private async checkUserRole() {
    this.authService.getUserData().subscribe(user => {
      this.isEmployer = user?.rol === UserRole.EMPLEADOR;
    });
  }

  private loadJobOffers() {
    this.jobOfferService.getJobOffers().subscribe(
      offers => {
        this.jobOffers = offers;
      },
      error => {
        console.error('Error loading job offers:', error);
        // Aquí podrías implementar un manejo de errores más elaborado
      }
    );
  }

  viewDetails(offerId: string) {
    this.router.navigate(['/dashboard/job-offers', offerId]);
  }
}
