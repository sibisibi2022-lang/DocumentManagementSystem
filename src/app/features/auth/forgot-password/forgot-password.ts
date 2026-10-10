import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PasswordResetService } from '../../../core/services/password-reset';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private passwordResetService = inject(PasswordResetService);

  email = '';
  message = '';
  error = '';
  loading = false;

  requestReset(): void {
    this.message = '';
    this.error = '';

    if (!this.email.trim()) {
      this.error = 'Please enter your registered email address.';
      return;
    }

    this.loading = true;

    this.passwordResetService.requestReset(this.email.trim()).subscribe({
      next: (response) => {
        this.message = response.message;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to process the request. Please try again later.';
        this.loading = false;
      },
    });
  }
}
