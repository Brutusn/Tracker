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
  }

  mapPositions (pos: Position): PositionMapped {
    let newObject: PositionMapped = {};
    const mapper = (p: Position): PositionMapped => {
      newObject[p.name] = p;
      newObject[p.name].online = true;
      newObject[p.name].speed = p.speed ? Math.round(p.speed * 3.6) : 0;

      return newObject;
    }

    newObject = mapper(pos);

    // Merges the new data so no dubplicates come in..
    return Object.assign(this.mappedPositions, newObject);
  }

  getLocations (): Observable<PositionMapped> {
    return new Observable<PositionMapped>((observer) => {
      return this.ws.onEvent('initial-positions')
        .subscribe((positions: PositionMapped) => {
          // This will retrieve a list from the back-end as is...
          observer.next(Object.assign(this.mappedPositions, positions));
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
