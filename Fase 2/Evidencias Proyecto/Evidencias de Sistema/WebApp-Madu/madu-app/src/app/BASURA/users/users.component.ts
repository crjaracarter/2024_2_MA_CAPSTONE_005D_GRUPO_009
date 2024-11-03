import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})

export class UsersComponent implements OnInit {
  users: User[] = [];
  newUser: User = { email: '', displayName: '', role: 'user' };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((data) => {
      this.users = data;
    });
  }

  addUser(): void {
    this.userService.addUser(this.newUser).then(() => {
      this.newUser = { email: '', displayName: '', role: 'user' }; // Resetear el formulario
    });
  }

  editUser(user: User): void {
    const updatedName = prompt('Nuevo nombre:', user.displayName);
    if (updatedName) {
      this.userService.updateUser(user.id!, { displayName: updatedName });
    }
  }

  deleteUser(id: string | undefined): void {
    if (id && confirm('¿Seguro que quieres eliminar este usuario?')) {
      this.userService.deleteUser(id);
    }
  }
}
