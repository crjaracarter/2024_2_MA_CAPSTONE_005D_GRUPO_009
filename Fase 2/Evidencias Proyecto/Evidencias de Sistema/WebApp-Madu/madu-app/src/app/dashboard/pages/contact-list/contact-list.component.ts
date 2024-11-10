import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../../../services/contact/contact.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto py-6 px-4">
      <h2 class="text-2xl font-bold text-white mb-6">
        Lista de Contactos
      </h2>

      <!-- Loader -->
      <div *ngIf="isLoading" class="flex items-center justify-center py-8">
        <div class="inline-flex items-center px-4 py-2 space-x-3">
          <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span class="text-indigo-600 text-lg">Cargando contactos...</span>
        </div>
      </div>

      <!-- Tabla de contactos -->
      <div *ngIf="!isLoading" class="overflow-x-auto bg-white shadow-md rounded-lg">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Empresa
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let contact of contacts" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ contact.name }} {{ contact.surname }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ contact.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ contact.company }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select
                  [(ngModel)]="contact.status"
                  (change)="updateStatus(contact)"
                  class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="pending">Pendiente</option>
                  <option value="contacted">Contactado</option>
                  <option value="not-interested">No interesado</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap space-x-2">
                <button
                  (click)="showDetails(contact)"
                  class="text-indigo-600 hover:text-indigo-900 px-2"
                >
                  Ver
                </button>
                <button
                  (click)="editContact(contact)"
                  class="text-blue-600 hover:text-blue-900 px-2"
                >
                  Editar
                </button>
                <button
                  (click)="confirmDelete(contact)"
                  class="text-red-600 hover:text-red-900 px-2"
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
        *ngIf="selectedContact"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        (click)="closeModal()"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
          (click)="$event.stopPropagation()"
        >
          <div class="mt-3">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              {{ isEditing ? 'Editar Contacto' : 'Detalles del Contacto' }}
            </h3>
            <div class="mt-2">
              <form *ngIf="isEditing" (submit)="saveEdit()">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Nombre</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="editingContact.name"
                      name="name"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Apellido</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="editingContact.surname"
                      name="surname"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Teléfono</label
                    >
                    <div class="flex">
                      <span
                        class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500"
                      >
                        +56
                      </span>
                      <input
                        type="tel"
                        [(ngModel)]="editingContact.phone"
                        name="phone"
                        class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Región</label
                    >
                    <select
                      [(ngModel)]="editingContact.region"
                      name="region"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Selecciona una región</option>
                      <option value="metropolitana">
                        Región Metropolitana
                      </option>
                      <!-- Agregar resto de regiones -->
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Email</label
                    >
                    <input
                      type="email"
                      [(ngModel)]="editingContact.email"
                      name="email"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Empresa</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="editingContact.company"
                      name="company"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div class="flex justify-end space-x-3">
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
                </div>
              </form>

              <!-- Vista de detalles -->
              <div *ngIf="!isEditing" class="text-sm text-gray-500">
                <p class="mb-2">
                  <span class="font-bold">Nombre:</span>
                  {{ selectedContact.name }}
                </p>
                <p class="mb-2">
                  <span class="font-bold">Apellido:</span>
                  {{ selectedContact.surname }}
                </p>
                <p class="mb-2">
                  <span class="font-bold">Email:</span>
                  {{ selectedContact.email }}
                </p>
                <p class="mb-2">
                  <span class="font-bold">Teléfono:</span> +56
                  {{ selectedContact.phone }}
                </p>
                <p class="mb-2">
                  <span class="font-bold">Región:</span>
                  {{ selectedContact.region }}
                </p>
                <p class="mb-2">
                  <span class="font-bold">Empresa:</span>
                  {{ selectedContact.company }}
                </p>
                <p class="mb-2">
                  <span class="font-bold">Empleados:</span>
                  {{ selectedContact.employees }}
                </p>
                <p class="mb-2">
                  <span class="font-bold">Área:</span>
                  {{ selectedContact.area }}
                </p>
                <p class="mb-2">
                  <span class="font-bold">Fecha de registro:</span>
                  {{ selectedContact.timestamp | date : 'medium' }}
                </p>
                <button
                  (click)="closeModal()"
                  class="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700"
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
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
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
            ¿Estás seguro de que deseas eliminar este contacto?
          </p>
          <div class="mt-4 flex justify-end space-x-3">
            <button
              (click)="showDeleteConfirm = false"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              (click)="deleteContact()"
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
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  editingContact: Partial<Contact> = {};
  isEditing = false;
  showDeleteConfirm = false;
  contactToDelete: Contact | null = null;
  isLoading = false;

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.loadContacts();
  }


  async loadContacts() {
    this.isLoading = true;
    try {
      this.contacts = await this.contactService.getContacts();
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  showDetails(contact: Contact) {
    this.selectedContact = contact;
    this.isEditing = false;
  }

  editContact(contact: Contact) {
    this.selectedContact = contact;
    this.editingContact = { ...contact };
    this.isEditing = true;
  }

  async saveEdit() {
    if (!this.selectedContact?.id || !this.editingContact) return;
  
    this.isLoading = true;
    try {
      await this.contactService.updateContact(
        this.selectedContact.id,
        this.editingContact
      );
      await this.loadContacts();
      this.closeModal();
    } catch (error) {
      console.error('Error updating contact:', error);
    } finally {
      this.isLoading = false;
    }
  }

  confirmDelete(contact: Contact) {
    this.contactToDelete = contact;
    this.showDeleteConfirm = true;
  }

  async deleteContact() {
    if (!this.contactToDelete?.id) return;
  
    this.isLoading = true;
    try {
      await this.contactService.deleteContact(this.contactToDelete.id);
      this.showDeleteConfirm = false;
      this.contactToDelete = null;
      await this.loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async updateStatus(contact: Contact) {
    if (!contact.id) return;
  
    this.isLoading = true;
    try {
      await this.contactService.updateContact(contact.id, {
        status: contact.status,
      });
      await this.loadContacts();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      this.isLoading = false;
    }
  }

  closeModal() {
    this.selectedContact = null;
    this.isEditing = false;
    this.editingContact = {};
  }
}
