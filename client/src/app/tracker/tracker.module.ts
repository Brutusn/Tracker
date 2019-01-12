import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SideBarComponent } from './side-bar/side-bar.component';
import { MapComponent } from './map/map.component';
import { ListComponent } from './list/list.component';
import { TrackerComponent } from './tracker.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{
      path: '',
      component: TrackerComponent
    }])
  ],
  declarations: [
    TrackerComponent,
    SideBarComponent,
    MapComponent,
    ListComponent
  ]
})
export class TrackerModule { }
