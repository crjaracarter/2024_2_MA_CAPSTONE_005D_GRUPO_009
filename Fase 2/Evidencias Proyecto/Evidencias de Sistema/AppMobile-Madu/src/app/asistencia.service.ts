import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { map, switchMap, take } from 'rxjs/operators';
import { LocationData } from './geolocation.service';
import { UserService } from './user.service';
import { Observable, from } from 'rxjs';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  constructor(
    private firestore: AngularFirestore,
    private userService: UserService
  ) {}

  async marcarEntrada(usuarioId: string, locationData: LocationData) {
    try {
      const userData = await firstValueFrom(this.userService.getUserById(usuarioId));
      if (!userData) throw new Error('Usuario no encontrado');

      // Buscar la empresa donde el usuario es empleado
      const empresaSnapshot = await this.firestore.collection('empresas', ref =>
        ref.where('empleados', 'array-contains', usuarioId)
      ).get().toPromise();

      if (!empresaSnapshot?.docs.length) {
        throw new Error('Empresa no encontrada para el empleado');
      }

      const empresaId = empresaSnapshot.docs[0].id;

      const registro = {
        usuarioId,
        empresaId,
        nombreEmpleado: `${userData.nombres} ${userData.apellidos}`,
        entrada: firebase.firestore.FieldValue.serverTimestamp(),
        fecha: new Date().toISOString().split('T')[0],
        salida: null,
        ubicacionEntrada: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          timestamp: locationData.timestamp
        },
        estado: 'En curso',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      return await this.firestore.collection('asistencia').add(registro);
    } catch (error) {
      console.error('Error al marcar entrada:', error);
      throw error;
    }
  }

  marcarSalida(documentId: string, locationData: LocationData) {
    return this.firestore.collection('asistencia').doc(documentId).update({
      salida: firebase.firestore.FieldValue.serverTimestamp(),
      estado: 'Completado',
      ubicacionSalida: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp
      },
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  obtenerHistorial(usuarioId: string) {
    return this.firestore.collection('asistencia', ref =>
      ref.where('usuarioId', '==', usuarioId)
         .orderBy('fecha', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
  
  obtenerHistorialMensual(usuarioId: string) {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return this.firestore.collection('asistencia', ref =>
      ref.where('usuarioId', '==', usuarioId)
         .where('fecha', '>=', firstDayOfMonth.toISOString().split('T')[0])
         .where('fecha', '<=', lastDayOfMonth.toISOString().split('T')[0])
         .orderBy('fecha', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  private async getEmpresaIdByEmpleado(usuarioId: string): Promise<string | null> {
    const snapshot = await this.firestore.collection('empresas', ref =>
      ref.where('empleados', 'array-contains', usuarioId)
    ).get().toPromise();

    if (!snapshot?.docs.length) return null;
    return snapshot.docs[0].id;
  }
}