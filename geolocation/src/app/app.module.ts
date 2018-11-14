import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { BodyComponent } from './body/body.component';

import { SocketService } from './shared/websocket.service';
import { GeoService } from './shared/geo.service';
import { ErrorComponent } from './error/error.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    BodyComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [GeoService, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
