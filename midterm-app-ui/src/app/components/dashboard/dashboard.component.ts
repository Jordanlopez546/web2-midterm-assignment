import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <h1 class="h3 mb-4">
            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
          </h1>
        </div>
      </div>

      <!-- Welcome Card -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="card-title">Welcome back, {{ currentUser?.fullName }}!</h5>
              <p class="card-text text-muted mb-0">
                You are logged in as <span class="badge bg-primary">{{ currentUser?.role?.name ?? 'N/A' }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Dashboard -->
      <div *ngIf="isAdmin && stats" class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Total Users</h6>
                  <h3 class="mb-0">{{ stats.overview.totalUsers }}</h3>
                </div>
                <div class="text-primary">
                  <i class="fas fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Active Users</h6>
                  <h3 class="mb-0">{{ stats.overview.activeUsers }}</h3>
                </div>
                <div class="text-success">
                  <i class="fas fa-user-check fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Inactive Users</h6>
                  <h3 class="mb-0">{{ stats.overview.inactiveUsers }}</h3>
                </div>
                <div class="text-warning">
                  <i class="fas fa-user-times fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Recent Users</h6>
                  <h3 class="mb-0">{{ stats.overview.recentUsers }}</h3>
                  <small class="text-muted">Last 30 days</small>
                </div>
                <div class="text-info">
                  <i class="fas fa-user-plus fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users by Role -->
      <div *ngIf="isAdmin && stats" class="row mb-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0">Users by Role</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-4" *ngFor="let role of ['ADMIN', 'EDITOR', 'VIEWER']">
                  <div class="text-center">
                    <h4 class="mb-1">{{ stats.usersByRole[role] || 0 }}</h4>
                    <small class="text-muted">{{ role }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0">Registration Trend (Last 7 days)</h6>
            </div>
            <div class="card-body">
              <div *ngIf="stats.registrationTrend.length === 0" class="text-center text-muted py-3">
                No new registrations in the last 7 days
              </div>
              <div *ngIf="stats.registrationTrend.length > 0">
                <div *ngFor="let item of stats.registrationTrend" class="d-flex justify-content-between align-items-center mb-2">
                  <span>{{ formatDate(item._id) }}</span>
                  <span class="badge bg-primary">{{ item.count }} users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Role-based Content -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0">Your Permissions</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6 class="text-muted mb-3">Role Information</h6>
                  <p><strong>Role:</strong> {{ currentUser?.role?.name || 'N/A' }}</p>
                  <p><strong>Description:</strong> {{ currentUser?.role?.description ?? 'N/A' }}</p>
                </div>
                <div class="col-md-6">
                  <h6 class="text-muted mb-3">Available Permissions</h6>
                  <div class="d-flex flex-wrap gap-2">
                    <span *ngFor="let permission of currentUser?.role?.permissions" 
                          class="badge bg-secondary">
                      {{ permission }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
    }
    .badge {
      font-weight: normal;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  stats: any = null;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.isAdmin = this.authService.isAdmin();

    if (this.isAdmin) {
      this.loadDashboardStats();
    }
  }

  loadDashboardStats() {
    this.userService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load dashboard stats:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}