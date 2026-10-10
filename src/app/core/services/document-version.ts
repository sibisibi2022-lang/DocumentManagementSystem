import { Injectable, inject } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

export interface DocumentVersion {
  id: number;

  versionNumber: number;

  fileName: string;

  fileType: string;

  filePath: string;

  documentId: number;

  uploadedBy: number;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentVersionService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/document-versions';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  uploadVersion(documentId: number, file: File): Observable<DocumentVersion> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<DocumentVersion>(`${this.apiUrl}/${documentId}`, formData, {
      headers: this.getHeaders(),
    });
  }

  getVersions(documentId: number): Observable<DocumentVersion[]> {
    return this.http.get<DocumentVersion[]>(`${this.apiUrl}/${documentId}`, {
      headers: this.getHeaders(),
    });
  }

  downloadVersion(versionId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${versionId}/download`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }
}
