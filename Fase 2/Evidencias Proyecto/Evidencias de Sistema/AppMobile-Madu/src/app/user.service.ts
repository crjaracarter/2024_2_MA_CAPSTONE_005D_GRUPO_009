import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { User } from './interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: AngularFirestore) {}

  getUserById(uid: string): Observable<User | null> {
    return this.firestore.collection('users').doc<User>(uid).valueChanges();
  }

  async updateUser(uid: string, userData: Partial<User>): Promise<void> {
    try {
      await this.firestore.collection('users').doc(uid).update(userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}