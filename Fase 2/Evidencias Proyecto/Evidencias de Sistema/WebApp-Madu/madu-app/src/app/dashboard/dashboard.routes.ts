// dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { PersonasComponent } from './pages/personas/personas.component';
import { ReclutamientoComponent } from './pages/reclutamiento/reclutamiento.component';
import { PostulacionesComponent } from './pages/postulaciones/postulaciones.component';
import { ContactListComponent } from './pages/contact-list/contact-list.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'personas', component: PersonasComponent },
      { path: 'reclutamiento', component: ReclutamientoComponent },
      { path: 'postulaciones', component: PostulacionesComponent },
      { path: 'contact-list', component: ContactListComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirigir a home
    ],
  },
];