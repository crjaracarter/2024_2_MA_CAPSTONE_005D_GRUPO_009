import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'register-empleador',
    loadComponent: () => import('./register/register-empleador/register-empleador.component').then((c) => c.RegisterEmpleadorComponent),
  }
];