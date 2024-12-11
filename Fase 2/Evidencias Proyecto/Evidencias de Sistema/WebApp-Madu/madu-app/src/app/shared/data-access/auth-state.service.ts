// auth-state.service.ts
import { inject, Injectable } from '@angular/core';
import { Auth, authState, getAuth, signOut, User as FirebaseUser } from '@angular/fire/auth';
import { Observable, switchMap, of, from, map } from 'rxjs';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { User as CustomUser } from '../../core/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private _auth = inject(Auth);
  private _firestore = inject(Firestore);

  // Observable para obtener el usuario completo con su rol
  user$: Observable<CustomUser | null> = authState(this._auth).pipe(
    switchMap((user: FirebaseUser | null) => {
      if (!user) return of(null);
      
      return from(
        getDoc(doc(this._firestore, `users/${user.uid}`))
          .then(snapshot => {
            const userData = snapshot.data() as CustomUser;
            console.log('Firestore user data:', userData); // Debug log
            return userData;
          })
      );
    })
  );

  get authState$(): Observable<FirebaseUser | null> {
    return authState(this._auth);
  }

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