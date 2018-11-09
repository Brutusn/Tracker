import { Component, OnInit } from '@angular/core';
import { GeoService } from '../shared/geo.service';
import { SocketService } from '../shared/websocket.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css']
})
export class BodyComponent implements OnInit {

  public tracking = false;
  public currentPosition = 'wacht op locatie..';
  public username = window.localStorage.getItem('user-name') || '';
  public error = '';

  constructor(private geo: GeoService, private ws: SocketService) { }

  ngOnInit() {
  }

  geoError (error) {
    console.error(error);
    this.error = error;
  }

  start() {
    if (this.username.length < 4) {
      this.error = 'Naam moet minimaal 3 karakters lang zijn!';
      return;
    } else {
      this.error = '';
    }

    // Init the socket with the given username.
    this.ws.initSocket(this.username);

    this.ws.onEvent('final-name').subscribe((name) => {
      this.handleName(name);

      console.log('name');

      this.geo.watch().subscribe(({ coords }) => {
        console.log('base location');
        this.error = '';
        this.tracking = true;
      }, 
      (error) => this.geoError(error));

      console.log('go on');
      
      this.displayLocation();
      this.sendPosition();
    });
  }

  handleName (name) {
    window.localStorage.setItem('user-name', name);

    this.username = name;
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
