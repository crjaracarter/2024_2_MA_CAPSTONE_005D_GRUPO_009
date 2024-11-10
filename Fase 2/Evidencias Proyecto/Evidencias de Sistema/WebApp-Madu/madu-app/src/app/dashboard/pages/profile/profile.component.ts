import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  User,
  UserRole,
  Gender,
  AccountStatus,
  UserService,
} from '../../../services/user/user.service';
import { AuthStateService } from '../../../shared/data-access/auth-state.service';

import { trigger, transition, style, animate } from '@angular/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MatDialog } from '@angular/material/dialog';
import { EditProfileModalComponent } from './edit-profile-modal/edit-profile-modal.component';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(20px)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  isEditing = false;
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

  readonly Gender = Gender;
  readonly UserRole = UserRole;
  readonly AccountStatus = AccountStatus;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authState: AuthStateService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      nombres: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        ],
      ],
      apellidos: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        ],
      ],
      email: [{ value: '', disabled: true }],
      telefono: [
        { value: '', disabled: true },
        [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)],
      ],
      region: [{ value: '', disabled: true }, Validators.required],
      ciudad: [
        { value: '', disabled: true },
        [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)],
      ],
      rut: [{ value: '', disabled: true }],
      genero: [{ value: '', disabled: true }, Validators.required],
      rol: [{ value: '', disabled: true }],
      estadoCuenta: [{ value: '', disabled: true }],
    });

    this.addValidators();
  }
  private addValidators(): void {
    const nombresControl = this.profileForm.get('nombres');
    const apellidosControl = this.profileForm.get('apellidos');
    const telefonoControl = this.profileForm.get('telefono');
    const regionControl = this.profileForm.get('region');
    const ciudadControl = this.profileForm.get('ciudad');
    const generoControl = this.profileForm.get('genero');
  
    if (nombresControl) {
      nombresControl.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]);
    }
  
    if (apellidosControl) {
      apellidosControl.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]);
    }
  
    if (telefonoControl) {
      telefonoControl.setValidators([
        Validators.required,
        Validators.pattern(/^\+?[0-9]{8,15}$/)
      ]);
    }
  
    if (regionControl) {
      regionControl.setValidators([Validators.required]);
    }
  
    if (ciudadControl) {
      ciudadControl.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]);
    }
  
    if (generoControl) {
      generoControl.setValidators([Validators.required]);
    }
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      const currentUser = this.authState.currentUser;
      if (currentUser) {
        const users = await this.userService.getUsers();
        this.user = users.find((u) => u.uid === currentUser.uid) || null;
        if (this.user) {
          this.profileForm.patchValue({
            ...this.user,
            fechaCreacion: this.formatDate(this.user.fechaCreacion),
            ultimoAcceso: this.formatDate(this.user.ultimoAcceso),
          });
        }
      }
    } catch (error) {
      this.toastr.error('No se pudo cargar la información del perfil', 'Error');
      console.error('Error loading profile:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private formatDate(date: Date): string {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.profileForm.get(controlName);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;
    const errorMessages: { [key: string]: string } = {
      required: 'Este campo es requerido',
      minlength: `Mínimo ${errors['minlength']?.requiredLength} caracteres`,
      pattern:
        {
          nombres: 'Solo se permiten letras y espacios',
          apellidos: 'Solo se permiten letras y espacios',
          telefono: 'Formato de teléfono inválido',
          ciudad: 'Solo se permiten letras y espacios',
        }[controlName] || 'Formato inválido',
      email: 'Email inválido',
    };

    const firstError = Object.keys(errors)[0];
    return errorMessages[firstError] || 'Error de validación';
  }

  async onSubmit() {
    if (this.profileForm.valid && this.user?.uid) {
      this.isLoading = true;
      try {
        const formValue = this.profileForm.getRawValue();
        // Solo enviamos los campos editables
        const updateData: Partial<User> = {
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          telefono: formValue.telefono,
          region: formValue.region,
          ciudad: formValue.ciudad,
          genero: formValue.genero,
        };

        await this.userService.updateUser(this.user.uid, updateData);
        this.toastr.success(
          'Los cambios han sido guardados correctamente',
          'Perfil Actualizado'
        );
        this.isEditing = false;

        // Actualizamos el usuario local con los nuevos datos
        this.user = { ...this.user, ...updateData };
      } catch (error) {
        this.toastr.error('No se pudieron guardar los cambios', 'Error');
        console.error('Error updating profile:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      // Marcamos todos los campos como touched para mostrar los errores
      Object.keys(this.profileForm.controls).forEach((key) => {
        const control = this.profileForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  toggleEdit(): void {
    const dialogRef = this.dialog.open(EditProfileModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-modal-container',
      disableClose: false,
      data: { user: this.user, regions: this.regions }
    });
  
    dialogRef.afterClosed().subscribe((result: Partial<User> | undefined) => {
      if (result) {
        this.updateProfile(result);
      }
    });
    
    if (this.isEditing) {
      // Habilitamos los campos editables
      this.profileForm.get('nombres')?.enable();
      this.profileForm.get('apellidos')?.enable();
      this.profileForm.get('telefono')?.enable();
      this.profileForm.get('region')?.enable();
      this.profileForm.get('ciudad')?.enable();
      this.profileForm.get('genero')?.enable();
    } else {
      // Si cancelamos, restauramos valores y deshabilitamos
      if (this.user) {
        this.profileForm.patchValue({
          ...this.user,
          fechaCreacion: this.formatDate(this.user.fechaCreacion),
          ultimoAcceso: this.formatDate(this.user.ultimoAcceso),
        });
      }
      // Deshabilitamos todos los campos
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.disable();
      });
    }
  }

  // Helpers para las validaciones en el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!field && field.valid && (field.dirty || field.touched);
  }

  getRolLabel(rol: UserRole): string {
    return (
      {
        [UserRole.ADMIN]: 'Administrador',
        [UserRole.EMPLEADOR]: 'Empleador',
        [UserRole.EMPLEADO]: 'Empleado',
        [UserRole.USUARIO]: 'Usuario',
      }[rol] || rol
    );
  }

  getAccountStatusLabel(status: AccountStatus): string {
    return (
      {
        [AccountStatus.ACTIVA]: 'Activa',
        [AccountStatus.INACTIVA]: 'Inactiva',
        [AccountStatus.PENDIENTE]: 'Pendiente',
        [AccountStatus.BLOQUEADA]: 'Bloqueada',
      }[status] || status
    );
  }

  isFormValid(): boolean {
    return this.profileForm.valid && !this.isLoading && this.isEditing;
  }

  hasUnsavedChanges(): boolean {
    if (!this.user) return false;
    const formValue = this.profileForm.getRawValue();
    return Object.keys(formValue).some(
      (key) => formValue[key] !== this.user![key as keyof User]
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }

  private async updateProfile(userData: Partial<User>): Promise<void> {
    if (!this.user?.uid) return;
    
    this.isLoading = true;
    try {
      await this.userService.updateUser(this.user.uid, userData);
      this.user = { ...this.user, ...userData };
      this.profileForm.patchValue(userData);
      this.toastr.success('Perfil actualizado correctamente');
    } catch (error) {
      this.toastr.error('Error al actualizar el perfil');
      console.error('Error updating profile:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
