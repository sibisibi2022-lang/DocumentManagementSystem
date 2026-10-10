import { Injectable, inject } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/auth';

  private userApiUrl = 'http://localhost:8080/api/users';

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request);
  }

  getProfile(): Observable<UserProfile> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<UserProfile>(`${this.userApiUrl}/profile`, {
      headers,
    });
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isManager(): boolean {
    return this.getRole() === 'MANAGER';
  }

  isEmployee(): boolean {
    return this.getRole() === 'EMPLOYEE';
  }

  isAdminOrManager(): boolean {
    const role = this.getRole();

    return role === 'ADMIN' || role === 'MANAGER';
  }

  logout(): void {
    localStorage.removeItem('token');

    localStorage.removeItem('role');

    localStorage.removeItem('user');
  }
}
