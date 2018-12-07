import { Component, OnInit } from '@angular/core';

import { Position, PositionMapped } from '../shared/position';
import { LocationService } from '../shared/location.service';
import { SocketService } from '../shared/websocket.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  public listData: PositionMapped = {};
  public objectKeys = Object.keys;

  private handleError (error) {
    // For now...
    alert(error);
  }

  constructor(private loc: LocationService, private ws: SocketService) {
    this.ws.onEvent('user-destroyed').subscribe((name: string) => {
      delete this.listData[name];
    });
    this.ws.onEvent('user-left').subscribe((name: string) => {
      if (this.listData[name]) {
        this.listData[name].online = false;
      }
    });
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

  removeOffline (name: string): void {
    const del = confirm('You sure mate?!');

    if (del) {
      this.ws.emit('user-destroy', name);
    }
  }
}
