import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
export class HomeComponent implements OnInit {
  totalUsers: number = 0;
  recentActivities: RecentActivity[] = [
    {
      initials: 'JD',
      description: 'Juan Díaz aplicó a Desarrollador Frontend',
      time: 'Hace 5 minutos'
    },
    {
      initials: 'MA',
      description: 'María Álvarez actualizó su perfil',
      time: 'Hace 15 minutos'
    },
    // Añade más actividades según necesites
  ];

  constructor() {}

  ngOnInit(): void {
    // Aquí puedes inicializar tus datos
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Aquí cargarías los datos de tu backend
    this.totalUsers = 10; // Ejemplo
  }
}
