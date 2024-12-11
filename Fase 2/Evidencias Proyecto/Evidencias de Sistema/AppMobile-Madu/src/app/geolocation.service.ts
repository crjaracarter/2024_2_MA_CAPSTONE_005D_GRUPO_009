import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  getCurrentPosition(): Observable<LocationData> {
    return from(new Promise<LocationData>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalización no soportada');
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(this.getErrorMessage(error));
        }
      );
    }));
  }

  private getErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Permiso de ubicación denegado';
      case error.POSITION_UNAVAILABLE:
        return 'Ubicación no disponible';
      case error.TIMEOUT:
        return 'Tiempo de espera agotado';
      default:
        return 'Error desconocido';
    }
  }
}