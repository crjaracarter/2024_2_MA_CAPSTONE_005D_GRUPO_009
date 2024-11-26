import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { NgxSonnerToaster } from 'ngx-sonner';
import Scrollbar from 'smooth-scrollbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HomeComponent,
    NgxSonnerToaster
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'madu-app';

  ngOnInit(): void {
    initFlowbite();
  }
}
