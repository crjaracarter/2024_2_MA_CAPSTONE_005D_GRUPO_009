import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { AutenticacionService } from '../autenticacion.service';
import { EditProfileModalComponent } from './edit-profile-modal/edit-profile-modal.component';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

interface User {
  uid: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  region: string;
  ciudad: string;
  rut: string;
  genero: string;
  rol: string;
  estadoCuenta: string;
  fechaCreacion: any;
  ultimoAcceso: any;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ProfilePage implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  isLoading = false;
  regions = [
    'Arica y Parinacota',
    'Tarapacá',
    'Antofagasta',
    'Atacama',
    'Coquimbo',
    'Valparaíso',
    'Metropolitana',
    "O'Higgins",
    'Maule',
    'Ñuble',
    'Biobío',
    'Araucanía',
    'Los Ríos',
    'Los Lagos',
    'Aysén',
    'Magallanes',
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private autenticacionService: AutenticacionService,
    private modalController: ModalController,
    private router: Router,
    private alertController: AlertController
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellidos: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: [{value: '', disabled: true}],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      region: ['', Validators.required],
      ciudad: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      rut: [{value: '', disabled: true}],
      genero: ['', Validators.required],
      rol: [{value: '', disabled: true}],
      estadoCuenta: [{value: '', disabled: true}]
    });
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      const currentUser = await firstValueFrom(this.autenticacionService.getCurrentUser());
      if (currentUser?.uid) {
        this.userService.getUserById(currentUser.uid).subscribe(
          (userData: User | null) => {
            if (userData) {
              this.user = userData;
              this.profileForm.patchValue({
                nombres: userData.nombres,
                apellidos: userData.apellidos,
                email: userData.email,
                telefono: userData.telefono,
                region: userData.region,
                ciudad: userData.ciudad,
                rut: userData.rut,
                genero: userData.genero,
                rol: userData.rol,
                estadoCuenta: userData.estadoCuenta
              });
            }
            this.isLoading = false;
          },
          (error) => {
            console.error('Error loading user data:', error);
            this.isLoading = false;
          }
        );
      } else {
        console.error('No user found or user has no uid');
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      this.isLoading = false;
    }
  }

  async toggleEdit() {
    const modal = await this.modalController.create({
      component: EditProfileModalComponent,
      componentProps: {
        user: this.user,
        regions: this.regions
      },
      cssClass: 'profile-edit-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.updateProfile(data);
    }
  }

  private async updateProfile(userData: Partial<User>): Promise<void> {
    if (!this.user?.uid) return;
    
    this.isLoading = true;
    try {
      await this.userService.updateUser(this.user.uid, userData);
      this.user = { ...this.user, ...userData };
      this.profileForm.patchValue(userData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      this.isLoading = false;
    }
  }


  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'Activa': 'success',
      'Pendiente': 'warning',
      'Bloqueada': 'danger',
      'Inactiva': 'medium'
    };
    return statusColors[status] || 'medium';
  }

async logout() {
  const alert = await this.alertController.create({
    header: 'Cerrar Sesión',
    message: '¿Estás seguro que deseas cerrar sesión?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Cerrar Sesión',
        role: 'destructive',
        handler: async () => {
          try {
            await this.autenticacionService.logout();
            await this.router.navigate(['/login']);
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Opcional: mostrar un mensaje de error
            const errorAlert = await this.alertController.create({
              header: 'Error',
              message: 'No se pudo cerrar sesión. Por favor, intenta de nuevo.',
              buttons: ['OK']
            });
            await errorAlert.present();
          }
        }
      }
    ]
  });

  await alert.present();
}
}