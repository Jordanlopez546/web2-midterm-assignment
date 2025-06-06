import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UsersListComponent } from './components/users/users-list.component';
import { UserDetailComponent } from './components/users/user-detail.component';
import { RolesListComponent } from './components/roles/roles-list.component';
import { MainLayoutComponent } from './components/layout/main-layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', component: UsersListComponent },
          { path: ':id', component: UserDetailComponent }
        ]
      },
      {
        path: 'roles',
        component: RolesListComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },
  
  { path: '**', redirectTo: '/dashboard' }
];