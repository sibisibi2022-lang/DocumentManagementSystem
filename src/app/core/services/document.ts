import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Document {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedBy: number;
  categoryId: number;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/documents';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Get all documents
  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  // Upload a new document
  uploadDocument(
    file: File,
    title: string,
    description: string,
    categoryId: number,
  ): Observable<Document> {
    const formData = new FormData();

    formData.append('file', file);

    formData.append('title', title);

    formData.append('description', description);

    formData.append('categoryId', categoryId.toString());

    return this.http.post<Document>(`${this.apiUrl}/upload`, formData, {
      headers: this.getHeaders(),
    });
  }

  // Update document and optionally replace its file
  updateDocument(document: Document, file?: File | null): Observable<Document> {
    const formData = new FormData();

    formData.append('title', document.title);

    formData.append('description', document.description);

    formData.append('categoryId', document.categoryId.toString());

    if (file) {
      formData.append('file', file);
    }

    return this.http.put<Document>(`${this.apiUrl}/${document.id}`, formData, {
      headers: this.getHeaders(),
    });
  }

  // Download current document
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }

  // Delete document
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
