import { Component, OnInit } from '@angular/core';

import { LocationService } from '@shared/location.service';
import { Position, PositionMapped } from '@shared/position';
import { SocketService } from '@shared/websocket.service';

import { locationArray } from '@shared/route';
import { ToastService } from '@shared/toast/toast.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {

  listData: PositionMapped = {};
  objectKeys = Object.keys;

  private locations = locationArray.filter((i) => i.skip !== true);
  totalPost = this.locations.length;

  private handleError (error) {
    this.ts.error(error.message || error);
  }

  constructor (
    private loc: LocationService,
    private ws: SocketService,
    private ts: ToastService,
  ) {
    this.ws.onEvent('user-destroyed').subscribe((name: string) => {
      delete this.listData[name];

      this.ts.success('User deleted from the list.', `Deleted ${name}`);
    });
    this.ws.onEvent('user-left').subscribe((name: string) => {
      if (this.listData[name]) {
        this.listData[name].online = false;
      }
    });
    this.ws.onEvent('user-joined').subscribe((name: string) => {
      this.ts.info(`Welcome "${name}"!`, 'User joined!');
    });
  }

  ngOnInit () {
    // Get all the data once... keep the
    this.loc.getLocations().subscribe((data: PositionMapped) => {
        this.listData = data;
      },
      this.handleError,
    );

    this.loc.getNewLocation().subscribe((data: PositionMapped) => {
        this.listData = data;
      },
      this.handleError,
    );
  }

  removeOffline (name: string, event?: Event): void {
    const del = confirm(`Deleting ${name}.. You sure mate?!`);

    if (event) {
      event.preventDefault();
    }

    if (del) {
      this.ws.emit('user-destroy', name);
    }
  }

  startRouteFor (name: string): void {
    const start = prompt('Vanaf welke post moet er gestart worden?', '0');
    const parsed = parseInt(start, 10);

    if (!start || isNaN(parsed)) {
      return;
    }

    const code = this.locations[parsed] ? this.locations[parsed].code.toUpperCase() : 'Onbekend';
    const correct = confirm(`Dat is post: ${code}`);

    if (correct) {
      this.ws.emit('start-route', {
        name,
        startAt: parsed,
      });
    }
  }
}
