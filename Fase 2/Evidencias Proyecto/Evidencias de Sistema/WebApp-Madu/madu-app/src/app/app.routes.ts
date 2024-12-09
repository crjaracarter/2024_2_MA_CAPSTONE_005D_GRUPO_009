import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { privateGuard, publicGuard } from './core/auth.guard';
import { ContactComponent } from './pages/contact/contact.component';
import { ConocenosComponent } from './pages/conocenos/conocenos.component';
import { ReclutamientoComponent } from './pages/reclutamiento/reclutamiento.component';
import { PreciosComponent } from './pages/precios/precios.component';
import { BlogComponent } from './pages/blog/blog.component';

import { JobListComponent } from './pages/jobs/job-list/job-list.component';
import { JobDetailComponent } from './pages/jobs//job-detail/job-detail.component';
import { JobApplicationFormComponent } from './pages/jobs/job-application-form/job-application-form.component';
import { ApplicationSuccessComponent } from './pages/jobs/application-success/application-success.component';
import { RoleGuard } from './core/guards/role.guard';
import { ApplicationSuccessGuard } from './core/guards/application-success.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home', // Redirigir a /home
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent, pathMatch: 'full' },
      { path: 'contact', component: ContactComponent, pathMatch: 'full' },
      { path: 'conocenos', component: ConocenosComponent, pathMatch: 'full' },
      {
        path: 'reclutamiento',
        component: ReclutamientoComponent,
      },
      { path: 'precios', component: PreciosComponent, pathMatch: 'full' },
      { path: 'blog', component: BlogComponent, pathMatch: 'full' },
      {
        path: 'empresa/:empresaId/trabajos',
        component: JobListComponent
      },
      
      {
        path: 'trabajos',
        children: [
          {
            path: 'detalle/:id',
            component: JobDetailComponent
          },
          {
            path: 'postular/:id',
            component: JobApplicationFormComponent,
            canActivate: [() => privateGuard(), RoleGuard],
            data: { roles: ['Usuario'] }
          },
          {
            path: 'postulacion-exitosa/:jobOfferId/:applicationId', 
            component: ApplicationSuccessComponent,
            canActivate: [() => privateGuard(), ApplicationSuccessGuard],
          }
        ]
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/features/auth.routes').then((m) => m.routes),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
    canActivate: [privateGuard()],
  },

  { path: '**', redirectTo: 'home', pathMatch: 'full' }, // Cambiar redirección 404 a /home
];
