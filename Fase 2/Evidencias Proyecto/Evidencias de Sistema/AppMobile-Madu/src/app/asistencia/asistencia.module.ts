import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaPage } from './asistencia.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { AsistenciaRoutingModule } from './asistencia-routing.module';
import { AttendanceMapComponent } from '../components/attendance-map/attendance-map.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    AsistenciaRoutingModule
  ],
  declarations: [AsistenciaPage, AttendanceMapComponent]
})
export class AsistenciaPageModule {}
