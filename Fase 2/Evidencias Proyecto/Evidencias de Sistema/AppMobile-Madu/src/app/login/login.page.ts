import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AutenticacionService } from '../autenticacion.service';
import { UserService } from '../user.service';
import { User, UserRole, AccountStatus } from '../interfaces/user.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  allowedRoles = [UserRole.ADMIN, UserRole.EMPLEADOR, UserRole.EMPLEADO];

  constructor(
    private formBuilder: FormBuilder,
    private autenticacionService: AutenticacionService,
    private userService: UserService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    console.log('LoginPage initialized');
  }

  async login() {
    if (!this.loginForm.valid) {
      return this.showError('Por favor, completa todos los campos correctamente');
    }

    const loading = await this.loadingController.create({
      message: 'Verificando credenciales...'
    });
    await loading.present();

    try {
      const userCredential = await this.autenticacionService.loginUser(
        this.loginForm.value.email,
        this.loginForm.value.password
      );

      if (userCredential && userCredential.user) {
        const userData = await firstValueFrom(this.userService.getUserById(userCredential.user.uid));

        if (!userData) {
          throw new Error('No se encontraron datos del usuario');
        }

        console.log('Datos del usuario:', {
          rol: userData.rol,
          tipo: typeof userData.rol,
          estadoCuenta: userData.estadoCuenta
        });

        const userRoleEnum = userData.rol as UserRole;
        if (!this.allowedRoles.includes(userRoleEnum)) {
          await this.autenticacionService.logout();
          throw new Error(`Acceso no permitido para el rol: ${userData.rol}`);
        }

        if (userData.estadoCuenta === AccountStatus.BLOQUEADA) {
          await this.autenticacionService.logout();
          throw new Error('Tu cuenta está bloqueada. Contacta al administrador');
        }

        if (userData.estadoCuenta === AccountStatus.INACTIVA) {
          await this.autenticacionService.logout();
          throw new Error('Tu cuenta está inactiva. Contacta al administrador');
        }

        if (userData.estadoCuenta === AccountStatus.PENDIENTE) {
          await this.autenticacionService.logout();
          throw new Error('Tu cuenta está pendiente de activación');
        }

        await loading.dismiss();
        this.showSuccess(`Bienvenido ${userData.nombres}`);
        
        try {
          await this.router.navigate(['/tabs/home'], { replaceUrl: true });
          console.log('Navegación exitosa a /tabs/home');
        } catch (navError) {
          console.error('Error en la navegación:', navError);
          this.showError('Error al navegar a la página principal');
        }
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      await loading.dismiss();
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
      }
      
      this.showError(errorMessage);
      this.loginForm.get('password')?.reset();
    }
  }

  private async showError(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });
    await toast.present();
  }

  private async showSuccess(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }
}