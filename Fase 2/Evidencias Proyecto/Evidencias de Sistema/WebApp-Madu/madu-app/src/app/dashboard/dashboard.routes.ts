// dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './features/settings/settings.component';
// import { PersonasComponent } from './pages/personas/personas.component';
// import { ReclutamientoComponent } from './pages/reclutamiento/reclutamiento.component';
// import { PostulacionesComponent } from './pages/postulaciones/postulaciones.component';
import { ContactListComponent } from './pages/contact-list/contact-list.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

// Mi Empresa Components
import { MiEmpresaComponent } from './pages/mi-empresa/mi-empresa.component';
import { InformacionGeneralComponent } from './pages/mi-empresa/tabs/informacion-general/informacion-general.component';
import { EmpleadosComponent } from './pages/mi-empresa/tabs/empleados/empleados.component';
import { EstadisticasComponent } from './pages/mi-empresa/tabs/estadisticas/estadisticas.component';
import { DocumentosComponent } from './pages/mi-empresa/tabs/documentos/documentos.component';
import { OfertasComponent } from './pages/mi-empresa/tabs/ofertas/ofertas.component';
import { ConfiguracionComponent } from './pages/mi-empresa/tabs/configuracion/configuracion.component';
import { MigracionComponent } from './pages/admin/migracion/migracion.component';
import { AsistenciasComponent } from './pages/mi-empresa/tabs/asistencias/asistencias.component';
import { ApplicantsTrackingComponent } from './pages/mi-empresa/tabs/ofertas/components/applicants-tracking/applicants-tracking.component';

import { JobPreviewComponent } from './pages/mi-empresa/tabs/ofertas/components/job-preview/job-preview.component';
import { RoleGuard } from '../core/guards/role.guard';
import { ApplicationSuccessGuard } from '../core/guards/application-success.guard';
import { MisPostulacionesComponent } from '../dashboard/pages/mis-postulaciones/mis-postulaciones.component';
import { privateGuard } from '../core/auth.guard';

export class DashboardModule {}

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },

      { path: 'contact-list', component: ContactListComponent },
      { 
        path: 'usuarios', 
        component: UsuariosComponent,
        canActivate: [() => privateGuard(), RoleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'mis-postulaciones',
        loadComponent: () => import('./pages/mis-postulaciones/mis-postulaciones.component')
          .then(m => m.MisPostulacionesComponent),
        canActivate: [() => privateGuard(), RoleGuard],
        data: { roles: ['Usuario'] }
      },

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
          { path: 'configuracion', component: ConfiguracionComponent },
          { path: 'asistencias', component: AsistenciasComponent },
          {
            path: 'ofertas',
            children: [
              { path: '', component: OfertasComponent },
              { path: ':id/applications', component: ApplicantsTrackingComponent },
              { path: ':id/preview', component: JobPreviewComponent }, // Agregar esta ruta
            ],
          },
          
        ],
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
