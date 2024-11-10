import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterModule,
  Routes,
  Router,
} from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/dashboard/sidebar.service';
import { DeviceService } from '../../services/dashboard/device/device.service';
import { Subscription } from 'rxjs';

interface NavItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  private _authService = inject(AuthService);
  private _router = inject(Router);
  isMobile: boolean = window.innerWidth < 768;
  isOpen: boolean = false;
  private subscription: Subscription;

  constructor(public sidebarService: SidebarService) {
    this.subscription = this.sidebarService.isOpen$.subscribe(
      (isOpen) => (this.isOpen = isOpen)
    );
  }

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard/home', icon: 'dashboard' },
    { label: 'Personas', route: '/dashboard/usuarios', icon: 'people' },
  ];

  ngOnInit(): void {
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1275;
    
    // Si cambia de móvil a desktop, asegurarse que el sidebar esté abierto
    if (wasMobile && !this.isMobile) {
      this.sidebarService.openSidebar();
    }
    // Si cambia de desktop a móvil, cerrar el sidebar
    else if (!wasMobile && this.isMobile) {
      this.sidebarService.closeSidebar();
    }
  }

  async logout() {
    try {
      await this._authService.logout();
      toast.success('Has cerrado sesión exitosamente');
      this._router.navigateByUrl('/login');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Ocurrió un error al cerrar sesión');
      console.log('Logout clicked');
    }
  }
}
