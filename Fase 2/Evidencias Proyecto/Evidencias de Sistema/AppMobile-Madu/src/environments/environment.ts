// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { initializeApp } from "firebase/app";

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyCwLAJ0Wm4QFGXla-3JrUIOPkaBuXwG4c8",
    authDomain: "madu-app-ca037.firebaseapp.com",
    projectId: "madu-app-ca037",
    storageBucket: "madu-app-ca037.firebasestorage.app",
    messagingSenderId: "324971633488",
    appId: "1:324971633488:web:3aa0547d66ea67a64fea55"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
