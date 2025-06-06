import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<ApiResponse<{ roles: Role[] }>> {
    return this.http.get<ApiResponse<{ roles: Role[] }>>(this.apiUrl);
  }

  getDetailedRoles(): Observable<ApiResponse<{ roles: any[] }>> {
    return this.http.get<ApiResponse<{ roles: any[] }>>(`${this.apiUrl}/admin`);
  }

  getRoleById(roleId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/admin/${roleId}`);
  }

  createRole(roleData: {
    name: string;
    description: string;
    permissions: string[];
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/admin`, roleData);
  }

  updateRole(roleId: string, roleData: {
    description?: string;
    permissions?: string[];
  }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/admin/${roleId}`, roleData);
  }

  deleteRole(roleId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/admin/${roleId}`);
  }

  getRoleStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/admin/statistics`);
  }
}