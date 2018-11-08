import { Injectable } from '@angular/core';
import { SocketService } from './websocket.service';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  private geo;
  private watcher;

  constructor(private ws: SocketService) { 
    this.init();
  }

  init () {
    if ('geolocation' in navigator) {
      this.geo = navigator.geolocation;
    } else {
      alert('Geolocation not available.');
    }
  }

  watchPosition ():Observable<any> {
    return new Observable<object>((observer) => {
      this.watcher = this.geo.watchPosition((position) => {
        return observer.next(position);
      });
    });
  }
}
