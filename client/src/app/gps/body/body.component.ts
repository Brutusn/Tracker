import { Component, OnInit } from '@angular/core';

import { GeoService } from '@shared/geo.service';
import { SocketService } from '@shared/websocket.service';

import { NameData } from '@shared/interfaces';

import { environment } from '@env/environment';
import { ToastService } from '@shared/toast/toast.service';

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

  // TODO: Get this from the compass..
  public currentPost = 0;

  private access_token = window.localStorage.getItem('access_token') || '';

  private prefix = 'Verbindingsfout:';
  private handleConnectError = (error: Error) => {
    console.error(error);

    const parseError = error.toString();

    this.toast.error(`${this.prefix} ${error.message || parseError}`);
  }

  constructor(
    private geo: GeoService,
    private ws: SocketService,
    private toast: ToastService
  ) {
    this.ws.socketAnnounced.subscribe(() => {
      this.ws.onEvent('error').subscribe(this.handleConnectError);
      this.ws.onEvent('connect_error').subscribe(this.handleConnectError);
      this.ws.onEvent('disconnect').subscribe((reason) => {
        this.toast.error(`${this.prefix} ${reason}`);
      });

      this.ws.onEvent('growl').subscribe((msg) => {
        console.warn('GROWL:', msg);
        this.toast.normal(`Server message: ${msg}`);
      });
      this.ws.onEvent('connect').subscribe(() => {
        this.toast.info('Connection success');
      });
    });
  }

  ngOnInit() {

  }

  geoError (error: PositionError): void {
    console.error(error);
    this.toast.error(error.message || 'GPS Error');
  }

  start(): void {
    if (this.username.length < 4 || this.username.length > 25) {
      this.toast.error('Naam moet tussen de 3 en 25 karakters lang zijn!');
      return;
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
