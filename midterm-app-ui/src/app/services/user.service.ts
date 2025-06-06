import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, ApiResponse, PaginatedResponse, DashboardStats } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Observable<ApiResponse<PaginatedResponse<User>>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<User>>>(this.apiUrl, { params: httpParams });
  }

  getUserById(userId: string): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.apiUrl}/${userId}`);
  }

  updateUserRole(userId: string, roleName: string): Observable<ApiResponse<{ user: User }>> {
    return this.http.put<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/${userId}/role`,
      { roleName }
    );
  }

  updateUserStatus(userId: string, isActive: boolean): Observable<ApiResponse<{ user: User }>> {
    return this.http.put<ApiResponse<{ user: User }>>(
      `${this.apiUrl}/${userId}/status`,
      { isActive }
    );
  }

  deleteUser(userId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${userId}`);
  }

  getDashboardStats(): Observable<ApiResponse<{ overview: any; usersByRole: any; registrationTrend: any[] }>> {
    return this.http.get<ApiResponse<{ overview: any; usersByRole: any; registrationTrend: any[] }>>(
      `${this.apiUrl}/dashboard/stats`
    );
  }
}