import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = auth.currentUser()?.cargo;
  if (role !== 'ADMIN' && role !== 'SYSADMIN' && role !== 'MODERADOR') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
