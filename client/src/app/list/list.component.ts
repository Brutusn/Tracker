import { Component, OnInit } from '@angular/core';

import { Position, PositionMapped } from '../shared/position';
import { LocationService } from '../shared/location.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  public listData: PositionMapped = {};
  public objectKeys = Object.keys;

  constructor(private loc: LocationService) {
  }

  private handleError (error) {
    // For now...
    alert(error);
  }

  ngOnInit() {
    // Get all the data once... keep the 
    this.loc.getLocations().subscribe((data: PositionMapped) => {
        this.listData = data;
      }, 
      this.handleError
    );

    this.loc.getNewLocation().subscribe((data: PositionMapped) => {
        this.listData = data;
      }, 
      this.handleError
    );
  }
}
