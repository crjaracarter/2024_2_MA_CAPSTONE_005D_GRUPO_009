import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink, Router  } from '@angular/router';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    Calendly: {
      initPopupWidget: (options: { url: string }) => void;
    }
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  openCalendly(): void {
    window.Calendly?.initPopupWidget({
      url: 'https://calendly.com/sr-crisllet'
    });
  }
}
