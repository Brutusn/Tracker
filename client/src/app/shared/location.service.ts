import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

import { SocketService } from './websocket.service';

import { Position, PositionMapped } from '../shared/position';


@Injectable()
export class LocationService {

  positions: Position[] = [];
  mappedPositions: PositionMapped = {};

  constructor (private ws: SocketService) {
    this.ws.initSocket();

    this.ws.onEvent('user-left').subscribe((name) => {
      if (this.mappedPositions[name]) {
        this.mappedPositions[name].online = false;
      }
    });
    this.ws.onEvent('user-destroyed').subscribe((name: string) => {
      delete this.mappedPositions[name];
    });
  }

  // This will calculate the speed, if a number higher than <insane> km/h it will return the original speed.
  // This isn't rock solid, because you could have wrong speeds below threshold that are wrong.
  private calcSpeed (speed: number, insane = 150): number {
    const toKmh = Math.round(speed * 3.6);

    if (toKmh > insane) {
      return Math.round(speed);
    }

    return toKmh;
  }

  mapPositions (pos: Position, keepOnlineState = false): PositionMapped {
    const newObject: PositionMapped = {};

    newObject[pos.name] = {
      ...pos,
      online: keepOnlineState ? pos.online : true,
      speed: this.calcSpeed(pos.speed || 0)
    };

    // Merges the new data so no dubplicates come in..
    return Object.assign(this.mappedPositions, newObject);
  }

  getLocations (): Observable<PositionMapped> {
    return new Observable<PositionMapped>((observer) => {
      return this.ws.onEvent('initial-positions')
        .subscribe((positions: PositionMapped) => {
          Object.keys(positions).forEach((pos: string) => {
            const obj: Position = positions[pos];

            this.mapPositions(obj, true);
          });

          observer.next(this.mappedPositions);
        });
    });
  }

  getNewLocation (): Observable<PositionMapped> {
    return new Observable<PositionMapped>((observer) => {
      return this.ws.onEvent('new-position')
        .subscribe((position: Position) => {
          observer.next(this.mapPositions(position));
        });
    });
  }
}
