import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobOffer } from '../../../core/interfaces/job-offer/job-offer.interface';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-jobs-company',
  standalone: true,
  imports: [CommonModule, RouterModule],
  // templateUrl: './jobs-company.component.html',
  templateUrl: './jobs-company.component.html',
  styleUrl: './jobs-company.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class JobsCompanyComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  company: string = '';
  isLoading: boolean = true;
  error: string | null = null;
  employerId: string | null = null;

  constructor(
    private jobOfferService: JobOfferService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Usando paramMap en lugar de params
    this.route.paramMap.subscribe((params) => {
      this.employerId = params.get('employerId');
      console.log('EmployerId recibido:', this.employerId);

      if (this.employerId) {
        console.log(
          'Intentando cargar ofertas para empleador:',
          this.employerId
        );
        this.loadJobOffers(this.employerId);
      } else {
        console.log('No se encontró employerId en los parámetros');
        this.error = 'No se encontró el ID de la empresa';
        this.isLoading = false;
      }
    });
  }

  private async loadJobOffers(employerId: string) {
    try {
      console.log('Buscando ofertas para empleador:', employerId);
      this.isLoading = true;
      this.error = null;

      const offers = await this.jobOfferService.getJobOffersByEmployerId(
        employerId
      );
      console.log('Ofertas encontradas:', offers);

      this.jobOffers = offers.filter((offer) => offer.status === 'active');
      console.log('Ofertas activas:', this.jobOffers);

      if (this.jobOffers.length > 0) {
        this.company = this.jobOffers[0].company;
      } else {
        console.log('No se encontraron ofertas activas');
      }
    } catch (error) {
      console.error('Error cargando ofertas:', error);
      this.error = 'Error al cargar las ofertas laborales';
    } finally {
      this.isLoading = false;
    }
  }

  getJobTypeClass(type: string): string {
    const baseClasses = 'transition-all duration-300 ';
    switch (type.toLowerCase()) {
      case 'fulltime':
        return baseClasses + 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      case 'parttime':
        return baseClasses + 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'remote':
        return baseClasses + 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return baseClasses + 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  }

  formatJobType(type: string): string {
    const typeMap: { [key: string]: string } = {
      remote: 'Remoto',
      hybrid: 'Híbrido',
      'full-time': 'Tiempo Completo',
      'part-time': 'Medio Tiempo',
    };
    return typeMap[type] || type;
  }
}
