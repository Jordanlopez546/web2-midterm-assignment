import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h3 mb-0">
              <a routerLink="/users" class="text-decoration-none text-muted">
                <i class="fas fa-arrow-left me-2"></i>
              </a>
              User Details
            </h1>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div *ngIf="!loading && user" class="row">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white">
              <h6 class="mb-0">User Information</h6>
            </div>
            <div class="card-body">
              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0 text-muted">Full Name</p>
                </div>
                <div class="col-sm-9">
                  <p class="mb-0 fw-semibold">{{ user.fullName }}</p>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0 text-muted">Email</p>
                </div>
                <div class="col-sm-9">
                  <p class="mb-0">{{ user.email }}</p>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0 text-muted">User ID</p>
                </div>
                <div class="col-sm-9">
                  <p class="mb-0"><code>{{ user.userId }}</code></p>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0 text-muted">Role</p>
                </div>
                <div class="col-sm-9">
                  <span class="badge bg-primary">{{ user.role.name }}</span>
                  <p class="mb-0 mt-1 text-muted small">{{ user.role.description }}</p>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0 text-muted">Status</p>
                </div>
                <div class="col-sm-9">
                  <span class="badge" [ngClass]="user.isActive ? 'bg-success' : 'bg-danger'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0 text-muted">Member Since</p>
                </div>
                <div class="col-sm-9">
                  <p class="mb-0">{{ formatDate(user.createdAt) }}</p>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0 text-muted">Last Login</p>
                </div>
                <div class="col-sm-9">
                  <p class="mb-0">{{ formatDate(user.lastLogin) }}</p>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-3">
                  <p class="mb-0 text-muted">Last Updated</p>
                </div>
                <div class="col-sm-9">
                  <p class="mb-0">{{ formatDate(user.updatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white">
              <h6 class="mb-0">Permissions</h6>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2">
                <span *ngFor="let permission of user.role.permissions" 
                      class="badge bg-secondary">
                  <i class="fas fa-check me-1"></i>{{ permission }}
                </span>
              </div>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0">Actions</h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary" routerLink="/users">
                  <i class="fas fa-arrow-left me-2"></i>Back to Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    code {
      color: #6c757d;
      background-color: #f8f9fa;
      padding: 2px 4px;
      border-radius: 3px;
    }
  `]
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
  }

  loadUser(userId: string) {
    this.loading = true;
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.user = response.data.user;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load user:', error);
        this.loading = false;
        this.router.navigate(['/users']);
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}