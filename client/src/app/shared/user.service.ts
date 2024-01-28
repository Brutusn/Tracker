import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@env/environment";
import { Observable, tap } from "rxjs";
import { UserDto } from "../../../../models/src/user";

@Injectable({ providedIn: "root" })
export class UserService {
  private readonly http = inject(HttpClient);

  readonly user: UserDto | null = null;

  login(username: string, pinCode: string): Observable<UserDto> {
    return this.http
      .post<UserDto>(environment.ws_url + "/api/login", {
        username,
        pinCode,
      })
      .pipe(
        tap((user) => {
          console.log("User logged in", user);
          window.localStorage.setItem("access_token", user.access_token);
          // @ts-expect-error readonly property.
          this.user = user;
        }),
      );
  }

  refresh(access_token: string): Observable<UserDto> {
    return this.http
      .post<UserDto>(environment.ws_url + "/api/user-refresh", {
        access_token,
      })
      .pipe(
        tap((user) => {
          console.log("Refreshed user", user);
          // @ts-expect-error readonly property.
          this.user = user;
        }),
      );
  }
  logout(id: string): void {
    // Implement
  }
}
