import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { VersionService, DocumentVersion } from '../../core/services/version';

@Component({
  selector: 'app-versions',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './versions.html',
  styleUrl: './versions.css',
})
export class Versions implements OnInit {
  private versionService = inject(VersionService);

  private route = inject(ActivatedRoute);

  private router = inject(Router);

  documentId: number = 0;

  versions: DocumentVersion[] = [];

  selectedFile: File | null = null;

  loading: boolean = true;

  uploading: boolean = false;

  error: string = '';

  message: string = '';

  warning: string = '';

  role: string = '';

  canCreateVersion: boolean = false;

  ngOnInit(): void {
    this.role = localStorage.getItem('role')?.toUpperCase() || '';

    this.canCreateVersion = this.role === 'ADMIN' || this.role === 'MANAGER';

    this.route.paramMap.subscribe((params) => {
      const id = params.get('documentId');

      if (id) {
        this.documentId = Number(id);

        this.loadVersions();
      } else {
        this.error = 'Document ID not found';

        this.loading = false;
      }
    });
  }

  loadVersions(): void {
    this.loading = true;

    this.error = '';

    this.versionService.getVersions(this.documentId).subscribe({
      next: (data: DocumentVersion[]) => {
        console.log('Versions loaded:', data);

        this.versions = data;

        this.loading = false;
      },

      error: (error: any) => {
        console.error('Failed to load versions:', error);

        this.error = 'Unable to load document versions';

        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      this.message = '';

      this.warning = '';

      this.error = '';
    } else {
      this.selectedFile = null;
    }
  }

  uploadNewVersion(): void {
    this.warning = '';

    this.message = '';

    this.error = '';

    if (!this.selectedFile) {
      this.warning = 'Please select a file';

      return;
    }

    this.uploading = true;

    this.versionService.createVersion(this.documentId, this.selectedFile).subscribe({
      next: (response: DocumentVersion) => {
        console.log('New version created:', response);

        this.uploading = false;

        this.message = `Version ${response.versionNumber} uploaded successfully!`;

        this.selectedFile = null;

        this.loadVersions();
      },

      error: (error: any) => {
        console.error('Version upload response:', error);

        this.uploading = false;

        const backendMessage = typeof error.error === 'string' ? error.error : '';

        if (backendMessage.includes('already available in version history')) {
          this.warning =
            'This file is already available in version history. No new version was created.';

          this.selectedFile = null;

          return;
        }

        if (error.status === 403) {
          this.error = 'You do not have permission to create a new version';

          return;
        }

        this.error = backendMessage || 'Version upload failed';
      },
    });
  }

  downloadVersion(version: DocumentVersion): void {
    this.versionService.downloadVersion(version.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = window.document.createElement('a');

        link.href = url;

        link.download = version.fileName;

        link.click();

        window.URL.revokeObjectURL(url);
      },

      error: (error: any) => {
        console.error('Version download failed:', error);

        this.error = 'Unable to download version';
      },
    });
  }

  goToDocuments(): void {
    this.router.navigate(['/documents']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
