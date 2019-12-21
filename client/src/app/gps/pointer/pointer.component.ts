import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import * as geolib from 'geolib';

import { GeoService } from '@shared/geo.service';
import { Coordinate, locationArray, Route } from '@shared/route';
import { SocketService } from '@shared/websocket.service';
import { PointerService } from './pointer.service';

@Component({
  selector: 'app-pointer',
  templateUrl: './pointer.component.html',
  styleUrls: ['./pointer.component.css'],
})
export class PointerComponent implements OnInit {
  @Input() enable: boolean;
  @Output() endFound = new EventEmitter<boolean>();

  // These are disaplayed
  displayDistance = '0 km';
  codeWord = '';

  // These not.
  private distance = 0;
  private lastHeading = 0;
  private waypoint: number = parseInt(localStorage.getItem('waypoint'), 10) || 0;

  // This is for correcting points.
  private findRadius = 25;
  private compassOffset = 45;
  private cssVar = '--compass-rotation';

  // Locations minus starting point.
  private locations = locationArray.filter((i: Route) => i.skip !== true);

  constructor (
    private compass: PointerService,
    private ws: SocketService,
    private geo: GeoService,
  ) {
    this.ws.socketAnnounced.subscribe(() => {
      this.ws.onEvent('start-route').subscribe((start: number) => {
        this.setWaypoint(start);
        this.codeWord = this.compass.decode(this.locations[this.waypoint].code);

        this.geo.watch().subscribe(({ coords }) => {
          this.handleCoords(coords);
        });
      });
    });
  }

  ngOnInit () {
    this.codeWord = this.compass.decode(this.locations[this.waypoint].code);
  }

  heading (heading: number) {
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
    const convert = gt ? geolib.convertDistance(distance, 'km') : Math.round(distance);
    const suffix = gt ? 'km' : 'm';

    return `${convert} ${suffix}`;
  }

  getWaypoint (waypoint: string | number = 0) {
    const obj = this.locations[parseInt(waypoint as string, 10)];

    if (obj) {
      return obj;
    }

    return this.locations[0];
  }
  setWaypoint (waypoint: string | number = 0) {
    const index = parseInt(waypoint as string, 10);
    const obj = this.locations[waypoint];
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
      if ((this.waypoint + 1) === this.locations.length) {
        // Endpoint is found!
        this.setWaypoint(this.waypoint + 1);
        this.endFound.emit(true);
      }

      if ((this.waypoint + 1) < this.locations.length) {
        // Next point is also an object.. so use that one next.
        this.waypoint++;

        this.setWaypoint(this.waypoint);

        this.codeWord = this.compass.decode(this.locations[this.waypoint].code);
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

    this.distance =  geolib.getDistance(_coords, toLocation.coord, 1);
    const bearing = geolib.getRhumbLineBearing(_coords, toLocation.coord);

    this.displayDistance = this.distanceToGo(this.distance);

    this.changeCompass(bearing, heading);

    // And are we close enough?
    this.foundWaypoint(this.distance);
  }
}
