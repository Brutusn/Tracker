import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponentComponent } from './header-component/header-component.component';
import { MapComponent } from './map/map.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ListComponent } from './list/list.component';
import { LocationService } from './shared/location.service';
import { SocketService } from './shared/websocket.service';
import { HideOffLineComponent } from './hide-off-line/hide-off-line.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponentComponent,
    MapComponent,
    SideBarComponent,
    ListComponent,
    HideOffLineComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [LocationService, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
