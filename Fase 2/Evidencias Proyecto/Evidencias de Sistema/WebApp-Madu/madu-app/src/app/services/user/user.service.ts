import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';

export enum UserRole {
  ADMIN = 'Admin',
  EMPLEADOR = 'Empleador',
  EMPLEADO = 'Empleado',
  USUARIO = 'Usuario'
}

export enum Gender {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  OTRO = 'Otro',
  NO_ESPECIFICA = 'Prefiero no especificar'
}

export enum AccountStatus {
  ACTIVA = 'Activa',
  INACTIVA = 'Inactiva',
  PENDIENTE = 'Pendiente',
  BLOQUEADA = 'Bloqueada'
}

export interface User {
  uid?: string;
  nombres: string;
  apellidos: string;
  password?: string;
  email: string;
  telefono: string;
  region: string;
  ciudad: string;
  rut: string;
  rol: UserRole;
  genero: Gender;
  estadoCuenta: AccountStatus;
  fechaCreacion: Date;
  ultimoAcceso: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: Firestore) {}

  async getUsers(): Promise<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(
      (doc) =>
        ({
          uid: doc.id,
          ...doc.data(),
        } as User)
    );
  }

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, data);
  }

  async deleteUser(uid: string): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await deleteDoc(userRef);
  }
}
