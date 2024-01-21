import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@env/environment";
import { Observable, tap } from "rxjs";

export interface User {
  id: string;
  access_token: string;
  isAdmin: boolean;
  name: string;
}

@Injectable({ providedIn: "root" })
export class UserService {
  private readonly http = inject(HttpClient);

  readonly user: User | null = null;

  login(username: string, pinCode: string): Observable<User> {
    return this.http
      .post<User | null>(environment.ws_url + "/api/login", {
        username,
        pinCode,
      })
      .pipe(
        tap((user) => {
          console.log("user", user);
          window.localStorage.setItem("access_token", user.access_token);
          // @ts-expect-error readonly property.
          this.user = user;
        }),
      );
  }
  logout(id: string): void {
    // Implement
  }
}
