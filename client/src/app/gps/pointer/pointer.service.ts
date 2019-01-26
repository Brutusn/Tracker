import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PointerService {

  constructor() { }

  public toKmh (speed: number | string, suffix = ' km/h') {
    if (speed === null) {
      return 0 + suffix;
    }
    const _speed = parseFloat(speed as string);

    return Math.round(_speed * 3.6) + suffix;
  }

  public encode (str = '') {
    return btoa(str);
  }
  public decode (str = '') {
    return atob(str);
  }
}
