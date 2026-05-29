import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  submit(): void {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';

    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage = 'Enter a valid email address.';
      return;
    }

    if (password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;

    this.authService
      .register({
        email,
        password,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed.';
          this.cdr.markForCheck();
        },
      });
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
