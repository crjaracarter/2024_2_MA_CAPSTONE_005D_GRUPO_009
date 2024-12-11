import { Component, OnInit } from '@angular/core';
import { AsistenciaService } from '../../../services/asistencia/asistencia.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { Asistencia } from '../../../core/interfaces/asistencia.interface';
import { User } from '../../../core/interfaces/user.interface';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';

interface AsistenciaStats {
  totalDias: number;
  asistenciaCompleta: number;
  retardos: number;
  ausencias: number;
  horasTrabajadas: number;
}

@Component({
  selector: 'app-mi-asistencia',
  standalone: true,
  templateUrl: './mi-asistencia.component.html',
  styleUrls: ['./mi-asistencia.component.scss'],
  imports: [CommonModule],
  providers: [DecimalPipe, DatePipe]
})
export class MiAsistenciaComponent implements OnInit {
  // Estados principales
  loading = false;
  loadingHistorial = false;
  userId: string | undefined;
  currentUser: User | null = null;
  asistenciaHoy: Asistencia | null = null;
  asistencias: Asistencia[] = [];
  errorMessage: string = '';
  
  // Estadísticas
  stats: AsistenciaStats = {
    totalDias: 0,
    asistenciaCompleta: 0,
    retardos: 0,
    ausencias: 0,
    horasTrabajadas: 0
  };

  // Filtros y paginación
  filtroMes: Date = new Date();
  itemsPorPagina = 10;
  paginaActual = 1;
  totalPaginas = 0;

  constructor(
    private asistenciaService: AsistenciaService,
    private authService: AuthService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.inicializarComponente();
  }

  private async inicializarComponente() {
    this.authService.getUserData().subscribe({
      next: (user) => {
        if (user && user.uid) {
          this.userId = user.uid;
          this.currentUser = user;
          this.cargarAsistenciaHoy();
          this.cargarHistorialAsistencias();
        }
      },
      error: (error) => {
        console.error('Error al obtener datos del usuario:', error);
        this.errorMessage = 'Error al cargar los datos del usuario';
      }
    });
  }

  private async obtenerUbicacion(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  }

  async cargarAsistenciaHoy() {
    if (!this.userId || !this.currentUser) {
      this.errorMessage = 'No se ha podido identificar al usuario';
      return;
    }
  
    try {
      this.loading = true;
      const fecha = new Date().toISOString().split('T')[0];
      const asistenciaHoy = await this.asistenciaService.obtenerAsistenciaHoy(this.userId, fecha).toPromise();
      
      // Convierte los Timestamps a Date si es necesario
      if (asistenciaHoy) {
        if (asistenciaHoy.entrada instanceof Timestamp) {
          asistenciaHoy.entrada = asistenciaHoy.entrada.toDate();
        }
        if (asistenciaHoy.salida instanceof Timestamp) {
          asistenciaHoy.salida = asistenciaHoy.salida.toDate();
        }
      }
      
      this.asistenciaHoy = asistenciaHoy || null;
    } catch (error) {
      console.error('Error al cargar asistencia:', error);
      this.errorMessage = 'Error al cargar la asistencia';
    } finally {
      this.loading = false;
    }
  }

  async cargarHistorialAsistencias() {
    if (!this.userId) return;
    
    try {
      this.loadingHistorial = true;
      const primerDiaMes = new Date(this.filtroMes.getFullYear(), this.filtroMes.getMonth(), 1);
      const ultimoDiaMes = new Date(this.filtroMes.getFullYear(), this.filtroMes.getMonth() + 1, 0);
      
      this.asistenciaService.obtenerAsistenciasPorEmpleado(
        this.userId,
        primerDiaMes,
        ultimoDiaMes
      ).subscribe({
        next: (asistencias) => {
          this.asistencias = asistencias;
          this.calcularEstadisticas(asistencias);
          this.calcularPaginacion();
        },
        error: (error) => {
          console.error('Error al cargar historial:', error);
          this.errorMessage = 'Error al cargar el historial de asistencias';
        },
        complete: () => {
          this.loadingHistorial = false;
        }
      });
    } catch (error) {
      this.loadingHistorial = false;
      this.errorMessage = 'Error al cargar el historial';
    }
  }

  private calcularEstadisticas(asistencias: Asistencia[]) {
    this.stats = {
      totalDias: asistencias.length,
      asistenciaCompleta: asistencias.filter(a => a.entrada && a.salida).length,
      retardos: asistencias.filter(a => this.esRetardo(a)).length,
      ausencias: this.calcularAusencias(asistencias),
      horasTrabajadas: this.calcularHorasTrabajadas(asistencias)
    };
  }

  private esRetardo(asistencia: Asistencia): boolean {
    if (!asistencia.entrada) return false;
    const horaEntrada = new Date(asistencia.entrada);
    const limite = new Date(asistencia.entrada);
    limite.setHours(9, 0, 0); // Ejemplo: hora límite 9:00 AM
    return horaEntrada > limite;
  }

  private calcularAusencias(asistencias: Asistencia[]): number {
    const diasLaborales = this.getDiasLaboralesEnMes();
    return diasLaborales - asistencias.length;
  }

  private calcularHorasTrabajadas(asistencias: Asistencia[]): number {
    return asistencias.reduce((total, asistencia) => {
      if (asistencia.entrada && asistencia.salida) {
        const entrada = new Date(asistencia.entrada);
        const salida = new Date(asistencia.salida);
        const horas = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60);
        return total + horas;
      }
      return total;
    }, 0);
  }

  private getDiasLaboralesEnMes(): number {
    const year = this.filtroMes.getFullYear();
    const month = this.filtroMes.getMonth();
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    let diasLaborales = 0;
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(year, month, dia);
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) { // No contar sábados y domingos
        diasLaborales++;
      }
    }
    
    return diasLaborales;
  }

  private calcularPaginacion() {
    this.totalPaginas = Math.ceil(this.asistencias.length / this.itemsPorPagina);
  }

  async marcarEntrada() {
    if (!this.userId || !this.currentUser) {
      this.errorMessage = 'No se ha podido identificar al usuario';
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';
      
      const position = await this.obtenerUbicacion();
      
      const nuevaAsistencia: Partial<Asistencia> = {
        usuarioId: this.userId,
        nombreEmpleado: `${this.currentUser.nombres} ${this.currentUser.apellidos}`,
        entrada: new Date(),
        salida: null,
        fecha: new Date().toISOString().split('T')[0],
        ubicacionEntrada: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }
      };

      await this.asistenciaService.registrarEntrada(nuevaAsistencia);
      await this.cargarAsistenciaHoy();
      await this.cargarHistorialAsistencias();

    } catch (error) {
      console.error('Error al marcar entrada:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Error al marcar la entrada';
    } finally {
      this.loading = false;
    }
  }

  async marcarSalida() {
    if (!this.userId || !this.currentUser || !this.asistenciaHoy?.id) {
      this.errorMessage = 'No se ha encontrado un registro de entrada válido';
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';

      const position = await this.obtenerUbicacion();
      
      const ubicacionSalida = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      await this.asistenciaService.registrarSalida(this.asistenciaHoy.id, ubicacionSalida);
      await this.cargarAsistenciaHoy();
      await this.cargarHistorialAsistencias();

    } catch (error) {
      console.error('Error al marcar salida:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Error al marcar la salida';
    } finally {
      this.loading = false;
    }
  }

  // Métodos de formateo
  public formatTime(date: Date | Timestamp | null | undefined): string {
    if (!date) return '';
    
    // Si es un Timestamp de Firestore, conviértelo a Date
    const dateToFormat = date instanceof Timestamp 
      ? date.toDate() 
      : date;
    
    return this.datePipe.transform(dateToFormat, 'HH:mm') || '';
  }
  
  public formatCoordinate(coord: number | null | undefined): string {
    if (coord === null || coord === undefined) return '';
    return coord.toFixed(6);
  }
  
  public formatDate(date: string | Date | Timestamp | null | undefined): string {
    if (!date) return this.datePipe.transform(new Date(), 'longDate') || '';
    
    // Si es un Timestamp de Firestore, conviértelo a Date
    const dateToFormat = date instanceof Timestamp 
      ? date.toDate() 
      : (typeof date === 'string' ? new Date(date) : date);
    
    return this.datePipe.transform(dateToFormat, 'longDate') || '';
  }

  // Métodos de navegación y filtrado
  cambiarMes(incremento: number) {
    this.filtroMes.setMonth(this.filtroMes.getMonth() + incremento);
    this.cargarHistorialAsistencias();
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get asistenciasPaginadas(): Asistencia[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.asistencias.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }
}