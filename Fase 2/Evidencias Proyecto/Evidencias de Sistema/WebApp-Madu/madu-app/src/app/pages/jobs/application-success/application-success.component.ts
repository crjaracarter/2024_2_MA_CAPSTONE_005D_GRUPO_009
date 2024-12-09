import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { JobOffer } from '../../../core/interfaces/job-offer/job-offer.interface';

@Component({
  selector: 'app-application-success',
  templateUrl: './application-success.component.html',
  styleUrls: ['./application-success.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ApplicationSuccessComponent implements OnInit {
  jobOffer: JobOffer | null = null;
  applicationId: string | null = null;
  empresaId: string | null = null;
  loading = true;
  error = '';
  applicationDate = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobOfferService: JobOfferService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const jobOfferId = params['jobOfferId'];
      this.applicationId = params['applicationId'];

      if (jobOfferId && this.applicationId) {
        this.loadJobOffer(jobOfferId);
      } else {
        this.loading = false;
        this.error = 'No se encontró información de la postulación';
      }
    });
  }

  private async loadJobOffer(jobOfferId: string): Promise<void> {
    try {
      const offer = await this.jobOfferService.getJobOfferById(jobOfferId);
      if (offer) {
        this.jobOffer = offer;
        this.empresaId = offer.empresaId;
      }
    } catch (err) {
      console.error('Error cargando oferta:', err);
      this.error = 'Error al cargar los detalles de la postulación';
    } finally {
      this.loading = false;
    }
  }

  goToMyApplications(): void {
    this.router.navigate(['/dashboard']);
  }

  goToJobListings(): void {
    if (this.empresaId) {
      this.router.navigate(['/empresa', this.empresaId, 'trabajos']);
    } else {
      // Si por alguna razón no tenemos el empresaId, redirigimos al home
      this.router.navigate(['/']);
    }
  }

}