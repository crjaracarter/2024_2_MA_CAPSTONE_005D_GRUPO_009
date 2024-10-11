import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],  // Importa lo necesario
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contact = {
    name: '',
    surname: '',
    email: '',
    company: '',
    employees: '',
    area: '',
    phone: '',
    subject: '',
    message: ''
  };

  onSubmit() {
    // Aquí realizarías el envío del formulario
    console.log('Formulario enviado', this.contact);
  }
}


