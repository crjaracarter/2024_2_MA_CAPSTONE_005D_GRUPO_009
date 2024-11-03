import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TopbarComponent } from "../topbar/topbar.component";
import { MainContentComponent } from "../main-content/main-content.component";
import { RouterModule, Routes } from '@angular/router';
import { SidebarService } from '../../services/dashboard/sidebar.service';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/dashboard/device/device.service';

@Component({
  selector: 'app-mobile-dashboard',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, MainContentComponent, RouterModule, CommonModule ],
  templateUrl: './mobile-dashboard.component.html',
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Mobile Header -->
      <header class="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold">Madu Admin</h1>
          <button 
            (click)="toggleMobileMenu()"
            class="p-2 rounded-lg hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Mobile Navigation Menu (Slide from bottom) -->
      <div 
        *ngIf="isMenuOpen"
        class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
        (click)="toggleMobileMenu()">
        <div 
          class="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 transform transition-transform"
          [class.translate-y-0]="isMenuOpen"
          [class.translate-y-full]="!isMenuOpen"
          (click)="$event.stopPropagation()">
          <!-- Mobile Menu Items -->
          <nav class="space-y-4">
            <a *ngFor="let item of menuItems" 
               [routerLink]="item.route"
               class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100"
               (click)="toggleMobileMenu()">
              <span class="text-gray-700">{{item.label}}</span>
            </a>
          </nav>
        </div>
      </div>

      <!-- Mobile Content Area -->
      <main class="p-4">
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div class="flex justify-around p-2">
          <a *ngFor="let item of quickAccessItems" 
             [routerLink]="item.route"
             class="p-2 text-center">
            <i [class]="item.icon"></i>
            <span class="text-xs block">{{item.label}}</span>
          </a>
        </div>
      </nav>
    </div>
  `,
  styleUrl: './mobile-dashboard.component.scss'
})
export class MobileDashboardComponent {
  isMenuOpen = false;
  
  menuItems = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Usuarios', route: '/users' },
    { label: 'Configuración', route: '/settings' },
    // ... más items
  ];

  quickAccessItems = [
    { label: 'Home', route: '/dashboard', icon: 'home-icon' },
    { label: 'Users', route: '/users', icon: 'users-icon' },
    { label: 'Profile', route: '/profile', icon: 'profile-icon' },
    // ... items de acceso rápido
  ];

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
