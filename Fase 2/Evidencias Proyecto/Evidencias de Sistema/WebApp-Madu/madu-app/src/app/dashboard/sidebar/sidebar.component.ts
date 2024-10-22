import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, Routes, Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';
import { toast } from 'ngx-sonner';


interface NavItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Personas', route: '/dashboard/personas', icon: 'people' },
  ];
  private _authService = inject(AuthService);
  private _router = inject(Router);

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
