import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import {
  UserService,
  User,
  UserRole,
  AccountStatus,
  Gender,
} from '../../../services/user/user.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class UsuariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  // Signals y estados
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  editingUser = signal<Partial<User>>({});
  isEditing = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  userToDelete = signal<User | null>(null);
  currentFilter = signal<AccountStatus | 'ALL'>('ALL');

  // Enums para el template
  UserRole = UserRole;
  Gender = Gender;
  AccountStatus = AccountStatus;

  // Formulario de búsqueda y filtros
  searchForm: FormGroup = this.fb.group({
    searchTerm: [''],
    role: ['ALL'],
    status: ['ALL'],
    sortBy: ['nombres'],
    sortDirection: ['asc'],
  });

  // Estadísticas de usuarios
  stats = signal({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0,
    roleDistribution: {
      [UserRole.ADMIN]: 0,
      [UserRole.EMPLEADOR]: 0,
      [UserRole.EMPLEADO]: 0,
      [UserRole.USUARIO]: 0,
    },
  });

  // Opciones de ordenamiento
  sortOptions = [
    { value: 'nombres', label: 'Nombre' },
    { value: 'email', label: 'Email' },
    { value: 'fechaCreacion', label: 'Fecha de creación' },
    { value: 'ultimoAcceso', label: 'Último acceso' },
  ];

  ngOnInit() {
    this.loadUsers();
    this.setupSearch();
    this.setupSorting();
  }

  private setupSearch() {
    this.searchForm
      .get('searchTerm')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyFilters());

    // Observar cambios en filtros
    ['role', 'status'].forEach((control) => {
      this.searchForm
        .get(control)
        ?.valueChanges.subscribe(() => this.applyFilters());
    });
  }

  private setupSorting() {
    ['sortBy', 'sortDirection'].forEach((control) => {
      this.searchForm
        .get(control)
        ?.valueChanges.subscribe(() => this.sortUsers());
    });
  }

  async loadUsers() {
    this.isLoading.set(true);
    try {
      const users = await this.userService.getUsers();
      this.users.set(users);
      this.calculateStats();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading users:', error);
      // Aquí podrías implementar un sistema de notificaciones para errores
    } finally {
      this.isLoading.set(false);
    }
  }

  private calculateStats() {
    const currentUsers = this.users();
    this.stats.set({
      total: currentUsers.length,
      active: currentUsers.filter(
        (u) => u.estadoCuenta === AccountStatus.ACTIVA
      ).length,
      inactive: currentUsers.filter(
        (u) => u.estadoCuenta === AccountStatus.INACTIVA
      ).length,
      blocked: currentUsers.filter(
        (u) => u.estadoCuenta === AccountStatus.BLOQUEADA
      ).length,
      roleDistribution: {
        [UserRole.ADMIN]: currentUsers.filter((u) => u.rol === UserRole.ADMIN)
          .length,
        [UserRole.EMPLEADOR]: currentUsers.filter(
          (u) => u.rol === UserRole.EMPLEADOR
        ).length,
        [UserRole.EMPLEADO]: currentUsers.filter(
          (u) => u.rol === UserRole.EMPLEADO
        ).length,
        [UserRole.USUARIO]: currentUsers.filter(
          (u) => u.rol === UserRole.USUARIO
        ).length,
      },
    });
  }

  private applyFilters() {
    const searchTerm = this.searchForm.get('searchTerm')?.value.toLowerCase();
    const role = this.searchForm.get('role')?.value;
    const status = this.searchForm.get('status')?.value;

    let filtered = this.users().filter((user) => {
      const matchesSearch =
        !searchTerm ||
        user.nombres.toLowerCase().includes(searchTerm) ||
        user.apellidos.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.rut.toLowerCase().includes(searchTerm);

      const matchesRole = role === 'ALL' || user.rol === role;
      const matchesStatus = status === 'ALL' || user.estadoCuenta === status;

      return matchesSearch && matchesRole && matchesStatus;
    });

    this.sortUsers(filtered);
  }

  private sortUsers(users: User[] = this.filteredUsers()) {
    const sortBy = this.searchForm.get('sortBy')?.value;
    const sortDirection = this.searchForm.get('sortDirection')?.value;

    const sorted = [...users].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'nombres') {
        comparison = (a.nombres + ' ' + a.apellidos).localeCompare(
          b.nombres + ' ' + b.apellidos
        );
      } else if (sortBy === 'fechaCreacion' || sortBy === 'ultimoAcceso') {
        comparison =
          new Date(a[sortBy as keyof User] as string).getTime() -
          new Date(b[sortBy as keyof User] as string).getTime();
      } else {
        comparison = String(a[sortBy as keyof User]).localeCompare(
          String(b[sortBy as keyof User])
        );
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredUsers.set(sorted);
  }

  // Métodos de gestión de usuarios
  async updateUserRole(user: User) {
    if (!user.uid || user.rol === UserRole.ADMIN) return;

    this.isLoading.set(true);
    try {
      await this.userService.updateUser(user.uid, { rol: user.rol });
      await this.loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  showDetails(user: User) {
    this.selectedUser.set(user);
    this.isEditing.set(false);
  }

  editUser(user: User) {
    this.selectedUser.set(user);
    this.editingUser.set({ ...user });
    this.isEditing.set(true);
  }

  async saveEdit() {
    const currentSelectedUser = this.selectedUser();
    const currentEditingUser = this.editingUser();

    if (!currentSelectedUser?.uid || !currentEditingUser) return;

    this.isLoading.set(true);
    try {
      await this.userService.updateUser(
        currentSelectedUser.uid,
        currentEditingUser
      );
      await this.loadUsers();
      this.closeModal();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  confirmDelete(user: User) {
    this.userToDelete.set(user);
    this.showDeleteConfirm.set(true);
  }

  async deleteUser() {
    const userToDelete = this.userToDelete();
    if (!userToDelete?.uid) return;

    this.isLoading.set(true);
    try {
      await this.userService.deleteUser(userToDelete.uid);
      this.showDeleteConfirm.set(false);
      this.userToDelete.set(null);
      await this.loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateAccountStatus(user: User, status: AccountStatus) {
    if (!user.uid) return;

    this.isLoading.set(true);
    try {
      await this.userService.updateUser(user.uid, { estadoCuenta: status });
      await this.loadUsers();
    } catch (error) {
      console.error('Error updating account status:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  closeModal() {
    this.selectedUser.set(null);
    this.isEditing.set(false);
    this.editingUser.set({});
  }

  // Utilidades
  getStatusBadgeClass(status: AccountStatus): string {
    const baseClasses = 'status-badge';
    switch (status) {
      case AccountStatus.ACTIVA:
        return `${baseClasses} active`;
      case AccountStatus.INACTIVA:
        return `${baseClasses} inactive`;
      case AccountStatus.BLOQUEADA:
        return `${baseClasses} blocked`;
      default:
        return baseClasses;
    }
  }

  // Exportar usuarios a CSV
  exportToCSV() {
    const users = this.filteredUsers();
    if (users.length === 0) return;

    const headers = [
      'Nombre',
      'Email',
      'RUT',
      'Rol',
      'Estado',
      'Último Acceso',
    ];
    const csvData = users.map((user) => [
      `${user.nombres} ${user.apellidos}`,
      user.email,
      user.rut,
      user.rol,
      user.estadoCuenta,
      new Date(user.ultimoAcceso).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'usuarios.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
