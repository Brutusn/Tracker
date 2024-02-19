import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";

import { LocationService } from "@shared/location.service";
import { SocketService } from "@shared/websocket.service";
import { AdminLoginComponent } from "./admin-login/admin-login.component";
import { AppComponent } from "./app.component";

import { CommonModule } from "@angular/common";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { AdminAuthGuardFn, AuthGuardFn } from "@shared/auth.guard";
import { ToastComponent } from "@shared/toast/toast.component";
import { ToastService } from "@shared/toast/toast.service";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    pathMatch: "full",
  },
  // {
  //   path: "code",
  //   loadChildren: () =>
  //     import("./secret-code/secret-code.module").then(
  //       (m) => m.SecretCodeModule,
  //     ),
  // },
  {
    path: "gps",
    loadChildren: () => import("./gps/gps.module").then((m) => m.GpsModule),
    canMatch: [AuthGuardFn],
  },
  {
    path: "tracker",
    loadChildren: () =>
      import("./tracker/tracker.module").then((m) => m.TrackerModule),
    canMatch: [AdminAuthGuardFn],
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "admin-login",
    component: AdminLoginComponent,
  },
  {
    path: "**",
    redirectTo: "/",
  },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminLoginComponent,
    ToastComponent,
    HomeComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {}),
    MatIconModule,
  ],
  providers: [
    LocationService,
    SocketService,
    ToastService,
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
