import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { LocationService } from '@shared/location.service';
import { SocketService } from '@shared/websocket.service';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';

import { AuthGuard } from '@shared/auth.guard';
import { ToastComponent } from '@shared/toast/toast.component';
import { ToastService } from '@shared/toast/toast.service';

const routes: Routes = [{
    path: '',
    redirectTo: 'gps',
    pathMatch: 'full',
  }, {
    path: 'gps',
    loadChildren: () => import('./gps/gps.module').then((m) => m.GpsModule),
  }, {
    path: 'tracker',
    loadChildren: () => import('./tracker/tracker.module').then((m) => m.TrackerModule),
    canLoad: [AuthGuard],
  }, {
    path: 'login',
    component: LoginComponent,
  }, {
    path: '**',
    redirectTo: 'gps',
  },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ToastComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
  ],
  providers: [
    LocationService,
    SocketService,
    ToastService,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
