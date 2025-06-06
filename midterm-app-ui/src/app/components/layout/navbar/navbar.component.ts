import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <i class="fas fa-shield-alt me-2"></i>
          Auth System
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" *ngIf="currentUser">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                <i class="fas fa-tachometer-alt me-1"></i> Dashboard
              </a>
            </li>
            <li class="nav-item" *ngIf="isAdmin">
              <a class="nav-link" routerLink="/users" routerLinkActive="active">
                <i class="fas fa-users me-1"></i> Users
              </a>
            </li>
            <li class="nav-item" *ngIf="isAdmin">
              <a class="nav-link" routerLink="/roles" routerLinkActive="active">
                <i class="fas fa-user-tag me-1"></i> Roles
              </a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item dropdown" *ngIf="currentUser">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" 
                 data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-user-circle me-1"></i>
                {{ currentUser.fullName }}
                <span class="badge bg-primary ms-2">{{ currentUser.role.name }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li>
                  <a class="dropdown-item" routerLink="/profile">
                    <i class="fas fa-user me-2"></i> Profile
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" (click)="logout($event)">
                    <i class="fas fa-sign-out-alt me-2"></i> Logout
                  </a>
                </li>
              </ul>
            </li>
            <li class="nav-item" *ngIf="!currentUser">
              <a class="nav-link" routerLink="/login">
                <i class="fas fa-sign-in-alt me-1"></i> Login
              </a>
            </li>
            <li class="nav-item" *ngIf="!currentUser">
              <a class="nav-link" routerLink="/register">
                <i class="fas fa-user-plus me-1"></i> Register
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      font-weight: bold;
      font-size: 1.3rem;
    }
    .badge {
      font-size: 0.7rem;
      font-weight: normal;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }
}