import { Component, OnDestroy } from '@angular/core';

import { GeoService } from '@shared/geo.service';
import { SocketService } from '@shared/websocket.service';

import { NameData } from '@shared/interfaces';

import { environment } from '@env/environment';
import { ToastService } from '@shared/toast/toast.service';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

enum TrackingModes {
  NO_TRACKING,
  TRACKING,
  COMPASS,
}

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
})
export class BodyComponent implements OnDestroy {

  serverUrl = environment.ws_url;

  trackingModes = TrackingModes;
  tracking: TrackingModes = TrackingModes.NO_TRACKING;
  currentPosition = 'wacht op locatie..';
  readonly username = new FormControl(window.localStorage.getItem('user-name') ?? '');

  // TODO: Get this from the compass..
  currentPost = 0;

  private access_token = window.localStorage.getItem('access_token') ?? '';

  private prefix = 'Verbindingsfout:';
  private handleConnectError = (error: Error) => {
    console.error(error);

    const parseError = error.toString();

    this.toast.error(`${this.prefix} ${error.message ?? parseError}`);
  }

  private readonly onDestroy$ = new Subject<void>();

  constructor (
    private geo: GeoService,
    private ws: SocketService,
    private toast: ToastService,
  ) {
      this.ws.onEvent('error').pipe(takeUntil(this.onDestroy$)).subscribe(this.handleConnectError);
      this.ws.onEvent('connect_error').pipe(takeUntil(this.onDestroy$)).subscribe(this.handleConnectError);
      this.ws.onEvent('disconnect').pipe(takeUntil(this.onDestroy$)).subscribe((reason) => {
        this.toast.error(`${this.prefix} ${reason}`);
      });

      this.ws.onEvent('growl').pipe(takeUntil(this.onDestroy$)).subscribe((msg) => {
        console.warn('GROWL:', msg);
        this.toast.normal(`Server message: ${msg}`);
      });
      this.ws.onEvent('connect').pipe(takeUntil(this.onDestroy$)).subscribe(() => {
        this.toast.info('Connection success');
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  geoError (error: Error): void {
    console.error(error);
    this.toast.error(error.message || 'GPS Error');
  }

  start (): void {
    if (this.username.value.length < 4 || this.username.value.length > 25) {
      this.toast.error('Naam moet tussen de 3 en 25 karakters lang zijn!');
      return;
    }

    // Init the socket with the given username.
    this.ws.initSocket(true, this.username.value, this.access_token);

    this.ws.onEvent('final-name').pipe(takeUntil(this.onDestroy$)).subscribe((data: NameData) => {
      this.handleName(data);
      this.tracking = TrackingModes.TRACKING;
      this.sendPosition();
    });

    this.ws.onEvent('start-route').pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.tracking = TrackingModes.COMPASS;
    });
  }

  onEndFound (found: boolean): void {
    if (found) {
      this.tracking = TrackingModes.TRACKING;
    }
  }

  handleName ({ name, access_token }: NameData): void {
    window.localStorage.setItem('user-name', name);
    window.localStorage.setItem('access_token', access_token);

    this.username.setValue(name);
    this.access_token = access_token;
  }

  sendPosition (): void {
    this.geo.watch().pipe(takeUntil(this.onDestroy$)).subscribe({
      next: ({ coords }) => {
        this.ws.emit('send-position', {
          name: this.username.value,
          position: [coords.latitude, coords.longitude],
          speed: coords.speed,
          heading: coords.heading,
          post: this.currentPost,
          waypoint: parseInt(localStorage.getItem('waypoint'), 10) || 0,
          gpsStarted: this.tracking === TrackingModes.COMPASS,
        });
      },
      error: (error) => this.geoError(error),
    });
  }
}
