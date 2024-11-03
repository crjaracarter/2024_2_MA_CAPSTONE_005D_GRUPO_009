import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, Routes, Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/dashboard/sidebar.service';
import { DeviceService } from '../../services/dashboard/device/device.service';


interface NavItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})


export class SidebarComponent {
  private _authService = inject(AuthService);
  private _router = inject(Router);
  isMobile: boolean = false;
  // public sidebarService = inject(SidebarService);
  constructor(public sidebarService: SidebarService) {}

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Personas', route: '/dashboard/personas', icon: 'people' },
  ];

  

  async logout() {
    try {
      await this._authService.logout();
      toast.success('Has cerrado sesión exitosamente');
      this._router.navigateByUrl('/login');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Ocurrió un error al cerrar sesión');
    }
  }


}
