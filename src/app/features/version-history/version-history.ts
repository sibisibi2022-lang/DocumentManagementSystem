import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { DocumentVersionService, DocumentVersion } from '../../core/services/document-version';

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [],
  templateUrl: './version-history.html',
  styleUrl: './version-history.css',
})
export class VersionHistory implements OnInit {
  private versionService = inject(DocumentVersionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  documentId = 0;

  versions: DocumentVersion[] = [];

  selectedFile: File | null = null;

  loading = false;
  uploading = false;

  message = '';
  error = '';

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.documentId = Number(params['documentId']);

      this.loadVersions();
    });
  }

  loadVersions(): void {
    this.loading = true;
    this.error = '';

    this.cdr.detectChanges();

    this.versionService.getVersions(this.documentId).subscribe({
      next: (data) => {
        this.versions = [...data];

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load versions:', error);

        this.versions = [];

        this.loading = false;

        this.error = 'Unable to load version history';

        this.cdr.detectChanges();
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      this.message = '';
      this.error = '';

      this.cdr.detectChanges();
    } else {
      this.selectedFile = null;

      this.cdr.detectChanges();
    }
  }

  uploadVersion(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file';

      this.cdr.detectChanges();

      return;
    }

    this.uploading = true;

    this.message = '';
    this.error = '';

    this.cdr.detectChanges();

    this.versionService.uploadVersion(this.documentId, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Version uploaded:', response);

        this.message = 'New version uploaded successfully!';

        this.uploading = false;

        this.selectedFile = null;

        this.cdr.detectChanges();

        this.loadVersions();
      },

      error: (error) => {
        console.error('Version upload failed:', error);

        this.error = 'Failed to upload new version';

        this.uploading = false;

        this.cdr.detectChanges();
      },
    });
  }

  downloadVersion(version: DocumentVersion): void {
    this.message = '';
    this.error = '';

    this.cdr.detectChanges();

    this.versionService.downloadVersion(version.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = window.document.createElement('a');

        link.href = url;

        link.download = version.fileName;

        link.click();

        window.URL.revokeObjectURL(url);

        this.message = `Downloaded successfully: ${version.fileName}`;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Version download failed:', error);

        this.error = `Download failed: ${version.fileName}`;

        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/documents']);
  }
}
