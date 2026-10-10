import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PasswordResetResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';

  requestReset(email: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }
}
