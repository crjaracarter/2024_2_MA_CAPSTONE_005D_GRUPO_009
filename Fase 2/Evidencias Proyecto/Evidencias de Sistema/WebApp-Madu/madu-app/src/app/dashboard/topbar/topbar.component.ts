import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterLink, RouterLinkActive, RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/dashboard/sidebar.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  currentRoute: string = '';
  isOpen: boolean = false;

  constructor(
    private router: Router,
    public sidebarService: SidebarService
  ) {
    this.sidebarService.isOpen$.subscribe(
      isOpen => this.isOpen = isOpen
    );
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = this.getRouteName(event.url);
      if (window.innerWidth < 1275) {
        this.sidebarService.closeSidebar();
      }
    });
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  ngOnInit(): void {
    this.currentRoute = this.getRouteName(this.router.url);
  }

  private getRouteName(url: string): string {
    const segments = url.split('/');
    return segments[segments.length - 1] || 'home';
  }
}
