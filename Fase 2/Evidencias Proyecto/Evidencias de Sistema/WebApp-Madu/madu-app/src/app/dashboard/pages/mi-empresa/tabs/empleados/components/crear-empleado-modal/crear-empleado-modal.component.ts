import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Gender, User, UserRole, AccountStatus } from '../../../../../../../core/interfaces/user.interface';
import { Empleado } from '../../../../../../../core/interfaces/empleado.interface';
import { EmpleadoService } from '../../../../../../../services/empleado/empleado.service';

@Component({
  selector: 'app-crear-empleado-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900">Crear Nuevo Empleado</h3>
          <button (click)="cerrarModal()" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Cerrar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form [formGroup]="empleadoForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <!-- Información básica -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombres</label>
              <input type="text" formControlName="nombres" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Apellidos</label>
              <input type="text" formControlName="apellidos" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" formControlName="email" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Contraseña</label>
              <input type="password" formControlName="password" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">RUT</label>
              <input type="text" formControlName="rut" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="tel" formControlName="telefono" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Región</label>
              <input type="text" formControlName="region" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Ciudad</label>
              <input type="text" formControlName="ciudad" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Género</label>
              <select formControlName="genero" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option [ngValue]="null">Seleccione género</option>
                <option [value]="Gender.MASCULINO">Masculino</option>
                <option [value]="Gender.FEMENINO">Femenino</option>
                <option [value]="Gender.OTRO">Otro</option>
                <option [value]="Gender.NO_ESPECIFICA">Prefiero no especificar</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" (click)="cerrarModal()"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancelar
            </button>
            <button type="submit" [disabled]="!empleadoForm.valid"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
              Crear Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CrearEmpleadoModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() empleadoCreado = new EventEmitter<any>();
  @Input() empresaId!: string;

  empleadoForm: FormGroup;
  protected Gender = Gender;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService) {
    this.empleadoForm = this.fb.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rut: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      region: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      genero: [null, [Validators.required]],
    });
  }

  cerrarModal() {
    this.close.emit();
  }

  async onSubmit() {
    if (this.empleadoForm.valid && !this.isLoading) {
      try {
        this.isLoading = true;
        
        const empleadoData: Empleado = {
          ...this.empleadoForm.value,
          rol: UserRole.EMPLEADO,
          estadoCuenta: AccountStatus.ACTIVA,
          curriculum: '',
          experienciaLaboral: [],
          educacion: [],
          habilidades: [],
          disponibilidadInmediata: true,
          empresaId: this.empresaId
        };

        const empleadoId = await this.empleadoService.crearEmpleado(empleadoData);
        
        // Emitir el empleado creado con su ID
        this.empleadoCreado.emit({ ...empleadoData, id: empleadoId });
        this.cerrarModal();
      } catch (error) {
        console.error('Error al crear empleado:', error);
        // Aquí deberías mostrar un mensaje de error al usuario
      } finally {
        this.isLoading = false;
      }
    }
  }
}