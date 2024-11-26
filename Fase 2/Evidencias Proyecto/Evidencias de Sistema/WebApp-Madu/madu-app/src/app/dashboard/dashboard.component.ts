import { Component, OnInit, HostListener } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { RouterModule, Routes } from '@angular/router';
import { SidebarService } from '../services/dashboard/sidebar.service';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../services/dashboard/device/device.service';
import { trigger, transition, style, animate } from '@angular/animations';
import * as AOS from 'aos';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidebarComponent,
    TopbarComponent,
    RouterModule,
    CommonModule,
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  // isMobile: boolean = false;
  isMobile: boolean = window.innerWidth < 1275;
  isOpen: boolean = false;
  
  
    


  constructor(
    public sidebarService: SidebarService,
  ) {
    
    // Suscribirse al estado del sidebar
    this.sidebarService.isOpen$.subscribe(
      (isOpen) => this.isOpen = isOpen
    );
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    AOS.init({
      duration: 800,
      offset: 100,
      once: true
    });
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
