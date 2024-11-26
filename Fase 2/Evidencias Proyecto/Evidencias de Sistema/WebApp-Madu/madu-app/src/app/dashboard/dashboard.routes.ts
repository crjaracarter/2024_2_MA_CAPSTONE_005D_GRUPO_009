// dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

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

// Mi Empresa Components
import { MiEmpresaComponent } from './pages/mi-empresa/mi-empresa.component';
import { InformacionGeneralComponent } from './pages/mi-empresa/tabs/informacion-general/informacion-general.component';
import { EmpleadosComponent } from './pages/mi-empresa/tabs/empleados/empleados.component';
import { EstadisticasComponent } from './pages/mi-empresa/tabs/estadisticas/estadisticas.component';
import { DocumentosComponent } from './pages/mi-empresa/tabs/documentos/documentos.component';
import { OfertasComponent } from './pages/mi-empresa/tabs/ofertas/ofertas.component';
import { ConfiguracionComponent } from './pages/mi-empresa/tabs/configuracion/configuracion.component';
import { MigracionComponent } from './pages/admin/migracion/migracion.component';

// Nuevos imports para el blog no se usa pero se deja como referencia
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

      // Rutas de Mi Empresa
      {
        path: 'mi-empresa',
        component: MiEmpresaComponent,
        children: [
          { path: '', redirectTo: 'informacion', pathMatch: 'full' },
          { path: 'informacion', component: InformacionGeneralComponent },
          { path: 'empleados', component: EmpleadosComponent },
          { path: 'estadisticas', component: EstadisticasComponent },
          { path: 'documentos', component: DocumentosComponent },
          { path: 'ofertas', component: OfertasComponent },
          { path: 'configuracion', component: ConfiguracionComponent }
        ]
      },

      {
        path: 'my-applications',
        loadChildren: () => import('./features/my-applications/my-applications.routes')
          .then(m => m.MY_APPLICATIONS_ROUTES)
      },

      {
        path: 'admin/migracion',
        component: MigracionComponent,
        //canActivate: [AdminGuard]  Asegúrate de proteger esta ruta
      },


      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirigir a home
    ],
  },
];
