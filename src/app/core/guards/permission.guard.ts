import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factory that builds a CanActivateFn restricting a route to a specific
 * teacher permission. Admin/staff always pass. A teacher without the
 * matching permission is redirected to the dashboard instead of seeing
 * the page (defense in depth alongside the hidden sidebar links).
 */
export function permissionGuard(
  permission: 'canAttendance' | 'canAssignment' | 'canExam' | 'canResult' | 'canStudent'
): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    if (auth.can(permission)) return true;
    return inject(Router).createUrlTree(['/dashboard']);
  };
}

/** Restricts a route to admin/staff only — teachers are redirected away. */
export const staffOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isTeacher()) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};