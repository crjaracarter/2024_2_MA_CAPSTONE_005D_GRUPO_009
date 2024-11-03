import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData,
  doc, 
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { User } from '../../core/interfaces/user.interface';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USERS_COLLECTION = 'users';

  constructor(private firestore: Firestore) {}

  // Obtener todos los usuarios
  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, this.USERS_COLLECTION);
    const q = query(usersRef, orderBy('fechaCreacion', 'desc'));
    return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
  }

  // Obtener un usuario por ID
  etUserById(uid: string): Observable<User | undefined> {
    const userRef = doc(this.firestore, `${this.USERS_COLLECTION}/${uid}`);
    return from(getDoc(userRef)).pipe(
      map(docSnap => docSnap.exists() ? { ...docSnap.data(), uid: docSnap.id } as User : undefined)
    );
  }

  // Crear nuevo usuario
  createUser(user: Omit<User, 'uid'>): Promise<any> {
    const usersRef = collection(this.firestore, this.USERS_COLLECTION);
    return addDoc(usersRef, {
      ...user,
      fechaCreacion: new Date(),
      ultimoAcceso: new Date()
    });
  }

  // Actualizar usuario
  updateUser(uid: string, user: Partial<User>): Promise<void> {
    const userRef = doc(this.firestore, `${this.USERS_COLLECTION}/${uid}`);
    return updateDoc(userRef, { ...user });
  }

  // Eliminar usuario
  deleteUser(uid: string): Promise<void> {
    const userRef = doc(this.firestore, `${this.USERS_COLLECTION}/${uid}`);
    return deleteDoc(userRef);
  }

  // Actualizar estado de cuenta
  updateAccountStatus(uid: string, status: string): Promise<void> {
    const userRef = doc(this.firestore, `${this.USERS_COLLECTION}/${uid}`);
    return updateDoc(userRef, { 
      estadoCuenta: status,
      ultimoAcceso: new Date()
    });
  }
}