import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../shared/data-access/auth-state.service';
import { map, take } from 'rxjs/operators';

export const privateGuard = (): CanActivateFn => {
  return (route) => {
    const router = inject(Router);
    const authState = inject(AuthStateService);

    return authState.isAuthenticated$.pipe(
      take(1), // Importante: tomar solo el primer valor
      map((isAuthenticated) => {
        console.log('Is authenticated:', isAuthenticated);

        if (!isAuthenticated) {
          console.log('Usuario no autenticado, redirigiendo a login');
          router.navigate(['/auth/login']);
          return false;
        }

        // Si estamos autenticados y la ruta es application-success, permitir
        if (
          route.url[0]?.path === 'jobs' &&
          route.url[1]?.path === 'application-success'
        ) {
          console.log('Permitiendo acceso a application-success');
          return true;
        }

        console.log('Usuario autenticado, permitiendo acceso');
        return true;
      })
    );
  };
};

export const publicGuard = (): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authState = inject(AuthStateService);

    return authState.authState$.pipe(
      map((state) => {
        if (state) {
          router.navigateByUrl('/home');
          return false;
        }

        return true;
      })
    );
  };
};
