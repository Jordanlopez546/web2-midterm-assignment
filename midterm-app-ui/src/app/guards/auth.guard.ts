import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const currentUser = authService.currentUserValue;
  
  if (currentUser) {
    if (route.data['roles'] && route.data['roles'].length > 0) {
      const hasRequiredRole = route.data['roles'].includes(currentUser.role.name);
      
      if (!hasRequiredRole) {
        router.navigate(['/dashboard']);
        return false;
      }
    }
    
    return true;
  }

  // Not logged in, redirect to login page
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};