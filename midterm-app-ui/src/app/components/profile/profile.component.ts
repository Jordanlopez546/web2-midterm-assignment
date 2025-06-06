import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <h1 class="h3 mb-4">
            <i class="fas fa-user-circle me-2"></i>Profile
          </h1>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <!-- Profile Information -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white">
              <h6 class="mb-0">Profile Information</h6>
            </div>
            <div class="card-body">
              <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
                <button type="button" class="btn-close" (click)="successMessage = null"></button>
              </div>

              <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
                <button type="button" class="btn-close" (click)="error = null"></button>
              </div>

              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="fullName" class="form-label">Full Name</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="fullName"
                      formControlName="fullName"
                      [class.is-invalid]="profileForm.get('fullName')?.touched && profileForm.get('fullName')?.invalid"
                    >
                    <div class="invalid-feedback" *ngIf="profileForm.get('fullName')?.touched && profileForm.get('fullName')?.invalid">
                      <span *ngIf="profileForm.get('fullName')?.errors?.['required']">Full name is required</span>
                      <span *ngIf="profileForm.get('fullName')?.errors?.['minlength']">Full name must be at least 3 characters</span>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email"
                      formControlName="email"
                      [class.is-invalid]="profileForm.get('email')?.touched && profileForm.get('email')?.invalid"
                    >
                    <div class="invalid-feedback" *ngIf="profileForm.get('email')?.touched && profileForm.get('email')?.invalid">
                      <span *ngIf="profileForm.get('email')?.errors?.['required']">Email is required</span>
                      <span *ngIf="profileForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Role</label>
                    <input type="text" class="form-control" [value]="currentUser?.role?.name" readonly>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Status</label>
                    <div class="mt-2">
                      <span class="badge" [ngClass]="currentUser?.isActive ? 'bg-success' : 'bg-danger'">
                        {{ currentUser?.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Member Since</label>
                    <input type="text" class="form-control" [value]="formatDate(currentUser?.createdAt)" readonly>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Last Login</label>
                    <input type="text" class="form-control" [value]="formatDate(currentUser?.lastLogin)" readonly>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary" [disabled]="profileLoading || profileForm.invalid || !profileForm.dirty">
                  <span *ngIf="!profileLoading">
                    <i class="fas fa-save me-2"></i>Update Profile
                  </span>
                  <span *ngIf="profileLoading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </span>
                </button>
              </form>
            </div>
          </div>

          <!-- Change Password -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0">Change Password</h6>
            </div>
            <div class="card-body">
              <div *ngIf="passwordSuccess" class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>{{ passwordSuccess }}
                <button type="button" class="btn-close" (click)="passwordSuccess = null"></button>
              </div>

              <div *ngIf="passwordError" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>{{ passwordError }}
                <button type="button" class="btn-close" (click)="passwordError = null"></button>
              </div>

              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Current Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="currentPassword"
                    formControlName="currentPassword"
                    [class.is-invalid]="passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.invalid"
                  >
                  <div class="invalid-feedback" *ngIf="passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.invalid">
                    Current password is required
                  </div>
                </div>

                <div class="mb-3">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="newPassword"
                    formControlName="newPassword"
                    [class.is-invalid]="passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.invalid"
                  >
                  <div class="invalid-feedback" *ngIf="passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.invalid">
                    <span *ngIf="passwordForm.get('newPassword')?.errors?.['required']">New password is required</span>
                    <span *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">New password must be at least 6 characters</span>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword"
                    formControlName="confirmPassword"
                    [class.is-invalid]="passwordForm.get('confirmPassword')?.touched && passwordForm.get('confirmPassword')?.invalid"
                  >
                  <div class="invalid-feedback" *ngIf="passwordForm.get('confirmPassword')?.touched && passwordForm.get('confirmPassword')?.invalid">
                    <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
                    <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary" [disabled]="passwordLoading || passwordForm.invalid">
                  <span *ngIf="!passwordLoading">
                    <i class="fas fa-key me-2"></i>Change Password
                  </span>
                  <span *ngIf="passwordLoading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Changing...
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <!-- Role Permissions -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h6 class="mb-0">Role & Permissions</h6>
            </div>
            <div class="card-body">
              <h6 class="text-primary mb-3">{{ currentUser?.role?.name }}</h6>
              <p class="text-muted small mb-3">{{ currentUser?.role?.description }}</p>
              
              <h6 class="text-muted mb-2">Permissions:</h6>
              <div class="d-flex flex-wrap gap-2">
                <span *ngFor="let permission of currentUser?.role?.permissions" 
                      class="badge bg-secondary">
                  <i class="fas fa-check me-1"></i>{{ permission }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      margin-bottom: 1.5rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  profileLoading = false;
  passwordLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  passwordError: string | null = null;
  passwordSuccess: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    
    this.profileForm = this.formBuilder.group({
      fullName: [this.currentUser?.fullName || '', [Validators.required, Validators.minLength(3)]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    this.profileLoading = true;
    this.error = null;
    this.successMessage = null;

    const updateData: any = {};
    if (this.profileForm.get('fullName')?.dirty) {
      updateData.fullName = this.profileForm.get('fullName')?.value;
    }
    if (this.profileForm.get('email')?.dirty) {
      updateData.email = this.profileForm.get('email')?.value;
    }

    this.authService.updateProfile(updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Profile updated successfully';
          this.currentUser = response.data!.user;
          this.profileForm.markAsPristine();
        } else {
          this.error = response.message;
        }
        this.profileLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to update profile';
        this.profileLoading = false;
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      return;
    }

    this.passwordLoading = true;
    this.passwordError = null;
    this.passwordSuccess = null;

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (response) => {
        if (response.success) {
          this.passwordSuccess = 'Password changed successfully';
          this.passwordForm.reset();
        } else {
          this.passwordError = response.message;
        }
        this.passwordLoading = false;
      },
      error: (error) => {
        this.passwordError = error.message || 'Failed to change password';
        this.passwordLoading = false;
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}