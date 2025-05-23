// src/app/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // ✅ معاه توكن، يدخل عادي
  } else {
    router.navigate(['/login']); // ❌ مفيش توكن، نرجعه لـ login
    return false;
  }
};
