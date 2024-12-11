import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AutenticacionService } from '../autenticacion.service';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  email: string = '';
  isLoading = false;

  constructor(
    private authService: AutenticacionService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async resetPassword() {
    if (this.email && !this.isLoading) {
      this.isLoading = true;
      
      try {
        const loading = await this.loadingController.create({
          message: 'Enviando email de recuperación...',
        });
        await loading.present();

        await this.authService.resetPassword(this.email);
        
        await loading.dismiss();
        await this.showSuccess('Se ha enviado un email para restablecer tu contraseña');
        await this.router.navigate(['/login']);
      } catch (error: any) {
        console.error('Error al restablecer contraseña:', error);
        await this.showError(error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  private async showError(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 30,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  private async showSuccess(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }
}