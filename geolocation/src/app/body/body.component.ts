import { Component, OnInit } from '@angular/core';
import { GeoService } from '../shared/geo.service';
import { SocketService } from '../shared/websocket.service';
import { Observable } from 'rxjs';

import { nameData } from '../shared/interfaces';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css']
})
export class BodyComponent implements OnInit {

  public tracking = false;
  public currentPosition = 'wacht op locatie..';
  public username = window.localStorage.getItem('user-name') || '';
  private access_token = window.localStorage.getItem('access_token') || '';
  public error = '';

  constructor(private geo: GeoService, private ws: SocketService) { }

  ngOnInit() {
  }

  geoError (error: PositionError) {
    console.error(error);
    this.error = error.message;
  }

  start() {
    if (this.username.length < 4) {
      this.error = 'Naam moet minimaal 3 karakters lang zijn!';
      return;
    } else {
      this.error = '';
    }

    // Init the socket with the given username.
    this.ws.initSocket(this.username, this.access_token);

    this.ws.onEvent('final-name').subscribe((data: nameData) => {
      this.handleName(data);

      this.geo.watch().subscribe(({ coords }) => {
        this.error = '';
        this.tracking = true;
      }, 
      (error) => this.geoError(error));
      
      this.displayLocation();
      this.sendPosition();
    });

    // Hacky thing.. but for now this is okay(-ish)
    this.ws.onEvent('connect_error').subscribe((error: Error) => {
      console.error(error);
      this.error = error.message;
    });

    this.ws.onEvent('growl').subscribe((msg) => {
      console.warn('GROWL:', msg);
      this.error = msg;
    });
  }

  handleName ({ name, access_token }: nameData): void {
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
      });
    }, 
    (error) => this.geoError(error));
  }

  displayLocation () {
    this.geo.watch().subscribe(({ coords }) => {
      this.error = '';
      this.currentPosition = `lat: ${coords.latitude}, lng: ${coords.longitude}`;
    }, 
    (error) => this.geoError(error));
  }

}
