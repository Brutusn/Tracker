import { inject } from "@angular/core";
import { CanActivateFn, CanMatchFn, Router } from "@angular/router";
import { UserService } from "./user.service";

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
  const userService = inject(UserService);

  if (!userService.user) {
    router.navigate(["login"]);
    return false;
  }

  return true;
};
