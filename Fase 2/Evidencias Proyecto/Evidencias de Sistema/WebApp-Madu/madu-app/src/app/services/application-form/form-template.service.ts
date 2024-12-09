import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  increment,
} from '@angular/fire/firestore';
import { FormTemplate } from '../../core/interfaces/application-form/form-template.interface';
import { FormQuestion } from '../../core/interfaces/application-form/form-question.interface';
import { QuestionType } from '../../core/interfaces/application-form/form-question.interface'; // Agregamos esta importación

@Injectable({
  providedIn: 'root',
})
export class FormTemplateService {
  constructor(private firestore: Firestore) {}

  async createFormTemplate(
    jobOfferId: string,
    employerId: string
  ): Promise<string> {
    try {
      const formTemplatesRef = collection(this.firestore, 'formTemplates');

      // Pregunta predeterminada del CV
      const defaultCVQuestion: FormQuestion = {
        id: 'cv_upload',
        sectionId: 'default_section',
        type: QuestionType.FILE_UPLOAD,
        label: 'Currículum Vitae',
        description: 'Por favor sube tu CV en formato PDF o Word',
        helpText: 'Archivos permitidos: PDF, DOC, DOCX. Tamaño máximo: 5MB',
        validation: {
          required: true,
          fileTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          maxFileSize: 5242880, // 5MB en bytes
          customMessage: 'Por favor, sube tu currículum vitae'
        },
        order: 0,
        isEditable: false,
        isVisible: true
      };

      const newTemplate: Omit<FormTemplate, 'id'> = {
        jobOfferId, // Agregamos el jobOfferId
        employerId,
        title: `Formulario de postulación`,
        description: 'Formulario de postulación personalizado',
        sections: [],
        questions: [defaultCVQuestion], // Incluimos la pregunta del CV por defecto
        settings: {
          allowSave: true,
          showProgressBar: true,
          randomizeQuestions: false,
          notifyOnSubmission: true,
        },
        scoring: {
          enabled: false,
          maxScore: 100,
          showScoreToApplicant: false,
        },
        status: 'draft',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: employerId,
        isReusable: false,
      };

      const docRef = await addDoc(formTemplatesRef, newTemplate);
      return docRef.id;
    } catch (error) {
      console.error('Error creating form template:', error);
      throw error;
    }
  }

  async getFormTemplateById(templateId: string): Promise<FormTemplate | null> {
    try {
      const templateRef = doc(this.firestore, 'formTemplates', templateId);
      const templateDoc = await getDoc(templateRef);

      if (!templateDoc.exists()) return null;

      return {
        id: templateDoc.id,
        ...templateDoc.data(),
      } as FormTemplate;
    } catch (error) {
      console.error('Error fetching form template:', error);
      return null;
    }
  }

  async updateFormTemplate(
    templateId: string,
    questions: FormQuestion[]
  ): Promise<void> {
    try {
      if (!templateId) {
        throw new Error('Template ID is required');
      }
  
      if (!Array.isArray(questions)) {
        throw new Error('Questions must be an array');
      }
  
      console.log('Updating template with ID:', templateId);
      console.log('Questions to save:', JSON.stringify(questions, null, 2));
      
      const templateRef = doc(this.firestore, 'formTemplates', templateId);
      
      // Asegurémonos de que mantengamos la pregunta del CV
      const cvQuestion = questions.find(q => q.id === 'cv_upload');
      if (!cvQuestion) {
        const defaultCVQuestion = {
          id: 'cv_upload',
          sectionId: 'default_section',
          type: QuestionType.FILE_UPLOAD,
          label: 'Currículum Vitae',
          description: 'Por favor sube tu CV en formato PDF o Word',
          helpText: 'Archivos permitidos: PDF, DOC, DOCX. Tamaño máximo: 5MB',
          validation: {
            required: true,
            fileTypes: [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            maxFileSize: 5242880,
            customMessage: 'Por favor, sube tu currículum vitae'
          },
          order: 0,
          isEditable: false,
          isVisible: true
        };
        questions = [defaultCVQuestion, ...questions];
      }
  
      // Ordenar preguntas por el campo order
      questions.sort((a, b) => a.order - b.order);
  
      await updateDoc(templateRef, {
        questions,
        updatedAt: new Date(),
        version: increment(1),
      });
  
      // Verificar después de guardar
      const updatedTemplate = await this.getFormTemplateById(templateId);
      console.log('Template after update:', updatedTemplate);
  
    } catch (error) {
      console.error('Error updating form template:', error);
      throw error;
    }
  }

  async getFormTemplateByJobOffer(
    jobOfferId: string
  ): Promise<FormTemplate | null> {
    try {
      const formTemplatesRef = collection(this.firestore, 'formTemplates');
      const q = query(
        formTemplatesRef,
        where('jobOfferId', '==', jobOfferId),
        where('status', '!=', 'archived')
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as FormTemplate;
    } catch (error) {
      console.error('Error fetching form template:', error);
      throw error;
    }
  }

  async archiveTemplate(templateId: string): Promise<void> {
    const templateRef = doc(this.firestore, 'formTemplates', templateId);
    await updateDoc(templateRef, {
      status: 'archived',
      updatedAt: new Date(),
    });
  }

  async updateTemplateJobOfferId(templateId: string, newJobOfferId: string): Promise<void> {
    const templateRef = doc(this.firestore, 'formTemplates', templateId);
    await updateDoc(templateRef, {
      jobOfferId: newJobOfferId,
      updatedAt: new Date()
    });
  }

  
}
