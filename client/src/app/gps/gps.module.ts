import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GeoService } from '../shared/geo.service';
import { RouterModule } from '@angular/router';
import { BodyComponent } from './body/body.component';
import { CompassComponent } from './compass/compass.component';
import { ErrorComponent } from './error/error.component';
import { DisplayOnComponent } from './display-on/display-on.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{
      path: '',
      component: BodyComponent
    }])
  ],
  declarations: [
    BodyComponent,
    CompassComponent,
    ErrorComponent,
    DisplayOnComponent
  ],
  providers: [ GeoService ]
})
export class GpsModule { }
