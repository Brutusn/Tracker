import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ToastService } from "@shared/toast/toast.service";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-admin-login",
  templateUrl: "./admin-login.component.html",
  styleUrls: ["./admin-login.component.css"],
})
export class AdminLoginComponent {
  protected readonly form = new FormGroup({
    password: new FormControl<string | null>(null, Validators.required),
  });

  constructor(
    private ts: ToastService,
    private http: HttpClient,
    private router: Router,
  ) {}

  onSubmit() {
    if (!this.form.valid) {
      this.ts.error("Enter a password!");
    }

    this.ts.normal("Logging in..");

    this.http
      .post(
        environment.ws_url + "/api/login",
        {
          password: this.form.value.password!,
        },
        {
          headers: { Authorization: `Bearer ${environment.ws_key}` },
        },
      )
      .subscribe({
        next: (response) => this.handleSuccess(response),
        error: (error) => this.handleError(error),
      });
  }

  private handleSuccess(response) {
    window.localStorage.setItem("admin_token", response.admin_token);

    this.ts.success("Loggin success!");
    this.router.navigate(["tracker"]);
  }

  private handleError(error) {
    console.error(error);
    this.ts.error(error.error || error);
  }
}
