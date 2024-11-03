import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { privateGuard, publicGuard } from './core/auth.guard';
import { ContactComponent } from './pages/contact/contact.component';
import { ConocenosComponent } from './pages/conocenos/conocenos.component';
import { ReclutamientoComponent } from './pages/reclutamiento/reclutamiento.component';
import { PreciosComponent } from './pages/precios/precios.component';
import { BlogComponent } from './pages/blog/blog.component';

import { EmpresaComponent } from './empresa/empresa.component';
import { VacantesComponent } from './vacantes/vacantes.component';
import { PostulacionComponent } from './postulacion/postulacion.component';

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
      { path: 'contact', component: ContactComponent, pathMatch: 'full'},
      { path: 'conocenos', component: ConocenosComponent, pathMatch: 'full'},
      { path: 'reclutamiento', component: ReclutamientoComponent, pathMatch: 'full'},
      { path: 'precios', component: PreciosComponent, pathMatch: 'full'},
      { path: 'blog', component: BlogComponent, pathMatch: 'full'},
      
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/features/auth.routes').then(m => m.routes),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [privateGuard()],
  },
  {
    path: 'tasks',
    canActivateChild: [privateGuard()],
    loadChildren: () => import('./task/features/task.routes').then(m => m.default),
  },

  { path: 'empresa/:id', component: EmpresaComponent },
  { path: 'vacantes/:id', component: VacantesComponent },
  { path: 'postulacion/:id', component: PostulacionComponent },
  { path: 'empresa/:empresaId/vacantes/:id', component: VacantesComponent },

  { path: '**', redirectTo: 'home', pathMatch: 'full' }, // Cambiar redirección 404 a /home
];