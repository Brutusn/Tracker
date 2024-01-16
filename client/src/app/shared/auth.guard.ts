import { inject } from "@angular/core";
import { CanActivateFn, CanMatchFn, Router } from "@angular/router";

export const AdminAuthGuardFn: CanActivateFn | CanMatchFn = () => {
  const router = inject(Router);

  if (!window.localStorage.getItem("admin_token")) {
    router.navigate(["admin-login"]);
    return false;
  }

  return true;
};

export const AuthGuardFn: CanActivateFn | CanMatchFn = () => {
  const router = inject(Router);

  if (!window.localStorage.getItem("access_token")) {
    router.navigate(["login"]);
    return false;
  }

  return true;
};
