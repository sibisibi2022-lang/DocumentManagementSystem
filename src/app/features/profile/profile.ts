import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { UserService, User } from '../../core/services/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private userService = inject(UserService);

  private router = inject(Router);

  private cdr = inject(ChangeDetectorRef);

  user: User | null = null;

  loading = true;

  error = '';

  message = '';

  editing = false;

  name = '';

  email = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;

    this.error = '';

    this.userService.getProfile().subscribe({
      next: (data) => {
        console.log('Profile received:', data);

        this.user = data;

        this.name = data.name;

        this.email = data.email;

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load profile:', error);

        this.error = 'Unable to load profile';

        this.loading = false;

        this.cdr.detectChanges();
      },
    });
  }

  editProfile(): void {
    if (!this.user) {
      return;
    }

    this.name = this.user.name;

    this.email = this.user.email;

    this.message = '';

    this.error = '';

    this.editing = true;
  }

  cancelEdit(): void {
    if (this.user) {
      this.name = this.user.name;

      this.email = this.user.email;
    }

    this.message = '';

    this.error = '';

    this.editing = false;
  }

  saveProfile(): void {
    if (!this.user) {
      return;
    }

    if (!this.name.trim()) {
      this.error = 'Name cannot be empty';

      return;
    }

    if (!this.email.trim()) {
      this.error = 'Email cannot be empty';

      return;
    }

    const updatedUser: User = {
      id: this.user.id,

      name: this.name.trim(),

      email: this.email.trim(),

      role: this.user.role,
    };

    this.userService.updateProfile(updatedUser).subscribe({
      next: (data) => {
        this.user = data;

        this.name = data.name;

        this.email = data.email;

        this.editing = false;

        this.error = '';

        this.message = 'Profile updated successfully!';

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Profile update failed:', error);

        this.error = 'Unable to update profile';

        this.cdr.detectChanges();
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToDocuments(): void {
    this.router.navigate(['/documents']);
  }

  logout(): void {
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
  }
}
