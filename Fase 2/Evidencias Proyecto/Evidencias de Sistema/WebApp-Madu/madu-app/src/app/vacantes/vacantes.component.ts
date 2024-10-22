import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vacantes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vacantes.component.html',
  styleUrl: './vacantes.component.scss'
})
export class VacantesComponent implements OnInit {
  vacante$!: Observable<any>;
  empresaId!: string;
  vacanteId!: string;
  postulacionExitosa = false;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.empresaId = this.route.snapshot.paramMap.get('empresaId') || '';
    this.vacanteId = this.route.snapshot.paramMap.get('id') || '';

    const vacanteRef = doc(
      this.firestore,
      `empresas/${this.empresaId}/vacantes/${this.vacanteId}`
    );
    this.vacante$ = docData(vacanteRef);
  }

  async postular() {
    const user = this.auth.currentUser;
    if (user) {
      const postulacionRef = doc(this.firestore, `postulaciones/${user.uid}_${this.vacanteId}`);
      await setDoc(postulacionRef, {
        vacanteId: this.vacanteId,
        empresaId: this.empresaId,
        emailCandidato: user.email,
        fechaPostulacion: new Date(),
      });
      this.postulacionExitosa = true;
    } else {
      alert('Debes iniciar sesión para postular.');
    }
  }
}
