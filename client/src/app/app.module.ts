import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LocationService } from './shared/location.service';
import { SocketService } from './shared/websocket.service';
import { LoginComponent } from './login/login.component';

import { ToastComponent } from './shared/toast/toast.component';
import { ToastService } from './shared/toast/toast.service';

const routes: Routes = [{
    path: '',
    redirectTo: 'gps',
    pathMatch: 'full'
  }, {
    path: 'gps',
    loadChildren: './gps/gps.module#GpsModule'
  }, {
    path: 'tracker',
    loadChildren: './tracker/tracker.module#TrackerModule'
  }, {
    path: 'login',
    component: LoginComponent
  }, {
    path: '**',
    redirectTo: 'gps'
  }
];


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    LocationService,
    SocketService,
    ToastService
  ],
  bootstrap: [
    AppComponent,
    ToastComponent
  ]
})
export class AppModule { }
