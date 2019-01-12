import { Component, OnInit } from '@angular/core';

import { GeoService } from '../../shared/geo.service';
import { SocketService } from '../../shared/websocket.service';

import { NameData } from '../../shared/interfaces';

import { environment } from '../../../environments/environment';

enum TrackingModes {
  NO_TRACKING,
  TRACKING,
  COMPASS
}

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css']
})
export class BodyComponent implements OnInit {

  public serverUrl = environment.ws_url;

  public tracking = TrackingModes['NO_TRACKING'];
  public currentPosition = 'wacht op locatie..';
  public username = window.localStorage.getItem('user-name') || '';
  public error = '';

  // TODO: Get this from the compass..
  public currentPost = 0;

  private access_token = window.localStorage.getItem('access_token') || '';

  constructor(
    private geo: GeoService,
    private ws: SocketService
  ) { }

  ngOnInit() {
  }

  geoError (error: PositionError): void {
    console.error(error);
    this.error = error.message || 'GPS Error';
  }

  start(): void {
    if (this.username.length < 4 || this.username.length > 25) {
      this.error = 'Naam moet tussen de 3 en 25 karakters lang zijn!';
      return;
    } else {
      this.error = '';
    }

    // Init the socket with the given username.
    this.ws.initSocket(true, this.username, this.access_token);

    this.ws.onEvent('final-name').subscribe((data: NameData) => {
      this.handleName(data);
      this.tracking = TrackingModes['TRACKING'];
      this.sendPosition();
    });

    this.ws.onEvent('start-route').subscribe(() => {
      this.tracking = TrackingModes['COMPASS'];
    });
  }

  onEndFound (found: boolean): void {
    if (found) {
      this.tracking = TrackingModes['TRACKING'];
    }
  }

  handleName ({ name, access_token }: NameData): void {
    window.localStorage.setItem('user-name', name);
    window.localStorage.setItem('access_token', access_token);

    this.username = name;
    this.access_token = access_token;
  }

  sendPosition (): void {
    this.geo.watch().subscribe(({ coords }) => {
      this.error = '';
      this.ws.emit('send-position', {
        name: this.username,
        position: [coords.latitude, coords.longitude],
        speed: coords.speed,
        heading: coords.heading,
        post: this.currentPost,
        waypoint: parseInt(localStorage.getItem('waypoint'), 10) || 0,
        gpsStarted: this.tracking === TrackingModes['COMPASS']
      });
    },
    (error) => this.geoError(error));
  }
}
