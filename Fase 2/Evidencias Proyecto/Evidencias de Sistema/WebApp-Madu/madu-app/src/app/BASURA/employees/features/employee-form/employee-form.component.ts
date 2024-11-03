import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../data-access/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
  providers: [EmployeeService]
})

export class EmployeeFormComponent {
  employeeForm: FormGroup;
  private fb: FormBuilder = inject(FormBuilder);
  private employeeService: EmployeeService = inject(EmployeeService);

  constructor() {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      position: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const { email, password, ...employeeData } = this.employeeForm.value;
      this.employeeService.createEmployeeWithAuth(email, password, employeeData)
        .then(() => {
          console.log('Employee created successfully');
          this.employeeForm.reset();
        })
        .catch((error: any) => console.error('Error creating employee:', error));
    }
  }
}
