import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  errorMessage = '';
  infoMessage = '';
  isLoading = false;

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'auth-required') {
      this.infoMessage = 'Please sign in to continue.';
    }

    if (reason === 'session-expired') {
      this.infoMessage = 'Your session expired. Please sign in again.';
    }
  }

  submit(): void {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';

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

    this.isLoading = true;

    this.authService
      .login({
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
          this.errorMessage = error.error?.message || 'Login failed.';
          this.cdr.markForCheck();
        },
      });
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
