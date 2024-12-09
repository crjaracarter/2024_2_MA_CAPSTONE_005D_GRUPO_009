import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service'; // Servicio de autenticación que tú manejas
import { map, tap, take } from 'rxjs/operators';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserRole } from '../../core/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const allowedRoles = route.data['roles'] as UserRole[];

    return this.authService.getUserData().pipe(
      take(1),
      map((user) => {
        if (!user) {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }

        if (!allowedRoles.includes(user.rol)) {
          this.router.navigate(['/']);
          return false;
        }

        return true;
      })
    );
  }
}
