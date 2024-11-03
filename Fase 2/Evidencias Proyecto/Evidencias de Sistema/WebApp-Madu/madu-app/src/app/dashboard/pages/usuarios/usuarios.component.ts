// src/app/dashboard/pages/usuarios/usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UserService,
  User,
  UserRole,
  AccountStatus,
  Gender,
} from '../../../services/user/user.service';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto py-6 px-4">
      <div class="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 class="text-2xl font-bold text-indigo-700">Gestión de Usuarios</h2>
        <div class="mt-4 sm:mt-0">
          <span class="relative z-0 inline-flex shadow-sm rounded-md">
            <button
              (click)="filterByStatus(AccountStatus.ACTIVA)"
              [class.bg-indigo-50]="currentFilter === AccountStatus.ACTIVA"
              class="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Activos
            </button>
            <button
              (click)="filterByStatus(AccountStatus.INACTIVA)"
              [class.bg-indigo-50]="currentFilter === AccountStatus.INACTIVA"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Inactivos
            </button>
            <button
              (click)="filterByStatus(AccountStatus.BLOQUEADA)"
              [class.bg-indigo-50]="currentFilter === AccountStatus.BLOQUEADA"
              class="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Suspendidos
            </button>
          </span>
        </div>
      </div>

      <!-- Loader -->
      <div *ngIf="isLoading" class="flex items-center justify-center py-8">
        <div class="inline-flex items-center px-4 py-2 space-x-3">
          <svg
            aria-hidden="true"
            class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- ... SVG path del loader ... -->
          </svg>
          <span class="text-indigo-600 text-lg">Cargando usuarios...</span>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div
        *ngIf="!isLoading"
        class="overflow-x-auto bg-white shadow-md rounded-lg"
      >
        <table class="min-w-full table-auto">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Usuario
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contacto
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rol
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Último Acceso
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of filteredUsers" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.nombres }} {{ user.apellidos }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.rut }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
                <div class="text-sm text-gray-500">{{ user.telefono }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select
                  [(ngModel)]="user.rol"
                  (change)="updateUserRole(user)"
                  class="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option [value]="UserRole.ADMIN">Administrador</option>
                  <option [value]="UserRole.EMPLEADOR">Empleador</option>
                  <option [value]="UserRole.EMPLEADO">Empleado</option>
                  <option [value]="UserRole.USUARIO">Usuario</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getStatusBadgeClass(user.estadoCuenta)">
                  {{ user.estadoCuenta }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.ultimoAcceso | date : 'short' }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2"
              >
                <button
                  (click)="showDetails(user)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Ver
                </button>
                <button
                  (click)="editUser(user)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
                <button
                  (click)="confirmDelete(user)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de detalles/edición -->
      <div
        *ngIf="selectedUser"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        (click)="closeModal()"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white"
          (click)="$event.stopPropagation()"
        >
          <div class="mt-3">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              {{ isEditing ? 'Editar Usuario' : 'Detalles del Usuario' }}
            </h3>

            <!-- Formulario de edición -->
            <form *ngIf="isEditing" (submit)="saveEdit()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <!-- Datos personales -->
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Nombres</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="editingUser.nombres"
                    name="nombres"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Apellidos</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="editingUser.apellidos"
                    name="apellidos"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Email</label
                  >
                  <input
                    type="email"
                    [(ngModel)]="editingUser.email"
                    name="email"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Teléfono</label
                  >
                  <input
                    type="tel"
                    [(ngModel)]="editingUser.telefono"
                    name="telefono"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <!-- Ubicación -->
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Región</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="editingUser.region"
                    name="region"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Ciudad</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="editingUser.ciudad"
                    name="ciudad"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <!-- Datos adicionales -->
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >RUT</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="editingUser.rut"
                    name="rut"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Género</label
                  >
                  <select
                    [(ngModel)]="editingUser.genero"
                    name="genero"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option [value]="Gender.MASCULINO">Masculino</option>
                    <option [value]="Gender.FEMENINO">Femenino</option>
                    <option [value]="Gender.OTRO">Otro</option>
                  </select>
                </div>

                <!-- Estado y Rol -->
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Estado de cuenta</label
                  >
                  <select
                    [(ngModel)]="editingUser.estadoCuenta"
                    name="estadoCuenta"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option [value]="AccountStatus.ACTIVA">Activa</option>
                    <option [value]="AccountStatus.INACTIVA">Inactiva</option>
                    <option [value]="AccountStatus.BLOQUEADA">
                    Bloqueada
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Rol</label
                  >
                  <select
                    [(ngModel)]="editingUser.rol"
                    name="rol"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                  <option [value]="UserRole.ADMIN">Administrador</option>
                  <option [value]="UserRole.EMPLEADOR">Empleador</option>
                  <option [value]="UserRole.EMPLEADO">Empleado</option>
                  <option [value]="UserRole.USUARIO">Usuario</option>
                  </select>
                </div>
              </div>

              <div class="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Guardar
                </button>
              </div>
            </form>

            <!-- Vista de detalles -->
            <div *ngIf="!isEditing" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">
                    Nombre completo
                  </p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ selectedUser.nombres }} {{ selectedUser.apellidos }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">RUT</p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ selectedUser.rut }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Email</p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ selectedUser.email }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Teléfono</p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ selectedUser.telefono }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Ubicación</p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ selectedUser.ciudad }}, {{ selectedUser.region }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Género</p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ selectedUser.genero }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Rol</p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ selectedUser.rol }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">
                    Estado de cuenta
                  </p>
                  <p class="mt-1">
                    <span
                      [class]="getStatusBadgeClass(selectedUser.estadoCuenta)"
                    >
                      {{ selectedUser.estadoCuenta }}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">
                    Fecha de creación
                  </p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ selectedUser.fechaCreacion | date : 'medium' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Último acceso</p>
                  <p class="mt-1 text-sm text-gray-900">
                    {{ selectedUser.ultimoAcceso | date : 'medium' }}
                  </p>
                </div>
              </div>

              <div class="mt-5 flex justify-end">
                <button
                  (click)="closeModal()"
                  class="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div
        *ngIf="showDeleteConfirm"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        (click)="showDeleteConfirm = false"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
          (click)="$event.stopPropagation()"
        >
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Confirmar eliminación
          </h3>
          <p class="text-sm text-gray-500">
            ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se
            puede deshacer.
          </p>
          <div class="mt-4 flex justify-end space-x-3">
            <button
              (click)="showDeleteConfirm = false"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              (click)="deleteUser()"
              class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UsuariosComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  editingUser: Partial<User> = {};
  isEditing = false;
  isLoading = false;
  showDeleteConfirm = false;
  userToDelete: User | null = null;
  currentFilter: AccountStatus | 'ALL' = 'ALL';
  UserRole = UserRole; // Para usar en el template
  Gender = Gender; // Añadir esta línea
  AccountStatus = AccountStatus; // Añadir esta línea

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.isLoading = true;
    try {
      this.users = await this.userService.getUsers();
      this.applyFilter();
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.isLoading = false;
    }
  }

  filterByStatus(status: AccountStatus | 'ALL') {
    this.currentFilter = status;
    this.applyFilter();
  }

  applyFilter() {
    if (this.currentFilter === 'ALL') {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(
        (user) => user.estadoCuenta === this.currentFilter
      );
    }
  }

  getStatusBadgeClass(status: AccountStatus): string {
    const baseClasses =
      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case AccountStatus.ACTIVA:
        return `${baseClasses} bg-green-100 text-green-800`;
      case AccountStatus.INACTIVA:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case AccountStatus.BLOQUEADA:
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  }

  async updateUserRole(user: User) {
    if (!user.uid) return;

    this.isLoading = true;
    try {
      await this.userService.updateUser(user.uid, { rol: user.rol });
      await this.loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      this.isLoading = false;
    }
  }

  showDetails(user: User) {
    this.selectedUser = user;
    this.isEditing = false;
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.editingUser = { ...user };
    this.isEditing = true;
  }

  async saveEdit() {
    if (!this.selectedUser?.uid || !this.editingUser) return;

    this.isLoading = true;
    try {
      await this.userService.updateUser(
        this.selectedUser.uid,
        this.editingUser
      );
      await this.loadUsers();
      this.closeModal();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      this.isLoading = false;
    }
  }

  confirmDelete(user: User) {
    this.userToDelete = user;
    this.showDeleteConfirm = true;
  }

  async deleteUser() {
    if (!this.userToDelete?.uid) return;

    this.isLoading = true;
    try {
      await this.userService.deleteUser(this.userToDelete.uid);
      this.showDeleteConfirm = false;
      this.userToDelete = null;
      await this.loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async updateAccountStatus(user: User, status: AccountStatus) {
    if (!user.uid) return;

    this.isLoading = true;
    try {
      await this.userService.updateUser(user.uid, { estadoCuenta: status });
      await this.loadUsers();
    } catch (error) {
      console.error('Error updating account status:', error);
    } finally {
      this.isLoading = false;
    }
  }

  closeModal() {
    this.selectedUser = null;
    this.isEditing = false;
    this.editingUser = {};
  }
}
