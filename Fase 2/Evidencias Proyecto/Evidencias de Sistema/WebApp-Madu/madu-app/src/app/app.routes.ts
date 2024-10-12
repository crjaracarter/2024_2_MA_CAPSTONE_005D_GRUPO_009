import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { privateGuard, publicGuard } from './core/auth.guard';
import { ContactComponent } from './pages/contact/contact.component';
import { ConocenosComponent } from './pages/conocenos/conocenos.component';
import { ReclutamientoComponent } from './pages/reclutamiento/reclutamiento.component';
import { PreciosComponent } from './pages/precios/precios.component';
import { BlogComponent } from './pages/blog/blog.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'contact', component: ContactComponent, pathMatch: 'full'},
      { path: 'conocenos', component: ConocenosComponent, pathMatch: 'full'},
      { path: 'reclutamiento', component: ReclutamientoComponent, pathMatch: 'full'},
      { path: 'precios', component: PreciosComponent, pathMatch: 'full'},
      { path: 'blog', component: BlogComponent, pathMatch: 'full'},
      {
        path: 'tasks',
        canActivateChild: [privateGuard()],
        loadChildren: () => import('./task/features/task.routes').then(m => m.default),
      },
      
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/features/auth.routes').then(m => m.routes),
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [privateGuard()],
  },
  {
    path: '**',
    redirectTo: '',
  },
];