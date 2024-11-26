// auth-state.service.ts
import { inject, Injectable } from '@angular/core';
import { Auth, authState, getAuth, signOut, User } from '@angular/fire/auth';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private _auth = inject(Auth);

  // Tipamos correctamente el Observable
  get authState$(): Observable<User | null> {
    return authState(this._auth);
  }

  // Agregamos un método para verificar si el usuario está autenticado
  get isAuthenticated$(): Observable<boolean> {
    return this.authState$.pipe(
      map(user => !!user)
    );
  }

  get currentUser() {
    return getAuth().currentUser;
  }

  getCurrentUserId(): string | null {
    return this.currentUser?.uid ?? null;
  }

  logOut() {
    return signOut(this._auth);
  }
}