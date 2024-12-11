import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  getAuth,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {
  User,
  Empleador,
  Empleado,
  UserRole,
  AccountStatus,
  Gender,
} from '../../core/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private _firestore = inject(Firestore);
  isAuthenticated$: Observable<boolean>;

  constructor() {
    // Inicializar isAuthenticated$ en el constructor
    this.isAuthenticated$ = new Observable<boolean>((observer) => {
      return onAuthStateChanged(this._auth, (user) => {
        observer.next(!!user);
      });
    });
  }

  /**
   * Envía un correo de restablecimiento de contraseña
   * @param email Correo electrónico del usuario
   * @returns Promise<void>
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this._auth, email, {
        url: window.location.origin + '/auth/login', // URL de redirección después de resetear la contraseña
        handleCodeInApp: true,
      });
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return this._auth.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this._auth.currentUser;
  }

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

      // 2. Preparar los datos para Firestore (excluyendo la contraseña)
      const userForFirestore: Partial<User> = {
        uid: credential.user.uid,
        email: user.email,
        nombres: user.nombres,
        apellidos: user.apellidos,
        telefono: user.telefono || '',
        region: user.region || '',
        ciudad: user.ciudad || '',
        rut: user.rut || '',
        rol: user.rol,
        genero: user.genero || Gender.NO_ESPECIFICA,
        estadoCuenta: AccountStatus.ACTIVA,
        fechaCreacion: new Date(),
        ultimoAcceso: new Date(),
      };

      const userDocRef = doc(this._firestore, `users/${credential.user.uid}`);
      await setDoc(userDocRef, userForFirestore);

      return credential;
    } catch (error) {
      console.error('Error en signUp:', error);
      throw error;
    }
  }

  async signUpEmpleador(empleador: Empleador) {
    try {
      const credential = await this.signUp({
        ...empleador,
        rol: UserRole.EMPLEADOR,
      });

      if (credential.user) {
        // Crear documento en la colección 'empleador'
        const empleadorDocRef = doc(
          this._firestore,
          `empleador/${credential.user.uid}`
        );

        // Extraer los datos específicos del empleador
        const empleadorData = {
          uid: credential.user.uid,
          nombreEmpresa: empleador.nombreEmpresa,
          rutEmpresa: empleador.rutEmpresa,
          direccionEmpresa: empleador.direccionEmpresa,
          sectorIndustrial: empleador.sectorIndustrial,
          sitioWeb: empleador.sitioWeb || null,
          descripcionEmpresa: empleador.descripcionEmpresa,
          fechaCreacion: new Date(),
          ultimaActualizacion: new Date(),
        };

        // Guardar en la colección empleador
        await setDoc(empleadorDocRef, empleadorData);

        // Crear documento en la colección 'empresas'
        const empresasRef = collection(this._firestore, 'empresas');
        const empresaData = {
          empleadorId: credential.user.uid,
          nombreEmpresa: empleador.nombreEmpresa,
          rutEmpresa: empleador.rutEmpresa,
          direccionEmpresa: empleador.direccionEmpresa,
          sectorIndustrial: empleador.sectorIndustrial,
          sitioWeb: empleador.sitioWeb || null,
          descripcionEmpresa: empleador.descripcionEmpresa,
          logo: null,
          empleados: [],
          documentos: [],
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        };

        // Usar addDoc para crear un nuevo documento con ID autogenerado
        await addDoc(empresasRef, empresaData);

        return {
          ...credential,
          empleadorData,
        };
      }

      return credential;
    } catch (error) {
      console.error('Error en signUpEmpleador:', error);
      throw error;
    }
  }

  async signUpEmpleado(empleado: Empleado) {
    try {
      const credential = await this.signUp({
        ...empleado,
        rol: UserRole.EMPLEADO,
      });

      if (credential.user) {
        const empleadoDocRef = doc(
          this._firestore,
          `empleados/${credential.user.uid}`
        );
        await setDoc(empleadoDocRef, {
          uid: credential.user.uid,
          curriculum: empleado.curriculum,
          experienciaLaboral: empleado.experienciaLaboral,
          educacion: empleado.educacion,
          habilidades: empleado.habilidades,
          disponibilidadInmediata: empleado.disponibilidadInmediata,
        });
      }

      return credential;
    } catch (error) {
      throw error;
    }
  }

  async signIn(user: User) {
    try {
      const result = await signInWithEmailAndPassword(
        this._auth,
        user.email,
        user.password!
      );

      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        window.location.href = returnUrl;
      }
      

      // Verificar si hay una URL guardada para redirección
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin'); // Limpiar después de usar
        window.location.href = redirectUrl; // Usar window.location para una recarga completa
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(
        this._auth,
        new GoogleAuthProvider()
      );
      const user = result.user;
      const userDocRef = doc(this._firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);

      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
      }

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
          ultimoAcceso: new Date(),
        };

        await setDoc(userDocRef, newUser);
      } else {
        // Actualizar último acceso
        await setDoc(
          userDocRef,
          {
            ultimoAcceso: new Date(),
          },
          { merge: true }
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  getUserData(): Observable<User | null> {
    const auth = getAuth();
    return new Observable<User | null>((observer) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // Obtener datos adicionales del usuario desde Firestore
          const userDoc = doc(this._firestore, 'users', user.uid);
          getDoc(userDoc)
            .then((docSnap) => {
              if (docSnap.exists()) {
                const userData = {
                  uid: user.uid,
                  ...docSnap.data(),
                } as User;
                observer.next(userData);
              } else {
                observer.next(null);
              }
            })
            .catch((error) => {
              console.error('Error al obtener datos del usuario:', error);
              observer.error(error);
            });
        } else {
          observer.next(null);
        }
      });
    });
  }

  async getEmpleadorData(): Promise<Empleador | null> {
    return new Promise((resolve) => {
      this.getUserData().subscribe(async (user) => {
        if (user && user.rol === UserRole.EMPLEADOR) {
          try {
            const empleadorDocRef = doc(
              this._firestore,
              `empleador/${user.uid}`
            );
            const empleadorDoc = await getDoc(empleadorDocRef);

            if (empleadorDoc.exists()) {
              resolve({
                ...user,
                ...empleadorDoc.data(),
              } as Empleador);
            } else {
              console.warn('Documento de empleador no encontrado');
              resolve(null);
            }
          } catch (error) {
            console.error('Error al obtener datos del empleador:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }
}
