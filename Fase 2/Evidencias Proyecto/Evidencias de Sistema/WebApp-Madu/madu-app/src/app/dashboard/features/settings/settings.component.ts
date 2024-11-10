import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule, AsyncPipe, NgClass } from '@angular/common';
import * as AOS from 'aos';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgClass],
  providers: [],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', 
          style({ transform: 'translateY(0)', opacity: 1 })
        )
      ]),
      transition(':leave', [
        animate('300ms ease-in', 
          style({ transform: 'translateY(20px)', opacity: 0 })
        )
      ])
    ])
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})

export class SettingsComponent implements OnInit {
  activeTab = 'general';
  darkMode = false;

  ngOnInit() {
    AOS.init({
      duration: 800,
      once: true,
      mirror: false
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }
}