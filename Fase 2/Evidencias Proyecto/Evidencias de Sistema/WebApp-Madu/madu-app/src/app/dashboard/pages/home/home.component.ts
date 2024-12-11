import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../shared/data-access/auth-state.service';
import { UserRole } from '../../../core/interfaces/user.interface';
import { Subscription } from 'rxjs';

interface RecentActivity {
  initials: string;
  description: string;
  time: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  totalUsers: number = 0;
  private userSubscription?: Subscription;
  
  // Variables para control de roles
  isAdmin: boolean = false;
  isEmpleador: boolean = false;
  isEmpleado: boolean = false;
  isUsuario: boolean = false;

  // Actividades específicas por rol
  adminActivities: RecentActivity[] = [
    {
      initials: 'JD',
      description: 'Nuevo usuario registrado: Juan Díaz',
      time: 'Hace 5 minutos'
    },
    {
      initials: 'MA',
      description: 'Nueva empresa registrada: Tech Solutions',
      time: 'Hace 15 minutos'
    }
  ];

  empleadorActivities: RecentActivity[] = [
    {
      initials: 'CV',
      description: 'Carlos Vega aplicó a Desarrollador Frontend',
      time: 'Hace 10 minutos'
    },
    {
      initials: 'LP',
      description: 'Laura Pérez aceptó la oferta de trabajo',
      time: 'Hace 1 hora'
    }
  ];

  empleadoActivities: RecentActivity[] = [
    {
      initials: 'RH',
      description: 'Registro de entrada completado',
      time: 'Hace 2 horas'
    },
    {
      initials: 'HR',
      description: 'Nueva tarea asignada por tu supervisor',
      time: 'Hace 3 horas'
    }
  ];

  usuarioActivities: RecentActivity[] = [
    {
      initials: 'TS',
      description: 'Tech Solutions publicó nueva oferta',
      time: 'Hace 30 minutos'
    },
    {
      initials: 'DS',
      description: 'Dev Solutions vio tu perfil',
      time: 'Hace 2 horas'
    }
  ];

  recentActivities: RecentActivity[] = [];

  constructor(private authState: AuthStateService) {}

  ngOnInit(): void {
    this.userSubscription = this.authState.user$.subscribe(user => {
      // Actualizar flags de roles
      this.isAdmin = user?.rol === UserRole.ADMIN;
      this.isEmpleador = user?.rol === UserRole.EMPLEADOR;
      this.isEmpleado = user?.rol === UserRole.EMPLEADO;
      this.isUsuario = user?.rol === UserRole.USUARIO;

      // Cargar datos específicos según rol
      this.loadDashboardData();
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private loadDashboardData(): void {
    // Cargar actividades según rol
    if (this.isAdmin) {
      this.recentActivities = this.adminActivities;
      this.loadAdminData();
    } else if (this.isEmpleador) {
      this.recentActivities = this.empleadorActivities;
      this.loadEmpleadorData();
    } else if (this.isUsuario) {
      this.recentActivities = this.usuarioActivities;
      this.loadUsuarioData();
    }
  }

  private loadAdminData(): void {
    // Cargar datos específicos del admin
    this.totalUsers = 100; // Ejemplo
  }

  private loadEmpleadorData(): void {
    // Cargar datos específicos del empleador
    this.totalUsers = 15; // Ejemplo de empleados en su empresa
  }

  private loadUsuarioData(): void {
    // Cargar datos específicos del usuario
    this.totalUsers = 5; // Ejemplo de postulaciones activas
  }
}