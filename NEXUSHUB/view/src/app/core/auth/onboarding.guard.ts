import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const onboardingGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (user && !user.onboardingCompleted) {
    router.navigate(['/onboarding']);
    return false;
  }
  return true;
};
