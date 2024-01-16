import { Injectable } from "@angular/core";
import { Route, Router, UrlSegment } from "@angular/router";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthGuard {
  constructor(private router: Router) {}

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | boolean {
    // It's a basic check.
    if (!window.localStorage.getItem("admin_token")) {
      this.navigateToLogin();
      return false;
    }

    return true;
  }

  private navigateToLogin() {
    this.router.navigate(["login"]);
  }
}
