import { HttpClient } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { environment } from "@env/environment";
import { ToastService } from "@shared/toast/toast.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  private readonly toast = inject(ToastService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  protected readonly loginForm = new FormGroup({
    username: new FormControl<string | null>(null, Validators.required),
    pinCode: new FormControl<string | null>(null, Validators.required),
  });

  protected start(): void {
    if (this.loginForm.invalid) {
      this.toast.error("Vul een naam en pincode in.");

      return;
    }

    this.http
      .post<{
        access_token: string;
      }>(environment.ws_url + "/api/login", this.loginForm.value)
      .subscribe({
        next: ({ access_token }) => {
          window.localStorage.setItem("access_token", access_token);
          this.router.navigate(["/gps"]);
        },
        error: (error) => {
          this.toast.error(error.error);
        },
      });
  }
}
