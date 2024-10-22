import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  getEmployees(): Observable<any[]> {
    const employeesCollection = collection(this.firestore, 'employees');
    return collectionData(employeesCollection, { idField: 'id' });
  }

  createEmployee(employee: any): Promise<any> {
    const employeesCollection = collection(this.firestore, 'employees');
    return addDoc(employeesCollection, employee);
  }

  updateEmployee(id: string, employee: any): Promise<void> {
    const employeeDoc = doc(this.firestore, `employees/${id}`);
    return updateDoc(employeeDoc, employee);
  }

  deleteEmployee(id: string): Promise<void> {
    const employeeDoc = doc(this.firestore, `employees/${id}`);
    return deleteDoc(employeeDoc);
  }

  createEmployeeWithAuth(email: string, password: string, employeeData: any): Promise<any> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        const userId = userCredential.user.uid;
        const employeesCollection = collection(this.firestore, 'employees');
        return addDoc(employeesCollection, {
          ...employeeData,
          uid: userId
        });
      });
  }
}