import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterLink, RouterLinkActive, RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent{
  currentRoute: string = '';

  constructor(private router: Router) {
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
