import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponentComponent } from './header-component/header-component.component';
import { MapComponent } from './map/map.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ListComponent } from './list/list.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponentComponent,
    MapComponent,
    SideBarComponent,
    ListComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
