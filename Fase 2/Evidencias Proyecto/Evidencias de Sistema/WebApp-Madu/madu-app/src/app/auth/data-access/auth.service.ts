import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { Firestore, collection, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface User {
  uid?: string;
  email: string;
  password?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private _firestore = inject(Firestore);

  logout() {
    return signOut(this._auth);
  }

  async signUp(user: User) {
    const credential = await createUserWithEmailAndPassword(
      this._auth,
      user.email,
      user.password!
    );

    const newUser: User = {
      uid: credential.user.uid,
      email: user.email,
      role: user.role || 'usuario-normal',
    };

    const userDocRef = doc(this._firestore, `users/${newUser.uid}`);
    await setDoc(userDocRef, newUser);

    return credential;
  }

  signIn(user: User) {
    return signInWithEmailAndPassword(this._auth, user.email, user.password!);
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this._auth, provider).then(async (result) => {
      const user = result.user;
      const userDocRef = doc(this._firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          role: 'usuario-normal',
        });
      }
      return result;
    });
  }

  getUserData(): Observable<User | null> {
    return new Observable<User | null>((observer) => {
      this._auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(this._firestore, `users/${firebaseUser.uid}`);
          const userDoc = await getDoc(userDocRef);
          observer.next(userDoc.exists() ? (userDoc.data() as User) : null);
        } else {
          observer.next(null);
        }
      });
    });
  }
}
