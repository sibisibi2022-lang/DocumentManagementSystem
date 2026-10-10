import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { finalize } from 'rxjs';

import { Router } from '@angular/router';

import { CategoryService, Category } from '../../core/services/category';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  private categoryService = inject(CategoryService);

  private authService = inject(Auth);

  private router = inject(Router);

  private changeDetector = inject(ChangeDetectorRef);

  categories: Category[] = [];

  name: string = '';

  description: string = '';

  editing: boolean = false;

  editingId: number = 0;

  loading: boolean = false;

  saving: boolean = false;

  message: string = '';

  error: string = '';

  canManageCategories: boolean = false;

  ngOnInit(): void {
    const role = this.authService.getRole();

    console.log('Current user role:', role);

    if (role !== 'ADMIN' && role !== 'MANAGER') {
      console.log('User is not allowed to manage categories');

      this.router.navigate(['/dashboard']);

      return;
    }

    this.canManageCategories = true;

    this.changeDetector.detectChanges();

    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;

    this.error = '';

    this.changeDetector.detectChanges();

    this.categoryService
      .getCategories()
      .pipe(
        finalize(() => {
          this.loading = false;

          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (response: Category[]) => {
          console.log('Categories received:', response);

          this.categories = [...response];

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error('Failed to load categories:', error);

          this.error = 'Failed to load categories';

          this.changeDetector.detectChanges();
        },
      });
  }

  createCategory(): void {
    if (!this.canManageCategories) {
      return;
    }

    if (this.saving) {
      return;
    }

    if (!this.name.trim()) {
      this.error = 'Category name is required';

      this.message = '';

      this.changeDetector.detectChanges();

      return;
    }

    this.saving = true;

    this.message = '';

    this.error = '';

    this.changeDetector.detectChanges();

    const category: Category = {
      id: 0,

      name: this.name.trim(),

      description: this.description.trim(),
    };

    console.log('Creating category:', category);

    this.categoryService
      .createCategory(category)
      .pipe(
        finalize(() => {
          this.saving = false;

          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (response: Category) => {
          console.log('Category created:', response);

          // Add new category immediately
          this.categories = [...this.categories, response];

          // Show success message
          this.message = 'Category created successfully';

          this.error = '';

          // Clear form
          this.clearForm();

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error('Create category failed:', error);

          if (typeof error.error === 'string') {
            this.error = error.error;
          } else if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Failed to create category';
          }

          this.message = '';

          this.changeDetector.detectChanges();
        },
      });
  }

  editCategory(category: Category): void {
    if (!this.canManageCategories) {
      return;
    }

    console.log('Editing category:', category);

    this.editing = true;

    this.editingId = category.id;

    this.name = category.name;

    this.description = category.description || '';

    this.message = '';

    this.error = '';

    this.changeDetector.detectChanges();
  }

  updateCategory(): void {
    if (!this.canManageCategories) {
      return;
    }

    if (this.saving) {
      return;
    }

    if (!this.name.trim()) {
      this.error = 'Category name is required';

      this.message = '';

      this.changeDetector.detectChanges();

      return;
    }

    this.saving = true;

    this.message = '';

    this.error = '';

    this.changeDetector.detectChanges();

    const category: Category = {
      id: this.editingId,

      name: this.name.trim(),

      description: this.description.trim(),
    };

    console.log('Updating category:', category);

    this.categoryService
      .updateCategory(this.editingId, category)
      .pipe(
        finalize(() => {
          this.saving = false;

          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (response: Category) => {
          console.log('Category updated:', response);

          const index = this.categories.findIndex(
            (existingCategory) => existingCategory.id === response.id,
          );

          if (index !== -1) {
            this.categories[index] = {
              ...response,
            };

            this.categories = [...this.categories];
          }

          this.message = 'Category updated successfully';

          this.error = '';

          this.editing = false;

          this.editingId = 0;

          this.clearForm();

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error('Update category failed:', error);

          if (typeof error.error === 'string') {
            this.error = error.error;
          } else if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Failed to update category';
          }

          this.message = '';

          this.changeDetector.detectChanges();
        },
      });
  }

  cancelEdit(): void {
    this.editing = false;

    this.editingId = 0;

    this.clearForm();

    this.message = '';

    this.error = '';

    this.changeDetector.detectChanges();
  }

  clearForm(): void {
    this.name = '';

    this.description = '';

    this.changeDetector.detectChanges();
  }

  deleteCategory(id: number): void {
    if (!this.canManageCategories) {
      return;
    }

    if (this.saving) {
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this category?');

    if (!confirmed) {
      return;
    }

    this.message = '';

    this.error = '';

    this.saving = true;

    this.changeDetector.detectChanges();

    console.log('Deleting category:', id);

    this.categoryService
      .deleteCategory(id)
      .pipe(
        finalize(() => {
          this.saving = false;

          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          console.log('Category deleted:', id);

          this.categories = this.categories.filter((category) => category.id !== id);

          this.message = 'Category deleted successfully';

          this.error = '';

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error('Delete category failed:', error);

          if (typeof error.error === 'string') {
            this.error = error.error;
          } else if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Failed to delete category';
          }

          this.message = '';

          this.changeDetector.detectChanges();
        },
      });
  }
}
