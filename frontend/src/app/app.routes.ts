import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Tasks } from './features/tasks/tasks';
import { Categories } from './features/categories/categories';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'tasks',
    component: Tasks,
  },
  {
    path: 'categories',
    component: Categories,
  },
  {
    path: '**',
    redirectTo: 'tasks',
  },
];
