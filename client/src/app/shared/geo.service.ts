import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class GeoService {

  private geoOpts = {
    enableHighAccuracy: true,
    maximumAge: 2500,
    timeout: 5000,
  };

  constructor () {
  }

  watch (): Observable<any> {
    return new Observable<object>((observer) => {
      let watchId;

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => observer.next(position),
          (error) => observer.error(error),
          this.geoOpts,
        );
      } else {
        observer.error('Geolocation not available.');
      }

      return { unsubscribe () {
        navigator.geolocation.clearWatch(watchId);
      }};
    });
  }
}
