import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h3 mb-0">
              <i class="fas fa-user-tag me-2"></i>Roles Management
            </h1>
            <button class="btn btn-primary" (click)="openCreateModal()">
              <i class="fas fa-plus me-2"></i>Create Role
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div *ngIf="roleStats" class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Total Roles</h6>
              <h3 class="mb-0">{{ roleStats.overview.totalRoles }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Total Users</h6>
              <h3 class="mb-0">{{ roleStats.overview.totalUsers }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Active Users</h6>
              <h3 class="mb-0">{{ roleStats.overview.totalActiveUsers }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="text-muted mb-2">Inactive Users</h6>
              <h3 class="mb-0">{{ roleStats.overview.totalInactiveUsers }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Roles Table -->
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!loading && roles.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th>Users</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let role of roles">
                  <td>
                    <span class="badge bg-primary fs-6">{{ role.name }}</span>
                  </td>
                  <td>{{ role.description }}</td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span *ngFor="let permission of role.permissions" 
                            class="badge bg-secondary">
                        {{ permission }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{{ role.userCount }}</strong> users
                      <br>
                      <small class="text-muted">{{ role.activeUserCount }} active</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge" 
                          [ngClass]="isDefaultRole(role.name) ? 'bg-info' : 'bg-success'">
                      {{ isDefaultRole(role.name) ? 'System' : 'Custom' }}
                    </span>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li>
                          <button class="dropdown-item" (click)="viewRoleDetails(role.roleId)">
                            <i class="fas fa-eye me-2"></i>View Details
                          </button>
                        </li>
                        <li *ngIf="!isDefaultRole(role.name)">
                          <button class="dropdown-item" (click)="openEditModal(role)">
                            <i class="fas fa-edit me-2"></i>Edit
                          </button>
                        </li>
                        <li *ngIf="!isDefaultRole(role.name) && role.userCount === 0">
                          <hr class="dropdown-divider">
                        </li>
                        <li *ngIf="!isDefaultRole(role.name) && role.userCount === 0">
                          <button class="dropdown-item text-danger" (click)="deleteRole(role)">
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
        </div>
      </div>

      <!-- Create/Edit Role Modal -->
      <div class="modal fade" id="roleModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editingRole ? 'Edit Role' : 'Create New Role' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="mb-3" *ngIf="!editingRole">
                  <label class="form-label">Role Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [(ngModel)]="formData.name"
                    name="name"
                    placeholder="e.g., MODERATOR"
                    style="text-transform: uppercase;"
                  >
                  <small class="text-muted">Role name will be automatically converted to uppercase</small>
                </div>

                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea 
                    class="form-control" 
                    [(ngModel)]="formData.description"
                    name="description"
                    rows="3"
                    placeholder="Describe the role's purpose and responsibilities"
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">Permissions</label>
                  <div class="row g-2">
                    <div class="col-6" *ngFor="let permission of availablePermissions">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          [id]="permission"
                          [checked]="formData.permissions.includes(permission)"
                          (change)="togglePermission(permission)"
                        >
                        <label class="form-check-label" [for]="permission">
                          {{ permission }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div *ngIf="error" class="alert alert-danger">
                  {{ error }}
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                class="btn btn-primary" 
                (click)="saveRole()"
                [disabled]="!isFormValid()"
              >
                {{ editingRole ? 'Update' : 'Create' }} Role
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Details Modal -->
      <div class="modal fade" id="roleDetailsModal" tabindex="-1" *ngIf="selectedRole">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Role Details: {{ selectedRole.role.name }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Role Information</h6>
                  <p><strong>Name:</strong> {{ selectedRole.role.name }}</p>
                  <p><strong>Description:</strong> {{ selectedRole.role.description }}</p>
                  <p><strong>Created:</strong> {{ formatDate(selectedRole.role.createdAt) }}</p>
                  <p><strong>Updated:</strong> {{ formatDate(selectedRole.role.updatedAt) }}</p>
                </div>
                <div class="col-md-6">
                  <h6>Statistics</h6>
                  <p><strong>Total Users:</strong> {{ selectedRole.statistics.totalUsers }}</p>
                  <p><strong>Active Users:</strong> {{ selectedRole.statistics.activeUsers }}</p>
                  <p><strong>Inactive Users:</strong> {{ selectedRole.statistics.inactiveUsers }}</p>
                </div>
              </div>
              
              <h6 class="mt-3">Permissions</h6>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span *ngFor="let permission of selectedRole.role.permissions" 
                      class="badge bg-secondary">
                  {{ permission }}
                </span>
              </div>

              <h6>Users with this role</h6>
              <div class="table-responsive" *ngIf="selectedRole.users.length > 0">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of selectedRole.users">
                      <td>{{ user.fullName }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge" [ngClass]="user.isActive ? 'bg-success' : 'bg-danger'">
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>{{ formatDate(user.lastLogin) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p *ngIf="selectedRole.users.length === 0" class="text-muted">
                No users assigned to this role yet.
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-weight: normal;
    }
    .table th {
      font-weight: 600;
      color: #6c757d;
      border-bottom: 2px solid #dee2e6;
    }
  `]
})
export class RolesListComponent implements OnInit {
  roles: any[] = [];
  roleStats: any = null;
  loading = false;
  editingRole: any = null;
  selectedRole: any = null;
  error: string | null = null;

  formData = {
    name: '',
    description: '',
    permissions: [] as string[]
  };

  availablePermissions = [
    'create',
    'read',
    'update',
    'delete',
    'manage_users',
    'manage_roles'
  ];

  defaultRoles = ['ADMIN', 'EDITOR', 'VIEWER'];

  constructor(private roleService: RoleService) {}

  ngOnInit() {
    this.loadRoles();
    this.loadRoleStatistics();
  }

  loadRoles() {
    this.loading = true;
    this.roleService.getDetailedRoles().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.roles = response.data.roles;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load roles:', error);
        this.loading = false;
      }
    });
  }

  loadRoleStatistics() {
    this.roleService.getRoleStatistics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.roleStats = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load role statistics:', error);
      }
    });
  }

  isDefaultRole(roleName: string): boolean {
    return this.defaultRoles.includes(roleName);
  }

  openCreateModal() {
    this.editingRole = null;
    this.formData = {
      name: '',
      description: '',
      permissions: []
    };
    this.error = null;
    
    const modal = new (window as any).bootstrap.Modal(document.getElementById('roleModal'));
    modal.show();
  }

  openEditModal(role: any) {
    this.editingRole = role;
    this.formData = {
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    };
    this.error = null;
    
    const modal = new (window as any).bootstrap.Modal(document.getElementById('roleModal'));
    modal.show();
  }

  togglePermission(permission: string) {
    const index = this.formData.permissions.indexOf(permission);
    if (index > -1) {
      this.formData.permissions.splice(index, 1);
    } else {
      this.formData.permissions.push(permission);
    }
  }

  isFormValid(): boolean {
    if (this.editingRole) {
      return this.formData.description.trim().length > 0;
    }
    return this.formData.name.trim().length > 0 && 
           this.formData.description.trim().length > 0;
  }

  saveRole() {
    this.error = null;
    
    if (this.editingRole) {
      this.roleService.updateRole(this.editingRole.roleId, {
        description: this.formData.description,
        permissions: this.formData.permissions
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRoles();
            this.loadRoleStatistics();
            
            const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('roleModal'));
            modal.hide();
          } else {
            this.error = response.message;
          }
        },
        error: (error) => {
          this.error = error.message || 'Failed to update role';
        }
      });
    } else {
      this.roleService.createRole(this.formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRoles();
            this.loadRoleStatistics();
            
            const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('roleModal'));
            modal.hide();
          } else {
            this.error = response.message;
          }
        },
        error: (error) => {
          this.error = error.message || 'Failed to create role';
        }
      });
    }
  }

  viewRoleDetails(roleId: string) {
    this.roleService.getRoleById(roleId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedRole = response.data;
          
          const modal = new (window as any).bootstrap.Modal(document.getElementById('roleDetailsModal'));
          modal.show();
        }
      },
      error: (error) => {
        console.error('Failed to load role details:', error);
      }
    });
  }

  deleteRole(role: any) {
    if (confirm(`Are you sure you want to delete the ${role.name} role? This action cannot be undone.`)) {
      this.roleService.deleteRole(role.roleId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRoles();
            this.loadRoleStatistics();
          }
        },
        error: (error) => {
          alert(error.message || 'Failed to delete role');
        }
      });
    }
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