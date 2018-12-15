import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CompassService {

  constructor() { }

  public toKmh (speed, suffix = ' km/h') {
    if (speed === null) {
      return 0 + suffix;
    }
    const _speed = parseFloat(speed);

    return Math.round(_speed * 3.6) + suffix;
  }

  public encode (str = '') {
    return btoa(str);
  }
  public decode (str = '') {
    return atob(str);
  }
}
