import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { share, distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class GeoService {
  private geoOpts = {
    enableHighAccuracy: true,
    maximumAge: 2500,
    timeout: 5000,
  };

  private readonly geo$ = new Observable<GeolocationPosition>((observer) => {
    let watchId: number;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => observer.next(position),
        (error) => observer.error(error),
        this.geoOpts,
      );
    } else {
      observer.error('Geolocation not available.');
      observer.complete();
    }

    return { unsubscribe () {
      navigator.geolocation.clearWatch(watchId);
    }};
  }).pipe(share(), distinctUntilChanged(GeoService.distinctPosition));

  constructor () {}

  watch (): Observable<GeolocationPosition> {
    return this.geo$;
  }

  private static distinctPosition (x: GeolocationPosition, y: GeolocationPosition): boolean {
    return x.timestamp === y.timestamp;
  }
}
