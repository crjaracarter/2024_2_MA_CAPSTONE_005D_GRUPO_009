import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-table.component.html',
  styleUrl: './employee-table.component.scss'
})

export class EmployeeTableComponent {
  @Input() employees: any[] = [];
  @Output() addEmployee = new EventEmitter<any>();
  @Output() deleteEmployee = new EventEmitter<string>();
  @Output() editEmployee = new EventEmitter<any>();

  newEmployee: any = { name: '', email: '', position: '' };

  onAdd() {
    if (this.newEmployee.name && this.newEmployee.email && this.newEmployee.position) {
      this.addEmployee.emit(this.newEmployee);
      this.newEmployee = { name: '', email: '', position: '' };
    }
  }

  onDelete(id: string) {
    this.deleteEmployee.emit(id);
  }

  onEdit(employee: any) {
    this.editEmployee.emit(employee);
  }
}