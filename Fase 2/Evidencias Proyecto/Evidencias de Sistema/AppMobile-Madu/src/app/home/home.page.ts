import { Component, OnInit} from '@angular/core';
import { AutenticacionService } from '../autenticacion.service';
import { AsistenciaService } from '../asistencia.service';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  userName: string = '';
  today = new Date();
  currentMonth = this.today.toLocaleString('es-CL', { month: 'long' });
  isWorking: boolean = false;
  lastAttendance: any;
  nextEvents: any[] = [];
  recentActivity: any[] = [];
  isloading: boolean = true;
  currentUserId: string = '';
  
  constructor(
    private authService: AutenticacionService,
    private asistenciaService: AsistenciaService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.loadUserData(user.uid);
      }
      this.isloading = false;
    });
  }

  loadUserData(userId: string) {
    this.userService.getUserById(userId).subscribe(
      (userData: any) => {
        if (userData) {
          this.userName = `${userData.nombres} ${userData.apellidos}`;
        } else {
          this.userName = 'Usuario';
        }
      },
      (error) => {
        console.error('Error loading user data:', error);
        this.userName = 'Usuario';
      }
    );
  }


  goToAttendance() {
    this.router.navigate(['/tabs/asistencia']);
  }

  goToCalendar() {
    this.router.navigate(['/tabs/documentos']);
  }
  doRefresh(event: any) {
    if (this.currentUserId) {
      this.loadUserData(this.currentUserId);
    }
    
    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}