import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import {
  User,
  UserRole,
  Gender,
  AccountStatus,
} from '../../../core/interfaces/user.interface';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-personas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './personas.component.html',
  styleUrls: ['./personas.component.scss'],
})
export class PersonasComponent implements OnInit {
  users$!: Observable<User[]>;
  filteredUsers$!: Observable<User[]>;
  userForm!: FormGroup;
  isLoading = false;
  isEditing = false;
  showModal = false;
  selectedUser: User | null = null;

  // Filtros y búsqueda
  searchTerm = '';
  filterRole$ = '';
  filterStatus$ = '';
  private searchSubject = new BehaviorSubject<string>('');

  // Ordenamiento
  currentSort = { field: '', direction: '' };

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Enums y constantes
  readonly userRoles = Object.values(UserRole);
  readonly genders = Object.values(Gender);
  readonly accountStatuses = Object.values(AccountStatus);

  tableHeaders = [
    { key: 'nombres', label: 'Nombre Completo' },
    { key: 'email', label: 'Email' },
    { key: 'rol', label: 'Rol' },
    { key: 'estadoCuenta', label: 'Estado' },
    { key: 'region', label: 'Ubicación' },
    { key: 'fechaCreacion', label: 'Fecha Registro' },
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initializeData();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+56\d{9}$/)]],
      region: ['', Validators.required],
      ciudad: ['', Validators.required],
      rut: ['', [Validators.required]],
      rol: ['', Validators.required],
      genero: ['', Validators.required],
      estadoCuenta: ['Activa'],
    });
  }

  private initializeData(): void {
    this.users$ = this.userService.getUsers();

    this.filteredUsers$ = combineLatest([
      this.users$,
      this.searchSubject.pipe(startWith('')),
      this.filterRole$,
      this.filterStatus$,
    ]).pipe(
      map(([users, search, role, status]) => {
        return this.filterUsers(users, search, role, status);
      })
    );
  }

  // Métodos de filtrado y búsqueda
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  private filterUsers(
    users: User[],
    search: string,
    role: string,
    status: string
  ): User[] {
    let filtered = users;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nombres.toLowerCase().includes(searchLower) ||
          user.apellidos.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    if (role) {
      filtered = filtered.filter((user) => user.rol === role);
    }

    if (status) {
      filtered = filtered.filter((user) => user.estadoCuenta === status);
    }

    return filtered;
  }

  // Métodos de ordenamiento
  sortBy(field: string): void {
    if (this.currentSort.field === field) {
      this.currentSort.direction =
        this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.field = field;
      this.currentSort.direction = 'asc';
    }

    this.filteredUsers$ = this.filteredUsers$.pipe(
      map((users) =>
        this.sortUsers([...users], field, this.currentSort.direction)
      )
    );
  }

  private sortUsers(users: User[], field: string, direction: string): User[] {
    return users.sort((a: any, b: any) => {
      const aValue = a[field];
      const bValue = b[field];
      return direction === 'asc'
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });
  }

  // Métodos CRUD
  async onSubmit(): Promise<void> {
    if (this.userForm.valid) {
      this.isLoading = true;
      try {
        const userData = this.userForm.value;

        if (this.isEditing && this.selectedUser?.uid) {
          await this.userService.updateUser(this.selectedUser.uid, userData);
          this.toast.success('Usuario actualizado exitosamente');
        } else {
          await this.userService.createUser(userData);
          this.toast.success('Usuario creado exitosamente');
        }

        this.closeModal();
        this.loadUsers();
      } catch (error) {
        this.toast.error('Ocurrió un error. Por favor intenta nuevamente');
        console.error('Error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
  private loadUsers(): void {
    this.isLoading = true;
    this.users$ = this.userService.getUsers().pipe(
      tap(() => this.isLoading = false),
      catchError(error => {
        this.toast.error('Error al cargar usuarios');
        console.error('Error:', error);
        return of([]);
      })
    );
    
    // Actualizar usuarios filtrados
    this.filteredUsers$ = combineLatest([
      this.users$,
      this.searchSubject.pipe(startWith('')),
    ]).pipe(
      map(([users, search]) => 
        this.filterUsers(users, search, this.filterRole$, this.filterStatus$)
      )
    );
  }

  async deleteUser(uid: string): Promise<void> {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await this.userService.deleteUser(uid);
        this.toast.success('Usuario eliminado exitosamente');
        this.loadUsers();
      } catch (error) {
        this.toast.error('Error al eliminar usuario');
        console.error('Error:', error);
      }
    }
  }

  // Métodos de modal
  openModal(user?: User): void {
    if (user) {
      this.isEditing = true;
      this.selectedUser = user;
      this.userForm.patchValue(user);
    } else {
      this.isEditing = false;
      this.selectedUser = null;
      this.userForm.reset({ estadoCuenta: 'Activa' });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.userForm.reset();
    this.isEditing = false;
    this.selectedUser = null;
  }
}