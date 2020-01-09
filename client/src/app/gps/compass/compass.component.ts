import { Component, OnInit } from '@angular/core';
import { getDistance } from 'geolib';

import { GeoService } from '@shared/geo.service';
import { Coordinate, locationArray, Route } from '@shared/route';
import { SocketService } from '@shared/websocket.service';

@Component({
  selector: 'app-compass',
  templateUrl: './compass.component.html',
  styleUrls: ['./compass.component.css'],
})
export class CompassComponent implements OnInit {
  private lastHeading = 0;
  private readonly cssVar = '--rotation';

  private readonly triggerDistance = 50; // Meter
  private triggerLocation: Route = locationArray[0];

  constructor (
    private geo: GeoService,
    private ws: SocketService,
  ) { }

  ngOnInit () {
    this.geo.watch().subscribe(({ coords }) => {
      this.handleCoords(coords);
      this.checkForRouteStart(coords);
    });
  }

  private handleCoords ({ heading }: any) {
    if (heading || heading === 0) {
      this.lastHeading = heading;
    }

    document.documentElement.style.setProperty(this.cssVar, `-${this.lastHeading}deg`);
  }

  private checkForRouteStart (coords: Coordinates) {
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
