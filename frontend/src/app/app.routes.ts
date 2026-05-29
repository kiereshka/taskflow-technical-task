import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Tasks } from './features/tasks/tasks';
import { Categories } from './features/categories/categories';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'tasks',
    component: Tasks,
    canActivate: [authGuard],
  },
  {
    path: 'categories',
    component: Categories,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'tasks',
  },
];
