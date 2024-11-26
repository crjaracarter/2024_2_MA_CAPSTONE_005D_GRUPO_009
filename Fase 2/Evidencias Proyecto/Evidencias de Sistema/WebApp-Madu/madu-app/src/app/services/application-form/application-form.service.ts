// src/app/services/application-form/application-form.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc } from '@angular/fire/firestore';
import { FormTemplate } from '../../core/interfaces/application-form/form-template.interface';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationFormService {
  constructor(private firestore: Firestore) {}

  async createFormTemplate(template: Omit<FormTemplate, 'id'>): Promise<string> {
    try {
      const templatesRef = collection(this.firestore, 'formTemplates');
      const docRef = await addDoc(templatesRef, {
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating form template:', error);
      throw error;
    }
  }

  getFormTemplatesByEmployer(employerId: string): Observable<FormTemplate[]> {
    const templatesRef = collection(this.firestore, 'formTemplates');
    const q = query(templatesRef, where('employerId', '==', employerId));
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FormTemplate))
      )
    );
  }

  async getFormTemplateById(id: string): Promise<FormTemplate | null> {
    try {
      const templateRef = doc(this.firestore, 'formTemplates', id);
      const templateDoc = await getDoc(templateRef);
      
      if (templateDoc.exists()) {
        return {
          id: templateDoc.id,
          ...templateDoc.data()
        } as FormTemplate;
      }
      return null;
    } catch (error) {
      console.error('Error fetching form template:', error);
      return null;
    }
  }

  updateFormTemplate(id: string, template: Partial<FormTemplate>): Promise<void> {
    const templateRef = doc(this.firestore, 'formTemplates', id);
    return updateDoc(templateRef, {
      ...template,
      updatedAt: new Date()
    });
  }

  deleteFormTemplate(id: string): Promise<void> {
    const templateRef = doc(this.firestore, 'formTemplates', id);
    return deleteDoc(templateRef);
  }
}