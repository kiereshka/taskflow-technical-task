import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [NgIf, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  private readonly authService = inject(AuthService);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
