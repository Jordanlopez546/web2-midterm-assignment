import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RoleService } from '../../../services/role.service';
import { Role } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">
                <i class="fas fa-user-plus me-2"></i>Register
              </h2>
              
              <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
                <button type="button" class="btn-close" (click)="error = null"></button>
              </div>

              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="fullName" class="form-label">Full Name</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="fullName"
                      formControlName="fullName"
                      placeholder="Enter your full name"
                      [class.is-invalid]="registerForm.get('fullName')?.touched && registerForm.get('fullName')?.invalid"
                    >
                    <div class="invalid-feedback" *ngIf="registerForm.get('fullName')?.touched && registerForm.get('fullName')?.invalid">
                      <span *ngIf="registerForm.get('fullName')?.errors?.['required']">Full name is required</span>
                      <span *ngIf="registerForm.get('fullName')?.errors?.['minlength']">Full name must be at least 3 characters</span>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email"
                      formControlName="email"
                      placeholder="Enter your email"
                      [class.is-invalid]="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
                    >
                    <div class="invalid-feedback" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
                      <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
                      <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input 
                      type="password" 
                      class="form-control" 
                      id="password"
                      formControlName="password"
                      placeholder="Enter your password"
                      [class.is-invalid]="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
                    >
                    <div class="invalid-feedback" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
                      <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
                      <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="roleName" class="form-label">Role</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-user-tag"></i></span>
                    <select 
                      class="form-select" 
                      id="roleName"
                      formControlName="roleName"
                      [class.is-invalid]="registerForm.get('roleName')?.touched && registerForm.get('roleName')?.invalid"
                    >
                      <option value="">Select a role</option>
                      <option *ngFor="let role of roles" [value]="role.name">
                        {{ role.name }} - {{ role.description }}
                      </option>
                    </select>
                    <div class="invalid-feedback" *ngIf="registerForm.get('roleName')?.touched && registerForm.get('roleName')?.invalid">
                      Role is required
                    </div>
                  </div>
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" [disabled]="loading || registerForm.invalid">
                    <span *ngIf="!loading">
                      <i class="fas fa-user-plus me-2"></i>Register
                    </span>
                    <span *ngIf="loading">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Registering...
                    </span>
                  </button>
                </div>
              </form>

              <hr class="my-4">

              <div class="text-center">
                <p class="mb-0">
                  Already have an account? 
                  <a routerLink="/login" class="text-decoration-none">Login here</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 10px;
    }
    .btn-primary {
      padding: 10px;
      font-weight: 500;
    }
    .input-group-text {
      background-color: #f8f9fa;
      border-right: none;
    }
    .form-control, .form-select {
      border-left: none;
    }
    .form-control:focus, .form-select:focus {
      box-shadow: none;
      border-color: #ced4da;
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error: string | null = null;
  roles: Role[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleName: ['', Validators.required]
    });

    this.loadRoles();
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

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = response.message;
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = error.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}