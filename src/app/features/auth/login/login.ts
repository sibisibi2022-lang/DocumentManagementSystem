import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(Auth);

  email = '';
  password = '';
  message = '';

  login(): void {
    this.message = '';

    if (!this.email.trim() || !this.password) {
      this.message = 'Please enter email and password';
      return;
    }

    this.authService
      .login({
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);

          this.authService.getProfile().subscribe({
            next: (user) => {
              localStorage.setItem('user', JSON.stringify(user));
              localStorage.setItem('role', user.role.toUpperCase());
              window.location.href = '/dashboard';
            },
            error: () => {
              this.message =
                'Login succeeded, but the profile could not be loaded. Please check your account configuration.';
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('role');
            },
          });
        },
        error: () => {
          this.message = 'Invalid email or password';
        },
      });
  }
}
