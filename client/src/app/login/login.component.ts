import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastService } from "@shared/toast/toast.service";
import { UserService } from "@shared/user.service";
import { tap } from "rxjs";
import { GeoService } from "../shared/geo.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly toast = inject(ToastService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly geoService = inject(GeoService);

  protected readonly loginForm = new FormGroup({
    username: new FormControl<string | null>(null, Validators.required),
    pinCode: new FormControl<string | null>(null, Validators.required),
  });

  protected geoStatus = this.geoService.geoPermissionStatus;

  protected login(): void {
    if (this.loginForm.invalid) {
      this.toast.error("Vul een naam en pincode in.");

      return;
    }

    const { username, pinCode } = this.loginForm.value;

    this.userService
      .login(username, pinCode)
      .pipe(tap(() => this.router.navigate(["/gps"])))
      .subscribe({
        error: (error) => this.toast.error(error.error),
      });
  }
}
