import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GeoService } from '../shared/geo.service';

import { BodyComponent } from './body/body.component';
import { PointerComponent } from './pointer/pointer.component';
import { DisplayOnComponent } from './display-on/display-on.component';
import { CompassComponent } from './compass/compass.component';

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
    PointerComponent,
    CompassComponent,
    DisplayOnComponent
  ],
  providers: [ GeoService ]
})
export class GpsModule { }
