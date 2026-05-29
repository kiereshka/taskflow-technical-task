import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('todo_auth_token');

  const authRequest = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : request;

  return next(authRequest).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('todo_auth_token');
        localStorage.removeItem('todo_auth_email');

        if (!request.url.includes('/api/Auth/login')) {
          router.navigate(['/login'], {
            queryParams: { reason: 'session-expired' },
          });
        }
      }

      return throwError(() => error);
    }),
  );
};
