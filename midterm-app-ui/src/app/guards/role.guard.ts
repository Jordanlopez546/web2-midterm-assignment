import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const currentUser = authService.currentUserValue;
  
  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as string[];
  const requiredPermissions = route.data['permissions'] as string[];

  // Check roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(currentUser.role.name);
    if (!hasRole) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  // Check permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      currentUser.role.permissions.includes(permission)
    );
    if (!hasAllPermissions) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};