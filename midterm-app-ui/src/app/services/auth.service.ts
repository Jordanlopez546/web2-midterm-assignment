import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User, LoginRequest, RegisterRequest, ApiResponse, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'auth_token';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    const savedUser = this.getSavedUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(savedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/login`, 
      credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/register`, 
      userData
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('current_user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(
      `${environment.apiUrl}/auth/me`
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data.user);
          localStorage.setItem('current_user', JSON.stringify(response.data.user));
        }
      })
    );
  }

  updateProfile(data: { fullName?: string; email?: string }): Observable<ApiResponse<{ user: User }>> {
    return this.http.put<ApiResponse<{ user: User }>>(
      `${environment.apiUrl}/auth/me`, 
      data
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data.user);
          localStorage.setItem('current_user', JSON.stringify(response.data.user));
        }
      })
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${environment.apiUrl}/auth/change-password`, 
      data
    );
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.role.name === role : false;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserValue;
    return user ? user.role.permissions.includes(permission) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isEditor(): boolean {
    return this.hasRole('EDITOR');
  }

  isViewer(): boolean {
    return this.hasRole('VIEWER');
  }

  private setSession(authData: AuthResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, authData.token);
      localStorage.setItem('current_user', JSON.stringify(authData.user));
    }
    this.currentUserSubject.next(authData.user);
  }

  private getSavedUser(): User | null {
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  }
}