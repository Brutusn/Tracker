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

  mapPositions (pos: Position | Position[]): PositionMapped {
    const newObject:PositionMapped = {};
    const mapper = (p: Position) => {
      newObject[p.name] = p;
      newObject[p.name].online = true;
    }

    if (Array.isArray(pos)) {
      pos.forEach(mapper);
    } else {
      mapper(pos);
    }

    // Merges the new data so no dubplicates come in..
    return Object.assign(this.mappedPositions, newObject);
  }

  getLocations (): Observable<PositionMapped> {
    return new Observable<PositionMapped>((observer) => {
      return this.ws.onEvent('initial-positions')
        .subscribe((positions: Position[]) => {
          observer.next(this.mapPositions(positions));
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
