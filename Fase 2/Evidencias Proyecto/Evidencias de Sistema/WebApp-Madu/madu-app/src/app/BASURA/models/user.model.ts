// src/app/models/user.model.ts
export interface User {
    id?: string; // ID opcional generado por Firestore
    email: string;
    displayName: string;
    role: string; // Ejemplo: 'admin', 'user', etc.
  }
  