import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobOffer } from '../../../core/interfaces/job-offer/job-offer.interface';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { UserRole } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class JobListComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  loading = true;
  error = '';
  companyName = '';
  userRole: UserRole | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobOfferService: JobOfferService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el rol del usuario
    this.authService.getUserData().subscribe(user => {
      this.userRole = user?.rol || null;
    });

    // Obtener el ID de la empresa de la URL
    const empresaId = this.route.snapshot.params['empresaId'];
    if (empresaId) {
      this.loadJobOffers(empresaId);
    } else {
      this.error = 'ID de empresa no proporcionado';
      this.loading = false;
    }
  }

  loadJobOffers(empresaId: string): void {
    this.jobOfferService.getJobOffersByCompany(empresaId)
      .subscribe({
        next: (offers) => {
          this.jobOffers = offers.filter(offer => offer.status === 'published');
          this.companyName = offers[0]?.companyName || 'Empresa';
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando ofertas:', err);
          this.error = 'Error al cargar las ofertas laborales';
          this.loading = false;
        }
      });
  }

  viewJobDetails(jobId: string): void {
    this.router.navigate(['/trabajos/detalle', jobId]);
  }

  canApply(): boolean {
    return this.userRole === UserRole.USUARIO;
  }
}