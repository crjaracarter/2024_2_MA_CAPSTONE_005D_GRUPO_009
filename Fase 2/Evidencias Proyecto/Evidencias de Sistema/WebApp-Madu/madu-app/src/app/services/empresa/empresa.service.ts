import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  Timestamp,
  FieldValue,
  addDoc,
  writeBatch  
} from '@angular/fire/firestore';
import { Empresa } from '../../core/interfaces/empresa.interface';

// Interfaz auxiliar para el update
interface FirestoreDocumento {
  nombre: string;
  url: string;
  fecha: Date | Timestamp | FieldValue;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private firestore = inject(Firestore);

  async getEmpresaByEmpleadorId(empleadorId: string): Promise<Empresa | null> {
    try {
      const empresasRef = collection(this.firestore, 'empresas');
      const q = query(empresasRef, where('empleadorId', '==', empleadorId));
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      // Convertir timestamps de Firestore a Date
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data['fechaCreacion']?.toDate(),
        fechaActualizacion: data['fechaActualizacion']?.toDate(),
        documentos: data['documentos']?.map((doc: any) => ({
          ...doc,
          fecha: doc.fecha?.toDate()
        }))
      } as Empresa;
    } catch (error) {
      console.error('Error al obtener empresa:', error);
      throw error;
    }
  }

  async updateEmpresa(id: string, data: Partial<Empresa>): Promise<void> {
    try {
      const empresaRef = doc(this.firestore, 'empresas', id);
      
      // Crear un objeto para la actualización que permita FieldValue
      const updateData: Partial<{
        [K in keyof Empresa]: K extends 'documentos' 
          ? FirestoreDocumento[]
          : K extends 'fechaActualizacion' | 'fechaCreacion'
          ? Date | Timestamp | FieldValue
          : Empresa[K];
      }> = {
        ...data,
        fechaActualizacion: serverTimestamp()
      };

      // Si hay documentos nuevos, asegurar que sus fechas sean timestamps
      if (data.documentos) {
        updateData.documentos = data.documentos.map(doc => ({
          ...doc,
          fecha: doc.fecha instanceof Date ? serverTimestamp() : doc.fecha
        }));
      }

      return updateDoc(empresaRef, updateData);
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      throw error;
    }
  }
  
  async migrarEmpleadoresExistentes() {
    try {
      console.log('Iniciando migración de empleadores...');
      const batch = writeBatch(this.firestore);
      
      // Obtener todos los empleadores
      const empleadoresRef = collection(this.firestore, 'empleador');
      const empleadoresSnap = await getDocs(empleadoresRef);
      
      let creados = 0;
      let errores = 0;
      let yaExistentes = 0;
      
      for (const empleadorDoc of empleadoresSnap.docs) {
        try {
          const empleadorData = empleadorDoc.data();
          const empleadorId = empleadorDoc.id;

          // Verificar si ya existe una empresa para este empleador
          const empresasRef = collection(this.firestore, 'empresas');
          const q = query(empresasRef, where('empleadorId', '==', empleadorId));
          const empresaExistente = await getDocs(q);

          if (empresaExistente.empty) {
            // Crear nueva empresa
            const empresaData: Empresa = {
              empleadorId: empleadorId,
              nombreEmpresa: empleadorData['nombreEmpresa'] || 'Empresa sin nombre',
              rutEmpresa: empleadorData['rutEmpresa'] || '',
              direccionEmpresa: empleadorData['direccionEmpresa'] || '',
              sectorIndustrial: empleadorData['sectorIndustrial'] || '',
              sitioWeb: empleadorData['sitioWeb'] || null,
              descripcionEmpresa: empleadorData['descripcionEmpresa'] || '',
              logo: undefined,
              empleados: [],
              documentos: [],
              fechaCreacion: empleadorData['fechaCreacion'] || new Date(),
              fechaActualizacion: new Date()
            };

            await addDoc(empresasRef, empresaData);
            creados++;
            console.log(`✅ Empresa creada para empleador ${empleadorId}`);
          } else {
            yaExistentes++;
            console.log(`⏭️ Ya existe empresa para empleador ${empleadorId}`);
          }
        } catch (error) {
          errores++;
          console.error(`❌ Error procesando empleador ${empleadorDoc.id}:`, error);
        }
      }

      console.log('Migración completada:');
      console.log(`✅ Empresas creadas: ${creados}`);
      console.log(`⏭️ Empresas ya existentes: ${yaExistentes}`);
      console.log(`❌ Errores: ${errores}`);
      
      return {
        creados,
        yaExistentes,
        errores
      };
    } catch (error) {
      console.error('Error en la migración:', error);
      throw error;
    }
  }

  // Método para verificar el estado de la migración
  async verificarEstadoMigracion() {
    try {
      const empleadoresRef = collection(this.firestore, 'empleador');
      const empleadoresSnap = await getDocs(empleadoresRef);
      const totalEmpleadores = empleadoresSnap.size;

      const empresasRef = collection(this.firestore, 'empresas');
      const empresasSnap = await getDocs(empresasRef);
      const totalEmpresas = empresasSnap.size;

      return {
        totalEmpleadores,
        totalEmpresas,
        faltantes: totalEmpleadores - totalEmpresas
      };
    } catch (error) {
      console.error('Error al verificar estado:', error);
      throw error;
    }
  }
}