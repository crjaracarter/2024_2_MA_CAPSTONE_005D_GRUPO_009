// device.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private isMobile = new BehaviorSubject<boolean>(false);
  isMobile$ = this.isMobile.asObservable();

  constructor() {
    // Detectar inicialmente
    this.checkDevice();
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', () => {
      this.checkDevice();
    });
  }

  private checkDevice() {
    // Puedes ajustar este breakpoint según necesites
    const isMobileView = window.innerWidth < 750; // xl breakpoint
    this.isMobile.next(isMobileView);
  }

  // Detectar si es un dispositivo móvil real
  isRealMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}