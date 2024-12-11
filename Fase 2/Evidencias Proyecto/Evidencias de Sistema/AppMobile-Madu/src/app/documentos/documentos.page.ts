import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AutenticacionService } from '../autenticacion.service';
import { AlertController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.page.html',
  styleUrls: ['./documentos.page.scss'],
})

export class DocumentosPage implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  isloading: boolean = true;
  currentUserId: string = '';
  selectedView: string = 'all';
  events: any[] = [];
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    dateClick: this.handleDateClick.bind(this),
    eventSources: [
      {
        events: [
          {
            title: 'Día de Pago',
            date: '2024-11-30',
            color: '#4CAF50',
            allDay: true,
            extendedProps: { type: 'payment' }
          }
        ],
        color: '#4CAF50',
        textColor: 'white'
      },
      {
        events: [
          {
            title: 'Feriado: Navidad',
            date: '2024-12-25',
            color: '#FFC107',
            allDay: true,
            extendedProps: { type: 'holiday' }
          }
        ],
        color: '#FFC107',
        textColor: 'black'
      },
      {
        events: [
          {
            title: 'Turno: 09:00 - 18:00',
            start: '2024-11-18T09:00:00',
            end: '2024-11-18T18:00:00',
            color: '#5A4FCF',
            extendedProps: { type: 'shift' }
          }
        ]
      },
      {
        events: [],
        color: '#8A8EF2',
        textColor: 'white'
      }
    ],
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: (info) => {
      const tooltip = info.event.title;
      info.el.setAttribute('title', tooltip);
    }
  };

  constructor(
    private authService: AutenticacionService,
    private alertController: AlertController,
    private firestore: AngularFirestore,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.loadEvents();
      }
      this.isloading = false;
    });
  }

  loadEvents() {
    this.events = this.calendarOptions.eventSources?.reduce((acc: any[], source: any) => {
      return acc.concat(source.events);
    }, []) || [];
  }

  getEventIcon(event: any) {
    switch(event.extendedProps?.type) {
      case 'payment':
        return 'cash-outline';
      case 'holiday':
        return 'calendar-outline';
      case 'shift':
        return 'time-outline';
      default:
        return 'calendar-outline';
    }
  }

  filterEvents(event: any) {
    if (!this.calendarComponent) return;
    
    const filter = event.detail.value;
    let visibleEventSources = [];

    switch(filter) {
      case 'payments':
        visibleEventSources = this.calendarOptions.eventSources!.filter(
          source => (source as any).color === '#4CAF50'
        );
        break;
      case 'holidays':
        visibleEventSources = this.calendarOptions.eventSources!.filter(
          source => (source as any).color === '#FFC107'
        );
        break;
      case 'shifts':
        visibleEventSources = this.calendarOptions.eventSources!.filter(
          source => (source as any).color === '#5A4FCF'
        );
        break;
      default:
        visibleEventSources = this.calendarOptions.eventSources!;
        break;
    }

    const calendarApi = this.calendarComponent.getApi();
    calendarApi.removeAllEventSources();
    visibleEventSources.forEach(source => calendarApi.addEventSource(source));
  }

  async handleDateClick(info: any) {
    const alert = await this.alertController.create({
      header: 'Agregar Nota',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Título de la nota'
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripción'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.title) {
              this.addNote(info.dateStr, data.title, data.description);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async handleEventClick(info: any) {
    const event = info.event;
    if (event.extendedProps?.type === 'note') {
      await this.showNoteDetails(event);
    } else {
      await this.showEventDetails(event);
    }
  }

  async showEventDetails(event: any) {
    const alert = await this.alertController.create({
      header: 'Detalles del Evento',
      subHeader: event.title,
      message: this.formatEventDetails(event),
      buttons: ['OK'],
      cssClass: 'event-alert'
    });

    await alert.present();
  }

  async showNoteDetails(event: any) {
    const alert = await this.alertController.create({
      header: event.title,
      message: event.extendedProps.description || 'Sin descripción',
      buttons: [
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteNote(event);
          }
        },
        {
          text: 'Editar',
          handler: () => {
            this.editNote(event);
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  async addNote(date: string, title: string, description: string) {
    const newNote = {
      title: title,
      date: date,
      extendedProps: {
        type: 'note',
        description: description
      },
      color: '#8A8EF2'
    };

    try {
      const noteId = await this.saveNoteToFirebase(newNote);
      
      if (this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.addEvent({
          ...newNote,
          id: noteId
        });
      }

      const toast = await this.toastController.create({
        message: 'Nota agregada correctamente',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } catch (error) {
      console.error('Error al agregar la nota:', error);
      
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo agregar la nota. Por favor, intente nuevamente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async editNote(event: any) {
    const alert = await this.alertController.create({
      header: 'Editar Nota',
      inputs: [
        {
          name: 'title',
          type: 'text',
          value: event.title,
          placeholder: 'Título de la nota'
        },
        {
          name: 'description',
          type: 'textarea',
          value: event.extendedProps.description,
          placeholder: 'Descripción'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.title) {
              event.setProp('title', data.title);
              event.setExtendedProp('description', data.description);
              await this.updateNoteInFirebase(event);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteNote(event: any) {
    try {
      if (!event.id) {
        throw new Error('ID de nota no encontrado');
      }
      
      await this.firestore.collection('notas').doc(event.id).delete();
      
      if (this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();
        const eventToRemove = calendarApi.getEventById(event.id);
        if (eventToRemove) {
          eventToRemove.remove();
        }
      }
      
      const toast = await this.toastController.create({
        message: 'Nota eliminada correctamente',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();

    } catch (error) {
      console.error('Error al eliminar la nota:', error);
      
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo eliminar la nota. Por favor, intente nuevamente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async saveNoteToFirebase(note: any) {
    try {
      const docRef = await this.firestore.collection('notas').add({
        ...note,
        usuarioId: this.currentUserId,
        createdAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error al guardar la nota:', error);
      throw error;
    }
  }

  async updateNoteInFirebase(event: any) {
    try {
      if (!event.id) {
        throw new Error('ID de nota no encontrado');
      }
      
      await this.firestore.collection('notas').doc(event.id).update({
        title: event.title,
        extendedProps: event.extendedProps
      });

      const toast = await this.toastController.create({
        message: 'Nota actualizada correctamente',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
    } catch (error) {
      console.error('Error al actualizar la nota:', error);
      
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo actualizar la nota. Por favor, intente nuevamente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  loadNotes() {
    this.firestore.collection('notas', ref => 
      ref.where('usuarioId', '==', this.currentUserId)
    ).snapshotChanges().subscribe(actions => {
      const calendarApi = this.calendarComponent.getApi();
      
      const existingNotes = calendarApi.getEvents().filter(e => 
        e.extendedProps?.['type'] === 'note'
      );
      existingNotes.forEach(e => e.remove());

      actions.forEach(action => {
        const data = action.payload.doc.data() as any;
        calendarApi.addEvent({
          ...data,
          id: action.payload.doc.id
        });
      });
    });
  }

  loadEmployeeEvents(userId: string) {
    console.log('Cargando eventos para usuario:', userId);
  }

  private formatEventDetails(event: any): string {
    let details = '';
    
    switch(event.extendedProps?.type) {
      case 'payment':
        details = `Fecha de pago: ${this.formatDate(event.start)}`;
        break;
      case 'holiday':
        details = `Fecha: ${this.formatDate(event.start)}`;
        break;
      case 'shift':
        details = `Horario: ${this.formatTime(event.start)} - ${this.formatTime(event.end)}`;
        break;
      default:
        details = `Fecha: ${this.formatDate(event.start)}`;
    }

    return details;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}