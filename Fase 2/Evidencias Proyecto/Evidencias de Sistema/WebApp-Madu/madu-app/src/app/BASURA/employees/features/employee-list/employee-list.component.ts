import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { EmployeeService } from '../../data-access/employee.service';
import { RouterLink } from '@angular/router';
import { EmployeeTableComponent } from '../../ui/employee-table/employee-table.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterModule, RouterLink, CommonModule, AsyncPipe, EmployeeTableComponent],
  templateUrl: './employee-list.component.html',
  template: `
    <h2 class="text-2xl font-bold mb-4">Employee List</h2>
    <app-employee-table 
      [employees]="employees$ | async" 
      (addEmployee)="addEmployee($event)"
      (deleteEmployee)="deleteEmployee($event)"
      (editEmployee)="editEmployee($event)">
    </app-employee-table>
  `,
  styleUrl: './employee-list.component.scss',
  providers: [EmployeeService],
})

export class EmployeeListComponent {
  employees$: Observable<any[]>;
  private employeeService: EmployeeService = inject(EmployeeService);

  constructor() {
    this.employees$ = this.employeeService.getEmployees();
  }

  addEmployee(employee: any) {
    this.employeeService.createEmployee(employee)
      .then(() => console.log('Employee added successfully'))
      .catch((error: any) => console.error('Error adding employee:', error));
  }

  deleteEmployee(id: string) {
    this.employeeService.deleteEmployee(id)
      .then(() => console.log('Employee deleted successfully'))
      .catch((error: any) => console.error('Error deleting employee:', error));
  }

  editEmployee(employee: any) {
    // Aquí puedes implementar la lógica para editar el empleado
    // Por ejemplo, podrías abrir un modal con un formulario de edición
    console.log('Edit employee:', employee);
  }
}
