import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface AuditLog {

  id: number;

  action: string;

  description: string;

  userId?: number;

  userName?: string;

  documentId?: number;

  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/audit-logs';

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllLogs(): Observable<AuditLog[]> {

    return this.http.get<AuditLog[]>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    );
  }

  getLogById(id: number): Observable<AuditLog> {

    return this.http.get<AuditLog>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}
