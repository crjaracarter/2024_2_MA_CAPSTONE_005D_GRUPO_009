import { inject, Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from '@angular/fire/auth';
import { 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { 
  User, 
  Empleador, 
  Empleado, 
  UserRole, 
  AccountStatus 
} from '../../core/interfaces/user.interface';

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
    try {
      const credential = await createUserWithEmailAndPassword(
        this._auth,
        user.email,
        user.password!
      );

      const newUser: User = {
        uid: credential.user.uid,
        email: user.email,
        nombres: user.nombres,
        apellidos: user.apellidos,
        telefono: user.telefono,
        region: user.region,
        ciudad: user.ciudad,
        rut: user.rut,
        rol: user.rol || UserRole.USUARIO,
        genero: user.genero,
        estadoCuenta: AccountStatus.ACTIVA,
        fechaCreacion: new Date(),
        ultimoAcceso: new Date()
      };

      const userDocRef = doc(this._firestore, `users/${newUser.uid}`);
      await setDoc(userDocRef, newUser);

      return credential;
    } catch (error) {
      throw error;
    }
  }

  async signUpEmpleador(empleador: Empleador) {
    try {
      const credential = await this.signUp({
        ...empleador,
        rol: UserRole.EMPLEADOR
      });

      if (credential.user) {
        const empresaDocRef = doc(this._firestore, `empresas/${credential.user.uid}`);
        await setDoc(empresaDocRef, {
          uid: credential.user.uid,
          nombreEmpresa: empleador.nombreEmpresa,
          rutEmpresa: empleador.rutEmpresa,
          direccionEmpresa: empleador.direccionEmpresa,
          sectorIndustrial: empleador.sectorIndustrial,
          sitioWeb: empleador.sitioWeb,
          descripcionEmpresa: empleador.descripcionEmpresa
        });
      }

      return credential;
    } catch (error) {
      throw error;
    }
  }

  async signUpEmpleado(empleado: Empleado) {
    try {
      const credential = await this.signUp({
        ...empleado,
        rol: UserRole.EMPLEADO
      });

      if (credential.user) {
        const empleadoDocRef = doc(this._firestore, `empleados/${credential.user.uid}`);
        await setDoc(empleadoDocRef, {
          uid: credential.user.uid,
          curriculum: empleado.curriculum,
          experienciaLaboral: empleado.experienciaLaboral,
          educacion: empleado.educacion,
          habilidades: empleado.habilidades,
          disponibilidadInmediata: empleado.disponibilidadInmediata
        });
      }

      return credential;
    } catch (error) {
      throw error;
    }
  }

  signIn(user: User) {
    return signInWithEmailAndPassword(this._auth, user.email, user.password!);
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this._auth, provider);
      const user = result.user;
      const userDocRef = doc(this._firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUser: User = {
          uid: user.uid,
          email: user.email!,
          nombres: user.displayName || '',
          apellidos: '',
          telefono: user.phoneNumber || '',
          region: '',
          ciudad: '',
          rut: '',
          rol: UserRole.USUARIO,
          genero: null!,
          estadoCuenta: AccountStatus.ACTIVA,
          fechaCreacion: new Date(),
          ultimoAcceso: new Date()
        };
        
        await setDoc(userDocRef, newUser);
      } else {
        // Actualizar último acceso
        await setDoc(userDocRef, { 
          ultimoAcceso: new Date() 
        }, { merge: true });
      }
      
      return result;
    } catch (error) {
      throw error;
    }
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

  async getEmpleadorData(): Promise<Empleador | null> {
    return new Promise((resolve) => {
      this.getUserData().subscribe(async user => {
        if (user && user.rol === UserRole.EMPLEADOR) {
          const empresaDocRef = doc(this._firestore, `empresas/${user.uid}`);
          const empresaDoc = await getDoc(empresaDocRef);
          if (empresaDoc.exists()) {
            resolve({
              ...user,
              ...empresaDoc.data()
            } as Empleador);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }
}