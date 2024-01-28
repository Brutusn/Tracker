import { inject } from "@angular/core";
import { CanActivateFn, CanMatchFn, Router } from "@angular/router";
import { catchError, map, of, tap } from "rxjs";
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

  const accessToken = window.localStorage.getItem("access_token");

  if (!userService.user && !accessToken) {
    router.navigate(["login"]);
    return false;
  } else if (accessToken) {
    return userService.refresh(accessToken).pipe(
      map(() => true),
      catchError(() => of(false)),
      tap((succeeded) => {
        if (!succeeded) router.navigate(["login"]);
      }),
    );
  }

  return true;
};
