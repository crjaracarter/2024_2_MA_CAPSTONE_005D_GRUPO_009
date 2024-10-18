// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersCollection;

  constructor(private firestore: AngularFirestore) {
    this.usersCollection = this.firestore.collection<User>('users');
  }

  getUsers(): Observable<User[]> {
    return this.usersCollection.valueChanges({ idField: 'id' });
  }

  addUser(user: User): Promise<void> {
    const id = this.firestore.createId();
    return this.usersCollection.doc(id).set({ ...user, id });
  }

  updateUser(id: string, user: Partial<User>): Promise<void> {
    return this.usersCollection.doc(id).update(user);
  }

  deleteUser(id: string): Promise<void> {
    return this.usersCollection.doc(id).delete();
  }
}
