import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobOffer } from '../../../core/interfaces/job-offer/job-offer.interface';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { UserRole } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, DatePipe]
})
export class JobDetailComponent implements OnInit {
  jobOffer: JobOffer | null = null;
  empresaId: string | null = null;
  loading = true;
  error = '';
  userRole: UserRole | null = null;
  isAuthenticated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobOfferService: JobOfferService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserData().subscribe(user => {
      this.userRole = user?.rol || null;
      this.isAuthenticated = !!user;
    });

    const jobId = this.route.snapshot.params['id'];
    if (jobId) {
      this.loadJobDetails(jobId);
    }
  }

  private async loadJobDetails(jobId: string): Promise<void> {
    try {
      const offer = await this.jobOfferService.getJobOfferById(jobId);
      if (offer) {
        this.jobOffer = offer;
        this.empresaId = offer.empresaId;
      } else {
        this.error = 'Oferta no encontrada';
      }
    } catch (err) {
      console.error('Error cargando detalles:', err);
      this.error = 'Error al cargar los detalles de la oferta';
    } finally {
      this.loading = false;
    }
  }

  applyForJob(): void {
    if (!this.isAuthenticated) {
      localStorage.setItem('returnUrl', `/trabajos/postular/${this.jobOffer?.id}`);
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.userRole === UserRole.EMPLEADOR) {
      this.error = 'Los empleadores no pueden postular a ofertas laborales';
      return;
    }

    if (this.jobOffer?.id) {
      this.router.navigate(['/trabajos/postular', this.jobOffer?.id]);
    }
  }

  goBack(): void {
    if (this.empresaId) {
      this.router.navigate(['/empresa', this.empresaId, 'trabajos']);
    } else {
      // Si por alguna razón no tenemos el empresaId, redirigimos al home
      this.router.navigate(['/']);
    }
  }
}