import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp
} from '@angular/fire/firestore';

export interface Contact {
  id?: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  region: string;
  company: string;
  employees: number;
  area: string;
  timestamp: Date;
  status?: 'pending' | 'contacted' | 'not-interested'; // Opcional: para seguimiento
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private firestore: Firestore) { }

  async addContact(contact: Contact): Promise<any> {
    try {
      const contactsRef = collection(this.firestore, 'contacts');
      const contactWithTimestamp = {
        ...contact,
        timestamp: Timestamp.now()
      };
      const docRef = await addDoc(contactsRef, contactWithTimestamp);
      return docRef;
    } catch (error) {
      console.error('Error adding contact: ', error);
      throw error;
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      const contactsRef = collection(this.firestore, 'contacts');
      const q = query(contactsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convertir el Timestamp a Date
          timestamp: data['timestamp']?.toDate() || new Date()
        } as Contact;
      });
    } catch (error) {
      console.error('Error getting contacts: ', error);
      throw error;
    }
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<void> {
    try {
      const contactRef = doc(this.firestore, 'contacts', id);
      await updateDoc(contactRef, contact);
    } catch (error) {
      console.error('Error updating contact: ', error);
      throw error;
    }
  }

  async deleteContact(id: string): Promise<void> {
    try {
      const contactRef = doc(this.firestore, 'contacts', id);
      await deleteDoc(contactRef);
    } catch (error) {
      console.error('Error deleting contact: ', error);
      throw error;
    }
  }
}


