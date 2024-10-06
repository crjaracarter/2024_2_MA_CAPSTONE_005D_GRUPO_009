import { Component } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [],
  templateUrl: './sign-up.component.html',
  styles: ``,
})
export class SignUpComponent {
  name: string = '';
  email: string = '';
  password: string = '';

  constructor(private auth: Auth, private router: Router) {}

  onSignUp() {
    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then((userCredential) => {
        // Registro exitoso, redirigir a la página de inicio o dashboard
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.error('Error en el registro: ', error);
      });
  }
}
