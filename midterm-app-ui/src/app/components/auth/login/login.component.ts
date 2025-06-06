import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">
                <i class="fas fa-sign-in-alt me-2"></i>Login
              </h2>
              
              <div *ngIf="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
                <button type="button" class="btn-close" (click)="error = null"></button>
              </div>

              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
                      [class.is-invalid]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
                    >
                    <div class="invalid-feedback" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
                      <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
                      <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</span>
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
                      [class.is-invalid]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
                    >
                    <div class="invalid-feedback" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
                      Password is required
                    </div>
                  </div>
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" [disabled]="loading || loginForm.invalid">
                    <span *ngIf="!loading">
                      <i class="fas fa-sign-in-alt me-2"></i>Login
                    </span>
                    <span *ngIf="loading">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Logging in...
                    </span>
                  </button>
                </div>
              </form>

              <hr class="my-4">

              <div class="text-center">
                <p class="mb-0">
                  Don't have an account? 
                  <a routerLink="/register" class="text-decoration-none">Register here</a>
                </p>
              </div>

              <div class="mt-4 p-3 bg-light rounded">
                <h6 class="mb-2">Test Credentials:</h6>
                <small class="d-block"><strong>Admin:</strong> admin&#64;example.com / admin123</small>
                <small class="d-block"><strong>Editor:</strong> editor&#64;example.com / editor123</small>
                <small class="d-block"><strong>Viewer:</strong> viewer&#64;example.com / viewer123</small>
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
    .form-control {
      border-left: none;
    }
    .form-control:focus {
      box-shadow: none;
      border-color: #ced4da;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error: string | null = null;
  returnUrl: string = '/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.error = response.message;
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = error.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}