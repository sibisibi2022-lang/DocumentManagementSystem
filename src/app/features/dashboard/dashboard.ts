import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';

import { Router } from '@angular/router';

import { DocumentService, Document } from '../../core/services/document';

import { CategoryService, Category } from '../../core/services/category';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private documentService = inject(DocumentService);
  private categoryService = inject(CategoryService);
  private authService = inject(Auth);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);

  // All documents
  documents: Document[] = [];

  // Recent documents
  recentDocuments: Document[] = [];

  // All categories
  categories: Category[] = [];

  // Loading status
  loading: boolean = true;

  // Error message
  error: string = '';

  // Logged-in user role
  userRole: string = '';

  // Permission for categories
  canManageCategories: boolean = false;

  // Permission for audit logs
  canViewAuditLogs: boolean = false;

  ngOnInit(): void {
    console.log('Dashboard initialized');

    this.loadUserRole();

    this.loadDocuments();

    this.loadCategories();
  }

  // Get logged-in user's role
  loadUserRole(): void {
    this.userRole = this.authService.getRole().toUpperCase();

    console.log('Dashboard user role:', this.userRole);

    this.canManageCategories = this.userRole === 'ADMIN' || this.userRole === 'MANAGER';

    this.canViewAuditLogs = this.userRole === 'ADMIN' || this.userRole === 'MANAGER';
  }

  // Load documents from backend
  loadDocuments(): void {
    console.log('Loading dashboard documents...');

    this.documentService.getDocuments().subscribe({
      next: (data: Document[]) => {
        console.log('Dashboard documents received:', data);

        // Store all documents
        this.documents = [...data];

        // Sort by ID and take latest 5
        this.recentDocuments = [...data]
          .sort((first: Document, second: Document) => second.id - first.id)
          .slice(0, 5);

        console.log('Total documents:', this.documents.length);

        console.log('Recent documents:', this.recentDocuments.length);

        // Dashboard loading completed
        this.loading = false;

        // Force Angular to update the screen
        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {
        console.error('Dashboard document loading failed:', error);

        this.documents = [];

        this.recentDocuments = [];

        this.error = 'Unable to load dashboard documents';

        this.loading = false;

        // Force Angular to update the screen
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // Load categories from backend
  loadCategories(): void {
    console.log('Loading dashboard categories...');

    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        console.log('Dashboard categories received:', data);

        // Store categories
        this.categories = [...data];

        console.log('Total categories:', this.categories.length);

        // Force Angular to update the screen
        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {
        console.error('Dashboard category loading failed:', error);

        this.categories = [];

        // Force Angular to update the screen
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // Open documents page
  goToDocuments(): void {
    this.router.navigate(['/documents']);
  }

  // Open categories page
  goToCategories(): void {
    this.router.navigate(['/categories']);
  }

  // Open audit logs page
  goToAuditLogs(): void {
    this.router.navigate(['/audit-logs']);
  }

  // Open profile page
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  // Logout
  logout(): void {
    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
