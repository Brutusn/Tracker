import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { share, tap, distinctUntilChanged, distinctUntilKeyChanged } from 'rxjs/operators';

@Injectable()
export class GeoService {

  private geoOpts = {
    enableHighAccuracy: true,
    maximumAge: 2500,
    timeout: 5000,
  };

  private readonly geo$ = new Observable<Position>((observer) => {
    let watchId: number;

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
  }).pipe(share(), distinctUntilChanged(GeoService.distinctPosition));

  constructor () {}

  watch (): Observable<Position> {
    return this.geo$;
  }

  private static distinctPosition (x: Position, y: Position): boolean {
    return x.timestamp === y.timestamp;
  }
}
