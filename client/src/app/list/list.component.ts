import { Component, OnInit } from '@angular/core';

import { Position, PositionMapped } from '../shared/position';
import { LocationService } from '../shared/location.service';
import { SocketService } from '../shared/websocket.service';

import { locationArray } from '../../../../shared/route';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  public listData: PositionMapped = {};
  public objectKeys = Object.keys;

  private locations = locationArray.filter((i) => i.skip !== true);
  public totalPost = this.locations.length;

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

  startRouteFor (name: string): void {
    const start = prompt('Vanaf welke post moet er gestart worden?', '0');
    const parsed = parseInt(start, 10);
    const code = this.locations[parsed] ? atob(this.locations[parsed].code).toUpperCase() : 'Onbekend';

    const correct = confirm(`Dat is post: ${code}`);

    if (start && correct && !isNaN(parsed)) {
      this.ws.emit('start-route', {
        name,
        startAt: parsed
      });
    }
  }
}
