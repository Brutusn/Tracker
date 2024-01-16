import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";

import { LocationService } from "@shared/location.service";
import { SocketService } from "@shared/websocket.service";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";

import { AuthGuard } from "@shared/auth.guard";
import { ToastComponent } from "@shared/toast/toast.component";
import { ToastService } from "@shared/toast/toast.service";
import { HomeComponent } from "./home/home.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    pathMatch: "full",
  },
  {
    path: "code",
    loadChildren: () =>
      import("./secret-code/secret-code.module").then(
        (m) => m.SecretCodeModule,
      ),
  },
  {
    path: "gps",
    loadChildren: () => import("./gps/gps.module").then((m) => m.GpsModule),
  },
  {
    path: "tracker",
    loadChildren: () =>
      import("./tracker/tracker.module").then((m) => m.TrackerModule),
    canLoad: [AuthGuard],
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "**",
    redirectTo: "/",
  },
];

@NgModule({
  declarations: [AppComponent, LoginComponent, ToastComponent, HomeComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {}),
  ],
  providers: [LocationService, SocketService, ToastService],
  bootstrap: [AppComponent],
})
export class AppModule {}
