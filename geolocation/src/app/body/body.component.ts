import { Component, OnInit } from '@angular/core';
import { GeoService } from '../shared/geo.service';
import { SocketService } from '../shared/websocket.service';

import { NameData } from '../shared/interfaces';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css']
})
export class BodyComponent implements OnInit {

  public serverUrl = environment.ws_url;

  public tracking = false;
  public currentPosition = 'wacht op locatie..';
  public username = window.localStorage.getItem('user-name') || '';
  public error = '';

  private access_token = window.localStorage.getItem('access_token') || '';

  constructor(
    private geo: GeoService,
    private ws: SocketService
  ) { }

  ngOnInit() {
  }

  geoError (error: PositionError) {
    console.error(error);
    this.error = error.message || 'GPS Error';
  }

  start() {

    if (this.username.length < 4 || this.username.length > 25) {
      this.error = 'Naam moet tussen de 3 en 25 karakters lang zijn!';
      return;
    } else {
      this.error = '';
    }

    // Init the socket with the given username.
    this.ws.initSocket(this.username, this.access_token);

    this.ws.onEvent('final-name').subscribe((data: NameData) => {
      this.handleName(data);

      this.geo.watch().subscribe(({ coords }) => {
        this.error = '';
        this.tracking = true;
      },
      (error) => this.geoError(error));

      this.sendPosition();
    });
  }

  handleName ({ name, access_token }: NameData): void {
    window.localStorage.setItem('user-name', name);
    window.localStorage.setItem('access_token', access_token);

    this.username = name;
    this.access_token = access_token;
  }

  sendPosition () {
    this.geo.watch().subscribe(({ coords }) => {
      this.error = '';
      this.ws.emit('send-position', {
        name: this.username,
        position: [coords.latitude, coords.longitude],
        speed: coords.speed,
      });
    },
    (error) => this.geoError(error));
  }
}
