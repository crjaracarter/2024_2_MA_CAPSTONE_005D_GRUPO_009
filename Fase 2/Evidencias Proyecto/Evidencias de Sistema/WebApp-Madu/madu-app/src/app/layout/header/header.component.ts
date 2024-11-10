import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isMobileMenuOpen = false;
  isScrolled = false;

  constructor() {
    // Detectar scroll para cambiar estilos del header
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 20;
    });
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
}

