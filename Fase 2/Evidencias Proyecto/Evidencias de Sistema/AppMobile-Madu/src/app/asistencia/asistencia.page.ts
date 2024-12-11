import { Component } from '@angular/core';
import { AsistenciaService } from '../asistencia.service';
import { AutenticacionService } from '../autenticacion.service';
import { GeolocationService, LocationData } from '../geolocation.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage {
  attendanceRecords: any[] = [];
  isRegistered: boolean = false;
  currentUserId: string;
  currentRecordId: string | null = null;
  monthlyHours: number = 0;
  currentMonth: string = '';
  isLoadingLocation: boolean = false;
  currentLocation: LocationData | null = null;

  constructor(
    private asistenciaService: AsistenciaService,
    private authService: AutenticacionService,
    private geolocationService: GeolocationService,
    private alertController: AlertController
  ) {}

 
  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.loadAttendanceRecords();
        this.loadMonthlyHours();
        this.setCurrentMonth();
      }
    });
  }
  setCurrentMonth() {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const now = new Date();
    this.currentMonth = months[now.getMonth()];
  }
  loadMonthlyHours() {
    this.asistenciaService.obtenerHistorialMensual(this.currentUserId)
      .subscribe({
        next: (records) => {
          this.calculateMonthlyHours(records);
        },
        error: (error) => {
          console.error('Error cargando horas mensuales:', error);
        }
      });
  }
  calculateMonthlyHours(records: any[]) {
    let totalMinutes = 0;

    records.forEach(record => {
      if (record.entrada && record.salida) {
        const entrada = record.entrada.toDate();
        const salida = record.salida.toDate();
        const diffInMinutes = (salida.getTime() - entrada.getTime()) / (1000 * 60);
        totalMinutes += diffInMinutes;
      }
    });

    this.monthlyHours = Math.round((totalMinutes / 60) * 100) / 100; // Redondear a 2 decimales
  }
  formatTimestamp(timestamp: any): string {
    if (!timestamp) return '';
    
    try {
      // Si es un timestamp de Firestore
      if (timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleTimeString('es-CL');
      }
      // Si es una fecha regular
      return new Date(timestamp).toLocaleTimeString('es-CL');
    } catch (error) {
      console.error('Error formateando timestamp:', error);
      return '';
    }
  }

  loadAttendanceRecords() {
    this.asistenciaService.obtenerHistorial(this.currentUserId)
      .subscribe({
        next: (records) => {
          console.log('Registros recibidos:', records);
          this.attendanceRecords = records;
          const openRecord = records.find(record => !record.salida);
          if (openRecord) {
            this.isRegistered = true;
            this.currentRecordId = openRecord.id;
          } else {
            this.isRegistered = false;
            this.currentRecordId = null;
          }
        },
        error: (error) => {
          console.error('Error cargando registros:', error);
        }
      });
  }

  async registerEntry() {
    if (!this.isRegistered && this.currentUserId) {
      try {
        const locationData = await this.geolocationService.getCurrentPosition().toPromise();
        this.currentLocation = locationData;
        await this.asistenciaService.marcarEntrada(this.currentUserId, locationData);
        this.isRegistered = true;
      } catch (error) {
        console.error('Error:', error);
        // Manejo de error
      }
    }
  }

  async registerExit() {
    if (this.isRegistered && this.currentRecordId) {
      this.isLoadingLocation = true;
      
      try {
        const locationData = await this.geolocationService.getCurrentPosition().toPromise();
        await this.asistenciaService.marcarSalida(this.currentRecordId, locationData);
        this.isRegistered = false;
        this.currentRecordId = null;
      } catch (error) {
        this.showLocationError(error);
      } finally {
        this.isLoadingLocation = false;
      }
    }
  }

  private async showLocationError(error: any) {
    const alert = await this.alertController.create({
      header: 'Error de ubicación',
      message: typeof error === 'string' ? error : 'No se pudo obtener la ubicación',
      buttons: ['OK']
    });
    await alert.present();
  }
}