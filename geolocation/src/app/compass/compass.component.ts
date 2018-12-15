import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import * as geolib from 'geolib';

import { locationArray, Coordinate } from '../../../../shared/route';
import { CompassService } from './compass.service';
import { SocketService } from '../shared/websocket.service';
import { GeoService } from '../shared/geo.service';

@Component({
  selector: 'app-compass',
  templateUrl: './compass.component.html',
  styleUrls: ['./compass.component.css']
})
export class CompassComponent implements OnInit {
  @Input() enable: boolean;

  // These are disaplayed
  public displayDistance = '';
  public codeWord = '';

  // These not.
  private distance = 0;
  private lastHeading = 0;
  private waypoint: number = parseInt(localStorage.getItem('waypoint'), 10) || 0;

  // This is for correcting points.
  private findRadius = 25;
  private compassOffset = 45;
  private cssVar = '--compass-rotation';

  constructor(
    private compass: CompassService,
    private ws: SocketService,
    private geo: GeoService
  ) {
    this.ws.onEvent('route-start').subscribe(() => {
      this.geo.watch().subscribe(({ coords }) => {
        this.handleCoords(coords);
      });
    });
  }

  ngOnInit () {
    this.codeWord = this.compass.decode(locationArray[this.waypoint].code);
  }

  heading (heading) {
    if (heading || heading === 0) {
      this.lastHeading = heading;
    }

    return this.lastHeading;
  }

  changeCompass (bearing: number, heading: number) {
    const deg = bearing - heading + this.compassOffset + 'deg';

    // Not done in angular, but for the moment I don't want to find the correct way.
    document.documentElement.style.setProperty(this.cssVar, deg);
  }

  distanceToGo (distance: number): string {
    const gt = distance > 1000;
    const convert = gt ? geolib.convertUnit('km', distance, 1) : Math.round(distance);
    const suffix = gt ? 'km' : 'm';

    return `${convert} ${suffix}`;
  }

  getWaypoint (waypoint: string | number = 0) {
    const obj = locationArray[parseInt(waypoint as string, 10)];

    if (obj) {
      return obj;
    }

    return locationArray[0];
  }
  setWaypoint (waypoint: string | number = 0) {
    const index = parseInt(waypoint as string, 10);
    const obj = locationArray[waypoint];
    const store = (wp) => {
      this.waypoint = wp;
      localStorage.setItem('waypoint', wp);
    };

    if (!obj) {
      return;
    }

    store(index);
  }
  foundWaypoint (distance: number) {
    if (distance < this.findRadius) {
      // Point found.. whoohoo!
      if ((this.waypoint + 1) < locationArray.length) {
        // Next point is also an object.. so use that one next.
        this.waypoint++;

        this.setWaypoint(this.waypoint);

        this.codeWord = this.compass.decode(locationArray[this.waypoint].code);
      }
    }
  }

  handleCoords (coords) {
    const toLocation = this.getWaypoint(this.waypoint);
    const heading = this.heading(coords.heading);
    const _coords: Coordinate = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    this.distance =  geolib.getDistance(_coords, toLocation.coord, 1, 1);
    const bearing = geolib.getRhumbLineBearing(_coords, toLocation.coord);

    this.displayDistance = this.distanceToGo(this.distance);

    this.changeCompass(bearing, heading);

    // And are we close enough?
    this.foundWaypoint(this.distance);
  }
}
