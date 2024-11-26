import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { privateGuard, publicGuard } from './core/auth.guard';
import { ContactComponent } from './pages/contact/contact.component';
import { ConocenosComponent } from './pages/conocenos/conocenos.component';
import { ReclutamientoComponent } from './pages/reclutamiento/reclutamiento.component';
import { PreciosComponent } from './pages/precios/precios.component';
import { BlogComponent } from './pages/blog/blog.component';

import { JobsCompanyComponent } from './pages/jobs/jobs-company/jobs-company.component';
import { JobDetailComponent } from './pages/jobs/job-detail/job-detail.component';
import { JobApplicationFormComponent } from './pages/jobs/job-application-form/job-application-form.component';
import { ApplicationSuccessComponent } from './pages/jobs/application-success/application-success.component';

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
        path: 'company/:employerId/jobs',
        component: JobsCompanyComponent,
      },
      {
        path: 'jobs/application-success/:id',
        component: ApplicationSuccessComponent,
        canActivate: [privateGuard()],
        data: { requiresAuth: true }
      },
      {
        path: 'jobs/:id/apply',
        component: JobApplicationFormComponent,
        canActivate: [privateGuard()],
        data: { requiresAuth: true }
      },
      {
        path: 'jobs/:id',
        component: JobDetailComponent,
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
