import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth/data-access/auth.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    importProvidersFrom(MatDialogModule),
    AuthService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, 
      withPreloading(PreloadAllModules)),
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
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true
    })
  ],
};
