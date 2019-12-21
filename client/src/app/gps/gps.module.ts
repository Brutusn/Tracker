import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GeoService } from '@shared/geo.service';

import { BodyComponent } from './body/body.component';
import { CompassComponent } from './compass/compass.component';
import { DisplayOnComponent } from './display-on/display-on.component';
import { GpsMapComponent } from './gps-map/gps-map.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{
      path: '',
      component: BodyComponent,
    }]),
  ],
  declarations: [
    BodyComponent,
    CompassComponent,
    DisplayOnComponent,
    GpsMapComponent,
  ],
  providers: [ GeoService ],
})
export class GpsModule { }
