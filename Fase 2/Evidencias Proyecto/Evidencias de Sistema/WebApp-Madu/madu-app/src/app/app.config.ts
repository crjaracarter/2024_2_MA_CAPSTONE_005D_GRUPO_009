import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth/data-access/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    AuthService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: "madu-app-ca037",
        appId: "1:324971633488:web:3aa0547d66ea67a64fea55",
        storageBucket: "madu-app-ca037.appspot.com",
        apiKey: "",
        authDomain: "madu-app-ca037.firebaseapp.com",
        messagingSenderId: "324971633488"
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
