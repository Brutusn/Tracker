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

      this.geo.watchPosition().subscribe(({ coords }) => {
        this.tracking = true;
      });
      
      this.displayLocation();
      this.sendPosition();
    });
  }

  handleName (name) {
    window.localStorage.setItem('user-name', name);

    this.username = name;
  }

  sendPosition () {
    this.geo.watchPosition().subscribe(({ coords }) => {
      this.ws.emit('send-position', {
        name: this.username,
        position: [coords.latitude, coords.longitude],
      });
    });
  }

  displayLocation () {
    this.geo.watchPosition().subscribe(({ coords }) => {
      this.currentPosition = `lat: ${coords.latitude}, lng: ${coords.longitude}`;
    });
  }

}
