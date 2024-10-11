import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { privateGuard, publicGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      {
        path: 'tasks',
        canActivateChild: [privateGuard()],
        loadChildren: () => import('./task/features/task.routes').then(m => m.default),
      },
      // Otras rutas que deben tener header y footer
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