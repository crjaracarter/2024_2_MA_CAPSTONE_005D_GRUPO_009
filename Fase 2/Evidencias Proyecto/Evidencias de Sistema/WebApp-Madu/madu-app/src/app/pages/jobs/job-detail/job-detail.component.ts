// src/app/pages/jobs/job-detail/job-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobOffer } from '../../../core/interfaces/job-offer/job-offer.interface';
import { JobOfferService } from '../../../services/job-offer/job-offer.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import  { RoleGuard } from '../../../core/guards/role.guard';
import { privateGuard, publicGuard } from '../../../core/auth.guard';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';

type JobType = 'remote' | 'hybrid' | 'onsite';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class JobDetailComponent implements OnInit {
  jobOffer: JobOffer | null = null;
  isAuthenticated = false;
  isLoading = true;
  error: string | null = null;

  private readonly jobTypeClasses: Record<JobType, string> = {
    'remote': 'bg-green-100 text-green-800 hover:bg-green-200',
    'hybrid': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'onsite': 'bg-purple-100 text-purple-800 hover:bg-purple-200'
  };

  private readonly jobTypeIcons: Record<JobType, string> = {
    'remote': 'fa-laptop-house',
    'hybrid': 'fa-building-user',
    'onsite': 'fa-building'
  };

  private readonly jobTypeLabels: Record<JobType, string> = {
    'remote': 'Remoto',
    'hybrid': 'Híbrido',
    'onsite': 'Presencial'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobOfferService: JobOfferService,
    private authService: AuthService
    
  ) {}

  private destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  

  ngOnInit() {
    this.loadJobOffer();
    this.checkAuthStatus();
  }

  private async loadJobOffer() {
    try {
      const jobId = this.route.snapshot.params['id'];
      const offer = await this.jobOfferService.getJobOfferById(jobId);
      
      if (offer) {
        this.jobOffer = offer;
      } else {
        this.error = 'Oferta no encontrada';
      }
    } catch (error) {
      this.error = 'Error al cargar la oferta';
      console.error('Error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private checkAuthStatus() {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => this.isAuthenticated = isAuth);
  }
  

  async onApply() {
    if (!this.isAuthenticated) {
      // Guardar la URL actual para redireccionar después del login
      localStorage.setItem('redirectAfterLogin', this.router.url);
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.jobOffer?.id) {
      this.router.navigate(['/jobs', this.jobOffer.id, 'apply']);
    }
  }

  getJobTypeClass(type: string): string {
    const normalizedType = type.toLowerCase() as JobType;
    return this.jobTypeClasses[normalizedType] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }

  getJobTypeIcon(type: string): string {
    const normalizedType = type.toLowerCase() as JobType;
    return this.jobTypeIcons[normalizedType] || 'fa-briefcase';
  }

  formatJobType(type: string): string {
    const normalizedType = type.toLowerCase() as JobType;
    return this.jobTypeLabels[normalizedType] || type;
  }

  // Método para determinar la clase del botón según el estado
  getButtonClass(): string {
    if (this.isLoading) return 'btn-disabled';
    if (!this.isAuthenticated) return 'btn-secondary';
    return 'btn-primary';
  }

  // Método para obtener el texto del botón según el estado
  getButtonText(): string {
    if (this.isLoading) return 'Cargando...';
    if (!this.isAuthenticated) return 'Iniciar sesión para postular';
    return 'Postular ahora';
  }
}
