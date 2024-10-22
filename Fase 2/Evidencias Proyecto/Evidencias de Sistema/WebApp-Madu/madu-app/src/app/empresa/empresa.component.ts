import { Component, OnInit } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.scss'
})

export class EmpresaComponent implements OnInit {
  vacantes$!: Observable<any[]>;
  empresaId!: string;

  constructor(private route: ActivatedRoute, private firestore: Firestore) {}

  ngOnInit() {
    // Obtener el ID de la empresa desde la URL
    this.empresaId = this.route.snapshot.paramMap.get('id') || '';

    // Referencia a las vacantes de la empresa
    const vacantesRef = collection(this.firestore, `empresas/${this.empresaId}/vacantes`);
    this.vacantes$ = collectionData(vacantesRef, { idField: 'id' });
  }
}
