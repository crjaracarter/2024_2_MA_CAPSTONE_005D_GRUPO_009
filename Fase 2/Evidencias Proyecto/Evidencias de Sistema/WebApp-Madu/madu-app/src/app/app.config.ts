import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { Firestore, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth/data-access/auth.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { register } from 'swiper/element/bundle';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';

// Registrar Swiper elementos personalizados
register();
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    provideAnimations(),
    importProvidersFrom(MatDialogModule),
    AuthService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: '',
        authDomain: 'madu-app-ca037.firebaseapp.com',
        projectId: 'madu-app-ca037',
        storageBucket: 'madu-app-ca037.firebasestorage.app',
        messagingSenderId: '324971633488',
        appId: '1:324971633488:web:3aa0547d66ea67a64fea55',
      })
    ),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
    }),
  ],
};
