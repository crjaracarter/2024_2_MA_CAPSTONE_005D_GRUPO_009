import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskCreate, TaskService } from '../../data-access/task.service';
import { toast } from 'ngx-sonner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
  providers: [TaskService],
})
export default class TaskFormComponent {
  private _formBuilder = inject(FormBuilder);
  private _taskService = inject(TaskService);
  private _router = inject(Router);

  loading = signal(false);

  idTask = input<string | undefined>();

  form = this._formBuilder.group({
    title: this._formBuilder.control('', Validators.required),
    completed: this._formBuilder.control(false, Validators.required),
  });

  onstructor() {
    effect(() => {
      const id = this.idTask();
      if (id) {
        this.getTask(id);
      } else {
        // Resetear el formulario para una nueva tarea
        this.form.reset({
          title: '',
          completed: false
        });
      }
    });
  }

  async submit() {
    if (this.form.invalid) {
      toast.error('Por favor, complete todos los campos requeridos.');
      return;
    }
  
    try {
      this.loading.set(true);
      const { title, completed } = this.form.value;
      const task: TaskCreate = {
        title: title || '',
        completed: !!completed,
      };
  
      const id = this.idTask();
  
      if (id) {
        await this._taskService.update(task, id);
        toast.success('Tarea actualizada correctamente.');
      } else {
        await this._taskService.create(task);
        toast.success('Tarea creada correctamente.');
      }
  
      this._router.navigateByUrl('/tasks');
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      toast.error('Ocurrió un problema al guardar la tarea.');
    } finally {
      this.loading.set(false);
    }
  }

  async getTask(id: string) {
    const taskSnapshot = await this._taskService.getTask(id);

    if (!taskSnapshot.exists()) return;

    const task = taskSnapshot.data() as Task;

    this.form.patchValue(task);
  }
}
