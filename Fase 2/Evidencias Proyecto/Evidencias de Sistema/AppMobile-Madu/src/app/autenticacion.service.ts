import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  createUserWithEmailAndPassword(email: any, password: any) {
    throw new Error('Method not implemented.');
  }
  currentUser: any;
  
  constructor(public afAuth: AngularFireAuth, private firestore: AngularFirestore ) {}

  async registerUser2(email: string, password: string) {
    return await this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  async createUserData(uid: string, userData: any) {
    return await this.firestore.collection('users').doc(uid).set(userData);
  }
  // Método para iniciar sesión
  async login(email: string, password: string): Promise<any> {
    try {
      return await this.afAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async loginUser(email: string, password: string) {
    return await this.afAuth.signInWithEmailAndPassword(email, password);

  }

  // Método para registrar nuevo usuario
  async registerUser(email: string, password: string): Promise<any> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      // Enviar email de verificación (opcional)
      await result.user?.sendEmailVerification();
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Método para restablecer contraseña
  async resetPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => user !== null)
    );
  }

  // Método para obtener el usuario actual
  getCurrentUser(): Observable<any> {
    return this.afAuth.authState;
  }

  // Manejador de errores extendido
// Manejador de errores extendido
private handleError(error: any): string {
  let errorMessage = 'Ocurrió un error desconocido';

  if (error.code) {
    switch (error.code) {
      // Errores de autenticación
      case 'auth/user-not-found':
        errorMessage = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Usuario deshabilitado';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados intentos fallidos. Intente más tarde';
        break;

      // Errores de registro
      case 'auth/email-already-in-use':
        errorMessage = 'El email ya está registrado';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Operación no permitida';
        break;
      case 'auth/weak-password':
        errorMessage = 'La contraseña es demasiado débil';
        break;

      // Errores de restablecimiento de contraseña
      case 'auth/expired-action-code':
        errorMessage = 'El código de acción ha expirado';
        break;
      case 'auth/invalid-action-code':
        errorMessage = 'El código de acción no es válido';
        break;
    }
  }

  return errorMessage; // Devolver el mensaje de error
}
}