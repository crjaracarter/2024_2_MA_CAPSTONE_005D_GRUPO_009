import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router, 
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { JobOfferService } from '../../services/job-offer/job-offer.service';
import { JobApplicationService } from '../../services/job-application/job-application.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationSuccessGuard {
  constructor(
    private router: Router,
    private jobOfferService: JobOfferService,
    private jobApplicationService: JobApplicationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.validateRoute(route);
  }

  private async validateRoute(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    try {
      const jobOfferId = route.params['jobOfferId'];
      const applicationId = route.params['applicationId'];

      // Validar que existan los parámetros necesarios
      if (!jobOfferId || !applicationId) {
        console.error('Parámetros faltantes en la ruta');
        return this.router.createUrlTree(['/']);
      }

      // Verificar que exista la oferta laboral
      const jobOffer = await this.jobOfferService.getJobOfferById(jobOfferId);
      if (!jobOffer) {
        console.error('Oferta laboral no encontrada');
        return this.router.createUrlTree(['/']);
      }

      // Verificar que exista la postulación
      try {
        const application = await this.jobApplicationService.getApplicationById(applicationId);
        if (!application) {
          console.error('Postulación no encontrada');
          return this.router.createUrlTree(['/']);
        }

        // Verificar que la postulación corresponda a la oferta
        if (application.jobOfferId !== jobOfferId) {
          console.error('La postulación no corresponde a la oferta laboral');
          return this.router.createUrlTree(['/']);
        }

        return true;
      } catch (error) {
        console.error('Error al verificar la postulación:', error);
        return this.router.createUrlTree(['/']);
      }

    } catch (error) {
      console.error('Error en la validación de la ruta:', error);
      return this.router.createUrlTree(['/']);
    }
  }
}