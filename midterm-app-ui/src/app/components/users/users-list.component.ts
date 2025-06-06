import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { User, Role } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h3 mb-0">
              <i class="fas fa-users me-2"></i>Users Management
            </h1>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Search</label>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search by name or email..."
                [(ngModel)]="filters.search"
                (ngModelChange)="onFilterChange()"
              >
            </div>
            <div class="col-md-3">
              <label class="form-label">Role</label>
              <select class="form-select" [(ngModel)]="filters.role" (ngModelChange)="onFilterChange()">
                <option value="">All Roles</option>
                <option *ngFor="let role of roles" [value]="role.name">{{ role.name }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Status</label>
              <select class="form-select" [(ngModel)]="filters.isActive" (ngModelChange)="onFilterChange()">
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label">Per Page</label>
              <select class="form-select" [(ngModel)]="filters.limit" (ngModelChange)="onFilterChange()">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!loading && users.length === 0" class="text-center py-5">
            <i class="fas fa-users fa-3x text-muted mb-3"></i>
            <p class="text-muted">No users found</p>
          </div>

          <div *ngIf="!loading && users.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users; let i = index">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-2">
                        {{ getInitials(user.fullName) }}
                      </div>
                      <div>
                        <div class="fw-semibold">{{ user.fullName }}</div>
                        <small class="text-muted">ID: {{ user.userId }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge bg-primary">{{ user.role.name }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="user.isActive ? 'bg-success' : 'bg-danger'">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.lastLogin) }}</td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <div class="dropdown" [class.show]="openDropdownIndex === i">
                      <button 
                        class="btn btn-sm btn-light" 
                        type="button" 
                        (click)="toggleDropdown(i, $event)"
                      >
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu" [class.show]="openDropdownIndex === i">
                        <li>
                          <a class="dropdown-item" [routerLink]="['/users', user.userId]" (click)="closeDropdown()">
                            <i class="fas fa-eye me-2"></i>View Details
                          </a>
                        </li>
                        <li>
                          <button class="dropdown-item" (click)="openRoleModal(user); closeDropdown()">
                            <i class="fas fa-user-tag me-2"></i>Change Role
                          </button>
                        </li>
                        <li>
                          <button class="dropdown-item" (click)="toggleUserStatus(user); closeDropdown()">
                            <i class="fas me-2" [ngClass]="user.isActive ? 'fa-user-times' : 'fa-user-check'"></i>
                            {{ user.isActive ? 'Deactivate' : 'Activate' }}
                          </button>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                          <button class="dropdown-item text-danger" (click)="deleteUser(user); closeDropdown()">
                            <i class="fas fa-trash me-2"></i>Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div *ngIf="!loading && pagination.pages > 1" class="d-flex justify-content-between align-items-center mt-4">
            <div>
              Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
              {{ pagination.total }} users
            </div>
            <nav>
              <ul class="pagination mb-0">
                <li class="page-item" [class.disabled]="pagination.page === 1">
                  <button class="page-link" (click)="changePage(pagination.page - 1)">Previous</button>
                </li>
                <li class="page-item" *ngFor="let page of getPageNumbers()" 
                    [class.active]="page === pagination.page">
                  <button class="page-link" (click)="changePage(page)">{{ page }}</button>
                </li>
                <li class="page-item" [class.disabled]="pagination.page === pagination.pages">
                  <button class="page-link" (click)="changePage(pagination.page + 1)">Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <!-- Role Change Modal -->
      <div class="modal fade" id="roleModal" tabindex="-1" *ngIf="selectedUser">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Change Role for {{ selectedUser.fullName }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Select New Role</label>
                <select class="form-select" [(ngModel)]="selectedRole">
                  <option value="">Choose a role...</option>
                  <option *ngFor="let role of roles" [value]="role.name">
                    {{ role.name }} - {{ role.description }}
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" (click)="updateUserRole()" [disabled]="!selectedRole">
                Update Role
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-circle {
      width: 40px;
      height: 40px;
      background-color: #6c757d;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }
    .table th {
      font-weight: 600;
      color: #6c757d;
      border-bottom: 2px solid #dee2e6;
    }
    .dropdown-menu.show {
      display: block;
    }
  `]
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  loading = false;
  selectedUser: User | null = null;
  selectedRole = '';
  Math = Math;
  openDropdownIndex: number | null = null;

  filters = {
    search: '',
    role: '',
    isActive: '',
    page: 1,
    limit: 10
  };

  pagination = {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  };

  constructor(
    private userService: UserService,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
    
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  toggleDropdown(index: number, event: Event) {
    event.stopPropagation();
    this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
  }

  closeDropdown() {
    this.openDropdownIndex = null;
  }

  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.closeDropdown();
    }
  }

  loadUsers() {
    this.loading = true;
    
    const params: any = {
      page: this.filters.page,
      limit: this.filters.limit
    };

    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.role) params.role = this.filters.role;
    if (this.filters.isActive) params.isActive = this.filters.isActive === 'true';

    this.userService.getUsers(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users = response.data.users;
          this.pagination = response.data.pagination;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.loading = false;
      }
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.roles = response.data.roles;
        }
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
      }
    });
  }

  onFilterChange() {
    this.filters.page = 1;
    this.loadUsers();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.pagination.pages) {
      this.filters.page = page;
      this.loadUsers();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.pagination.page - Math.floor(maxPages / 2));
    let end = Math.min(this.pagination.pages, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  openRoleModal(user: User) {
    this.selectedUser = user;
    this.selectedRole = user.role.name;
    
    const modal = new (window as any).bootstrap.Modal(document.getElementById('roleModal'));
    modal.show();
  }

  updateUserRole() {
    if (!this.selectedUser || !this.selectedRole) return;

    this.userService.updateUserRole(this.selectedUser.userId, this.selectedRole).subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.users.findIndex(u => u.userId === this.selectedUser!.userId);
          if (index !== -1 && response.data) {
            this.users[index] = response.data.user;
          }
          
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('roleModal'));
          modal.hide();
          
          this.selectedUser = null;
          this.selectedRole = '';
        }
      },
      error: (error) => {
        console.error('Failed to update user role:', error);
      }
    });
  }

  toggleUserStatus(user: User) {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${action} ${user.fullName}?`)) {
      this.userService.updateUserStatus(user.userId, newStatus).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const index = this.users.findIndex(u => u.userId === user.userId);
            if (index !== -1) {
              this.users[index] = response.data.user;
            }
          }
        },
        error: (error) => {
          console.error('Failed to update user status:', error);
        }
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.userId).subscribe({
        next: (response) => {
          if (response.success) {
            this.users = this.users.filter(u => u.userId !== user.userId);
            
            if (this.users.length === 0 && this.pagination.page > 1) {
              this.filters.page = this.pagination.page - 1;
              this.loadUsers();
            } else {
              this.loadUsers();
            }
          }
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
        }
      });
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(date: any): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
}