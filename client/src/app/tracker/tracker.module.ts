import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ListComponent } from './list/list.component';
import { MapComponent } from './map/map.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { TrackerComponent } from './tracker.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{
      path: '',
      component: TrackerComponent,
    }]),
  ],
  declarations: [
    TrackerComponent,
    SideBarComponent,
    MapComponent,
    ListComponent,
  ],
})
export class TrackerModule { }
