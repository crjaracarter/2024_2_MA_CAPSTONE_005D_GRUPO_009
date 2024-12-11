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
import { map, Subscription, tap } from 'rxjs';
import { AuthStateService } from '../../shared/data-access/auth-state.service';
import { UserRole } from '../../core/interfaces/user.interface';

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
  UserRole = UserRole;
  isEmpleador: boolean = false;
  private userSubscription?: Subscription;
  isAdmin: boolean = false;
  isEmpleado: boolean = false;
  
  
  constructor(
    public sidebarService: SidebarService,
    public authState: AuthStateService) {
    this.subscription = this.sidebarService.isOpen$.subscribe(
      (isOpen) => (this.isOpen = isOpen)
    );

    console.log('UserRole enum:', UserRole);
  }

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard/home', icon: 'dashboard' },
    { label: 'Personas', route: '/dashboard/usuarios', icon: 'people' },
  ];

  get isAdmin$() {
    return this.authState.user$.pipe(
      map(user => user?.rol === UserRole.ADMIN)
    );
  }

  get isEmpleador$() {
    return this.authState.user$.pipe(
      map(user => user?.rol === UserRole.EMPLEADOR)
    );
  }

  get isEmpleado$() {
    return this.authState.user$.pipe(
      map(user => user?.rol === UserRole.EMPLEADO)
    );
  }

  ngOnInit(): void {
    this.checkScreenSize();
    
    this.userSubscription = this.authState.user$.subscribe(user => {
      this.isEmpleador = user?.rol === UserRole.EMPLEADOR;
      this.isAdmin = user?.rol === UserRole.ADMIN;
      this.isEmpleado = user?.rol === UserRole.EMPLEADO;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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
