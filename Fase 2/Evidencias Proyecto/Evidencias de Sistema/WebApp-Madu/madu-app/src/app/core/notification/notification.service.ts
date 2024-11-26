// notification.service.ts
import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  success(message: string) {
    toast.success(message, {
      duration: 4000,
      position: 'top-right'
    });
  }

  error(message: string) {
    toast.error(message, {
      duration: 6000,
      position: 'top-right'
    });
  }

  warning(message: string) {
    toast.warning(message, {
      duration: 5000,
      position: 'top-right'
    });
  }

  info(message: string) {
    toast.info(message, {
      duration: 4000,
      position: 'top-right'
    });
  }
}