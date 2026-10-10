import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DocumentService, Document } from '../../core/services/document';

import { CategoryService, Category } from '../../core/services/category';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents implements OnInit {
  private documentService = inject(DocumentService);

  private categoryService = inject(CategoryService);

  private router = inject(Router);

  private changeDetector = inject(ChangeDetectorRef);

  documents: Document[] = [];

  filteredDocuments: Document[] = [];

  categories: Category[] = [];

  selectedCategoryId: number = 0;

  filterCategoryId: number = 0;

  loading: boolean = true;

  error: string = '';

  title: string = '';

  description: string = '';

  selectedFile: File | null = null;

  uploading: boolean = false;

  uploadMessage: string = '';

  searchText: string = '';

  selectedFileType: string = '';

  editingDocument: Document | null = null;

  editingFile: File | null = null;

  updating: boolean = false;

  updateMessage: string = '';

  updateWarning: string = '';

  role: string = '';

  canEditDocuments: boolean = false;

  canDeleteDocuments: boolean = false;

  notificationMessage: string = '';

  notificationType: 'success' | 'warning' | 'error' | '' = '';

  ngOnInit(): void {
    this.loadRole();

    this.loadDocuments();

    this.loadCategories();
  }

  // Show notification
  showNotification(message: string, type: 'success' | 'warning' | 'error'): void {
    this.notificationMessage = message;

    this.notificationType = type;

    this.changeDetector.detectChanges();
  }

  // Clear notification
  clearNotification(): void {
    this.notificationMessage = '';

    this.notificationType = '';

    this.changeDetector.detectChanges();
  }

  loadRole(): void {
    this.role = localStorage.getItem('role')?.toUpperCase() || '';

    this.canEditDocuments = this.role === 'ADMIN' || this.role === 'MANAGER';

    this.canDeleteDocuments = this.role === 'ADMIN' || this.role === 'MANAGER';

    console.log('User role:', this.role);

    this.changeDetector.detectChanges();
  }

  loadDocuments(): void {
    this.loading = true;

    this.error = '';

    this.documentService.getDocuments().subscribe({
      next: (data: Document[]) => {
        console.log('Documents loaded:', data);

        this.documents = [...data];

        this.loading = false;

        this.searchDocuments();

        this.changeDetector.detectChanges();
      },

      error: (error: any) => {
        console.error('Failed to load documents:', error);

        this.error = 'Unable to load documents';

        this.loading = false;

        this.showNotification('Unable to load documents.', 'error');

        this.changeDetector.detectChanges();
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        console.log('Categories loaded:', data);

        this.categories = data;

        this.changeDetector.detectChanges();
      },

      error: (error: any) => {
        console.error('Failed to load categories:', error);

        this.showNotification('Unable to load categories.', 'error');
      },
    });
  }

  searchDocuments(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredDocuments = this.documents.filter((document: Document) => {
      const titleMatch = document.title.toLowerCase().includes(search);

      const fileTypeMatch =
        this.selectedFileType === '' ||
        document.fileType.toLowerCase().includes(this.selectedFileType.toLowerCase());

      const categoryMatch =
        this.filterCategoryId === 0 || document.categoryId === this.filterCategoryId;

      return titleMatch && fileTypeMatch && categoryMatch;
    });

    this.changeDetector.detectChanges();
  }

  clearFilters(): void {
    this.searchText = '';

    this.selectedFileType = '';

    this.filterCategoryId = 0;

    this.searchDocuments();

    this.showNotification('Filters cleared successfully.', 'success');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      this.uploadMessage = '';
    } else {
      this.selectedFile = null;
    }

    this.changeDetector.detectChanges();
  }

  uploadDocument(): void {
    this.clearNotification();

    if (!this.title.trim()) {
      this.showNotification('Please enter document title.', 'warning');

      return;
    }

    if (this.selectedCategoryId === 0) {
      this.showNotification('Please select a category.', 'warning');

      return;
    }

    if (!this.selectedFile) {
      this.showNotification('Please select a file.', 'warning');

      return;
    }

    this.uploading = true;

    this.changeDetector.detectChanges();

    const file = this.selectedFile;

    this.documentService
      .uploadDocument(file, this.title, this.description, this.selectedCategoryId)
      .subscribe({
        next: (response: Document) => {
          console.log('Document uploaded successfully:', response);

          this.uploading = false;

          this.title = '';

          this.description = '';

          this.selectedFile = null;

          this.selectedCategoryId = 0;

          this.documents = [...this.documents, response];

          this.searchDocuments();

          this.notificationMessage = 'Document uploaded successfully. Version 1 created.';

          this.notificationType = 'success';

          this.changeDetector.detectChanges();
        },

        error: (error: any) => {
          console.error('Upload failed:', error);

          this.uploading = false;

          const backendMessage = this.getBackendMessage(error);

          this.notificationMessage = backendMessage || 'Document upload failed.';

          this.notificationType = 'error';

          this.changeDetector.detectChanges();
        },
      });
  }

  startEdit(document: Document): void {
    if (!this.canEditDocuments) {
      this.showNotification('You do not have permission to edit documents.', 'warning');

      return;
    }

    console.log('Starting edit:', document);

    this.editingDocument = {
      ...document,
    };

    this.editingFile = null;

    this.updateMessage = '';

    this.updateWarning = '';

    this.clearNotification();

    this.changeDetector.detectChanges();
  }

  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.editingFile = input.files[0];

      this.updateMessage = '';

      this.updateWarning = '';
    } else {
      this.editingFile = null;
    }

    this.changeDetector.detectChanges();
  }

  cancelEdit(): void {
    this.editingDocument = null;

    this.editingFile = null;

    this.updateMessage = '';

    this.updateWarning = '';

    this.updating = false;

    this.clearNotification();

    this.changeDetector.detectChanges();
  }

  updateDocument(): void {
    this.clearNotification();

    if (!this.canEditDocuments) {
      this.showNotification('You do not have permission to edit documents.', 'warning');

      return;
    }

    if (!this.editingDocument) {
      this.showNotification('No document selected.', 'warning');

      return;
    }

    if (!this.editingDocument.title || !this.editingDocument.title.trim()) {
      this.showNotification('Please enter document title.', 'warning');

      return;
    }

    if (!this.editingDocument.categoryId) {
      this.showNotification('Please select a category.', 'warning');

      return;
    }

    this.updating = true;

    const updatedDocument: Document = {
      ...this.editingDocument,
    };

    const selectedReplacementFile = this.editingFile;

    this.changeDetector.detectChanges();

    this.documentService.updateDocument(updatedDocument, selectedReplacementFile).subscribe({
      next: (response: Document) => {
        console.log('Document update successful:', response);

        this.updating = false;

        const index = this.documents.findIndex((document: Document) => document.id === response.id);

        if (index !== -1) {
          this.documents[index] = {
            ...response,
          };
        }

        this.documents = [...this.documents];

        this.searchDocuments();

        this.editingDocument = null;

        this.editingFile = null;

        if (selectedReplacementFile) {
          this.notificationMessage =
            'Document updated successfully. A new version was created automatically.';
        } else {
          this.notificationMessage = 'Document updated successfully.';
        }

        this.notificationType = 'success';

        this.changeDetector.detectChanges();
      },

      error: (error: any) => {
        console.error('Update failed:', error);

        this.updating = false;

        const backendMessage = this.getBackendMessage(error);

        console.log('Backend message:', backendMessage);

        if (backendMessage.includes('already available in version history')) {
          this.notificationMessage =
            'This file is already available in version history. No new version was created.';

          this.notificationType = 'warning';

          this.changeDetector.detectChanges();

          return;
        }

        this.notificationMessage = backendMessage || 'Document update failed.';

        this.notificationType = 'error';

        this.changeDetector.detectChanges();
      },
    });
  }

  // Read backend error message
  private getBackendMessage(error: any): string {
    if (error && error.error && typeof error.error === 'object') {
      return error.error.message || '';
    }

    if (error && typeof error.error === 'string') {
      return error.error;
    }

    return '';
  }

  downloadDocument(document: Document): void {
    this.clearNotification();

    this.documentService.downloadDocument(document.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = window.document.createElement('a');

        link.href = url;

        link.download = document.fileName;

        link.click();

        window.URL.revokeObjectURL(url);

        this.showNotification('Document downloaded successfully.', 'success');
      },

      error: (error: any) => {
        console.error('Download failed:', error);

        this.showNotification('Unable to download document.', 'error');
      },
    });
  }

  deleteDocument(id: number): void {
    this.clearNotification();

    if (!this.canDeleteDocuments) {
      this.showNotification('You do not have permission to delete documents.', 'warning');

      return;
    }

    const confirmed = confirm('Are you sure you want to delete this document?');

    if (!confirmed) {
      return;
    }

    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        console.log('Document deleted successfully');

        this.documents = this.documents.filter((document: Document) => document.id !== id);

        this.searchDocuments();

        this.showNotification('Document deleted successfully.', 'success');
      },

      error: (error: any) => {
        console.error('Delete failed:', error);

        const backendMessage = this.getBackendMessage(error);

        this.showNotification(backendMessage || 'Unable to delete document.', 'error');
      },
    });
  }

  viewVersions(documentId: number): void {
    this.router.navigate(['/versions', documentId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToCategories(): void {
    this.router.navigate(['/categories']);
  }
}
