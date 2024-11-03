import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service'; // Servicio de autenticación que tú manejas
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: any): any {
    const expectedRole = route.data.expectedRole;

    return this.authService.getUserData().pipe(
      map(user => user?.rol === expectedRole),
      tap(isAuthorized => {
        if (!isAuthorized) {
          this.router.navigate(['/unauthorized']); // Redireccionar si no tiene permisos
        }
      })
    );
  }
}
