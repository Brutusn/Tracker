import { Component, OnInit, OnDestroy } from '@angular/core';

import { LocationService } from '@shared/location.service';
import { PositionMapped } from '@shared/position';
import { SocketService } from '@shared/websocket.service';

import { locationArray } from '@shared/route';
import { ToastService } from '@shared/toast/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit, OnDestroy {

  listData: PositionMapped = {};
  objectKeys = Object.keys;

  private locations = locationArray.filter((i) => i.skip !== true);
  totalPost = this.locations.length;

  private handleError (error) {
    this.ts.error(error.message || error);
  }

  private readonly onDestroy$ = new Subject<void>();

  constructor (
    private loc: LocationService,
    private ws: SocketService,
    private ts: ToastService,
  ) {
    this.ws.onEvent('user-destroyed').pipe(takeUntil(this.onDestroy$)).subscribe({ next: (name: string) => {
      delete this.listData[name];

      this.ts.success('User deleted from the list.', `Deleted ${name}`);
    }});
    this.ws.onEvent('user-left').pipe(takeUntil(this.onDestroy$)).subscribe({ next: (name: string) => {
      if (this.listData[name]) {
        this.listData[name].online = false;
      }
    }});
    this.ws.onEvent('user-joined').pipe(takeUntil(this.onDestroy$)).subscribe({ next: (name: string) => {
      this.ts.info(`Welcome "${name}"!`, 'User joined!');
    }});
  }

  ngOnInit () {
    // Get all the data once... keep the
    this.loc.getLocations().pipe(takeUntil(this.onDestroy$)).subscribe({
      next: (data: PositionMapped) => {
        this.listData = data;
      },
      error: this.handleError,
    })
    // TODO: Als ik tijd heb dit een keer echt mooi maken, zouden geen subscriptions hoeven te hebben.
    this.loc.getNewLocation().pipe(takeUntil(this.onDestroy$)).subscribe({
      next: (data: PositionMapped) => {
        this.listData = data;
      },
      error: this.handleError,
    })
  }

  ngOnDestroy(): void {
      this.onDestroy$.next();
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
