// documentos.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DocumentosPage } from './documentos.page';
import { DocumentosPageRoutingModule } from './documentos-routing.module';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FullCalendarModule,
    DocumentosPageRoutingModule,
    AngularFirestoreModule
  ],
  declarations: [DocumentosPage]
})
export class DocumentosPageModule {}