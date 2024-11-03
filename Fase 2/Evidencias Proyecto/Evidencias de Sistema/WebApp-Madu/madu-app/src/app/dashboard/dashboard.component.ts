import { Component, OnInit, HostListener } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { MainContentComponent } from './main-content/main-content.component';
import { RouterModule, Routes } from '@angular/router';
import { SidebarService } from '../services/dashboard/sidebar.service';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../services/dashboard/device/device.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidebarComponent,
    TopbarComponent,
    MainContentComponent,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  isMobile = window.innerWidth < 1280;  // Usando xl breakpoint de Tailwind
  // isMobile: boolean = false;

  constructor(public sidebarService: SidebarService) {}

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.sidebarService.openSidebar();
    } else {
      this.sidebarService.closeSidebar();
    }
  }

  // constructor(
  //   public deviceService: DeviceService,
  //   public sidebarService: SidebarService) {
  //   // Detector de cambios de tamaño de ventana
  //   window.addEventListener('resize', () => {
  //     this.isMobile = window.innerWidth < 1280;
  //     if (!this.isMobile) {
  //       this.sidebarService.closeSidebar();
  //     }
  //   });
  // }
}
