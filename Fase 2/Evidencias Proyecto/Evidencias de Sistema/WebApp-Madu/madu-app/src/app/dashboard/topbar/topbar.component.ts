import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterLink, RouterLinkActive, RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/dashboard/sidebar.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent{
  currentRoute: string = '';
  isMobile: boolean = false;


  constructor(
    private router: Router,
    public sidebarService: SidebarService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Obtiene la última parte de la URL
      this.currentRoute = event.url.split('/').pop();
      
      // O si prefieres puedes mapear las rutas a nombres más amigables
      const routeNames: { [key: string]: string } = {
        'home': 'Inicio',
        'users': 'Usuarios',
        'settings': 'Configuración',
        'profile': 'Mi Perfil',
        // ... agrega más mappings según necesites
      };
      this.currentRoute = routeNames[this.currentRoute] || this.currentRoute;
    });
    
  }
  
}
