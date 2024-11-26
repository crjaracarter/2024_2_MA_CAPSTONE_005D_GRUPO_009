import { Routes } from '@angular/router';
import { MyApplicationsComponent } from './my-applications.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';

export const MY_APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    component: MyApplicationsComponent
  },
  {
    path: ':id',
    component: ApplicationDetailComponent
  }
];