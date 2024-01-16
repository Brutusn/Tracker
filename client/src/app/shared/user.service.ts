import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

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
    // TODO!
  }
}
