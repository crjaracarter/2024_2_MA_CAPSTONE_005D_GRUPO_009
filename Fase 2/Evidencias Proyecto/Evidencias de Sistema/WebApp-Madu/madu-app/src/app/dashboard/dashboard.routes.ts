// dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BlogModule } from './features/blog/blog.module';


import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './features/settings/settings.component';
// import { PersonasComponent } from './pages/personas/personas.component';
// import { ReclutamientoComponent } from './pages/reclutamiento/reclutamiento.component';
// import { PostulacionesComponent } from './pages/postulaciones/postulaciones.component';
import { ContactListComponent } from './pages/contact-list/contact-list.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

import { JobOfferListComponent } from './features/job-offers/job-offer-list/job-offer-list.component';
import { JobOfferCreateComponent } from './features/job-offers/job-offer-create/job-offer-create.component';
import { JobOfferEditComponent } from './features/job-offers/job-offer-edit/job-offer-edit.component';
import { JobOfferDetailComponent } from './features/job-offers/job-offer-detail/job-offer-detail.component';
import { JobApplicationsComponent } from './features/job-applications/job-applications.component';

// Nuevos imports para el blog
// import { BlogListComponent } from './features/blog/blog-list/blog-list.component';
// import { BlogCreateComponent } from './features/blog/blog-create/blog-create.component';
// import { BlogEditComponent } from './features/blog/blog-edit/blog-edit.component';
// import { BlogDetailComponent } from './features/blog/blog-detail/blog-detail.component';
// import { privateGuard } from '../core/auth.guard';
// import { RoleGuard } from '../core/guards/role.guard';


export class DashboardModule { }

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
      // { path: 'personas', component: PersonasComponent },
      // { path: 'reclutamiento', component: ReclutamientoComponent },
      // { path: 'postulaciones', component: PostulacionesComponent },
      { path: 'contact-list', component: ContactListComponent },
      { path: 'usuarios', component: UsuariosComponent },

      { path: 'job-offers', component: JobOfferListComponent },
      { path: 'job-offers/create', component: JobOfferCreateComponent },
      { path: 'job-offers/edit/:id', component: JobOfferEditComponent },
      { path: 'job-offers/detail/:id', component: JobOfferDetailComponent },
      { path: 'job-applications', component: JobApplicationsComponent },


      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirigir a home
    ],
  },
];
