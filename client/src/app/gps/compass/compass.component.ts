import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { getDistance } from 'geolib';

import { GeoService } from '@shared/geo.service';
import { Coordinate, Route, postArray } from '@shared/route';
import { SocketService } from '@shared/websocket.service';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-compass',
  templateUrl: './compass.component.html',
  styleUrls: ['./compass.component.css'],
})
export class CompassComponent implements OnInit, OnDestroy {
  @Input() readonly inGameMode: boolean = false;

  private lastHeading = 0;
  private readonly cssVar = '--rotation';

  private readonly triggerDistance = 50; // Meter
  private triggerLocation: Route = postArray.find((post) => post.code === 'Kruising');

  private readonly subscriptions = new Subscription();

  constructor (
    private geo: GeoService,
    private ws: SocketService,
  ) { }

  ngOnInit () {
    const geoSubscription = this.geo.watch()
      .pipe(
        filter(() => !this.inGameMode),
        tap(({ coords }) => {
          this.handleCoords(coords);
          this.checkForRouteStart(coords);
        }),
      )
      .subscribe();

    this.subscriptions.add(geoSubscription);
  }
  ngOnDestroy () {
    this.subscriptions.unsubscribe();
  }

  private handleCoords ({ heading }: any) {
    if (heading || heading === 0) {
      this.lastHeading = heading;
    }

    document.documentElement.style.setProperty(this.cssVar, `-${this.lastHeading}deg`);
  }

  private checkForRouteStart (coords: Coordinate) {
    const _coords: Coordinate = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    const distance = getDistance(_coords, this.triggerLocation.coord);

    if (distance < this.triggerDistance) {
      // Send emit message now.
      setTimeout(() => this.ws.emit('user-in-reach', { distance }), 5000);
    }
  }
}
