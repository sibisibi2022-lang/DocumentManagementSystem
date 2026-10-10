import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PasswordResetService } from '../../../core/services/password-reset';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private passwordResetService = inject(PasswordResetService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';
  newPassword = '';
  confirmPassword = '';
  message = '';
  error = '';
  loading = false;

  constructor() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.token) {
      this.error = 'The reset link is missing its token. Please request a new link.';
    }
  }

  resetPassword(): void {
    this.message = '';
    this.error = '';

    if (!this.token) {
      this.error = 'Please request a new password reset link.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.error = 'Password must contain at least 8 characters.';
      return;
    }

    if (this.newPassword.length > 72) {
      this.error = 'Password must not exceed 72 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.passwordResetService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.message = response.message;
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        this.error =
          error?.error?.message ??
          'The reset link is invalid or expired. Please request a new link.';
        this.loading = false;
      },
    });
  }
}
