import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('200ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ transform: 'translateY(-100%)' }))
      ])
    ])
  ]
})
export class HeaderComponent {
  isMobileMenuOpen = false;
  isScrolled = false;
  isSubMenuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router) {
    // Detectar scroll para cambiar estilos del header
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 20;
    });
  }
  async handleLoginClick() {
    if (this.authService.isLoggedIn()) {
      // Si el usuario ya está autenticado, redirigir al dashboard
      await this.router.navigate(['/dashboard']);
    } else {
      // Si no está autenticado, ir a la página de login
      await this.router.navigate(['/auth/login']);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Prevenir scroll cuando el menú está abierto
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  // Cerrar menú al hacer click en un enlace
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  // Opcional: Cerrar menú al cambiar tamaño de ventana
  ngOnInit() {
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) { // 768px es el breakpoint md de Tailwind
        this.isMobileMenuOpen = false;
        document.body.style.overflow = '';
      }
    });
  }

  ngOnDestroy() {
    // Limpiar event listeners
    window.removeEventListener('scroll', () => {});
    window.removeEventListener('resize', () => {});
  }

  toggleSubMenu() {
    this.isSubMenuOpen = !this.isSubMenuOpen;
  }
}

