import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact/contact.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AOS from 'aos';



@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})

export class ContactComponent {
  contactForm: FormGroup;
  isLoading = false;
  submitStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  
  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^(\+56)?[9]\d{8}$/),
        Validators.minLength(9),
        Validators.maxLength(9)
      ]],
      region: ['', Validators.required],
      company: ['', [Validators.required, Validators.minLength(2)]],
      employees: ['', [Validators.required, Validators.min(1)]],
      area: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Inicializar AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });

    // Configurar GSAP
    gsap.registerPlugin(ScrollTrigger);
    
    // Animación del parallax
    gsap.to('.parallax-bg', {
      yPercent: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Animación de las cards de beneficios
    gsap.from('.benefit-card', {
      scrollTrigger: {
        trigger: '.benefits-section',
        start: 'top center',
      },
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2
    });
  }


  // Getter para el teléfono
  get phoneField() { return this.contactForm.get('phone'); }
  get regionField() { return this.contactForm.get('region'); }

  // Método para formatear el número de teléfono
  formatPhone(event: any) {
    let phone = event.target.value.replace(/\D/g, ''); // Elimina todo excepto números
    
    // Si el número comienza con 56, lo elimina
    if (phone.startsWith('56')) {
      phone = phone.substring(2);
    }
    
    // Asegura que el número comience con 9
    if (phone.length > 0 && !phone.startsWith('9')) {
      phone = '9' + phone;
    }
    
    // Limita a 9 dígitos
    phone = phone.substring(0, 9);
    
    this.contactForm.patchValue({
      phone: phone
    }, { emitEvent: false });
  }


  // Getters para facilitar la validación en el template
  get nameField() { return this.contactForm.get('name'); }
  get surnameField() { return this.contactForm.get('surname'); }
  get emailField() { return this.contactForm.get('email'); }
  get companyField() { return this.contactForm.get('company'); }
  get employeesField() { return this.contactForm.get('employees'); }
  get areaField() { return this.contactForm.get('area'); }

  async onSubmit() {
    if (this.contactForm.invalid || this.isLoading) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.submitStatus = 'loading';

    try {
      await this.contactService.addContact(this.contactForm.value);
      this.submitStatus = 'success';
      this.contactForm.reset();
      
      setTimeout(() => {
        this.submitStatus = 'idle';
      }, 3000);

    } catch (error) {
      console.error('Error al guardar el contacto: ', error);
      this.submitStatus = 'error';
      
      setTimeout(() => {
        this.submitStatus = 'idle';
      }, 3000);

    } finally {
      this.isLoading = false;
    }
  }
}
