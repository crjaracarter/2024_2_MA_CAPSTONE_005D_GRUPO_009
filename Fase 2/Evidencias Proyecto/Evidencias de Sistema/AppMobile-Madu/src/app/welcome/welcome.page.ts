// welcome.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage {
  currentSlide: number = 0;
  
  constructor(
    private router: Router,
    private navCtrl: NavController
  ) {}

  nextSlide() {
    if (this.currentSlide < 2) {
      this.currentSlide++;
    } else {
      this.goToLogin();
    }
  }

  goToLogin() {
    localStorage.setItem('hasSeenWelcome', 'true');
    // Usamos navCtrl en lugar de router para la animación
    this.navCtrl.navigateForward('/login');
  }
}