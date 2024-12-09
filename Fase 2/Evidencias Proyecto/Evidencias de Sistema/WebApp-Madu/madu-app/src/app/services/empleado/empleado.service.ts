import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc,
  collectionData,
  query,
  where 
} from '@angular/fire/firestore';
import { Empleado } from '../../core/interfaces/empleado.interface';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private readonly COLLECTION_NAME = 'empleados';
  private firestore: Firestore = inject(Firestore);

  crearEmpleado(empleado: Empleado): Promise<string> {
    const empleadoData = {
      ...empleado,
      fechaCreacion: new Date()
    };

    const empleadosRef = collection(this.firestore, this.COLLECTION_NAME);
    
    return new Promise(async (resolve, reject) => {
      try {
        const docRef = await addDoc(empleadosRef, empleadoData);
        await updateDoc(doc(this.firestore, this.COLLECTION_NAME, docRef.id), {
          id: docRef.id
        });
        resolve(docRef.id);
      } catch (error) {
        reject(error);
      }
    });
  }

  getEmpleadosPorEmpresa(empresaId: string): Observable<Empleado[]> {
    const empleadosRef = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(empleadosRef, where('empresaId', '==', empresaId));
    return collectionData(q) as Observable<Empleado[]>;
  }
}