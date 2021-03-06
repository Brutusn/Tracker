import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

import { SocketService } from './websocket.service';

import { Position, PositionMapped } from '@shared/position';

@Injectable()
export class LocationService {

  positions: Position[] = [];
  mappedPositions: PositionMapped = {};

  constructor (private ws: SocketService) {
    this.ws.initSocket(false);

    this.ws.onEvent('user-left').subscribe((name) => {
      if (this.mappedPositions[name]) {
        this.mappedPositions[name].online = false;
      }
    });
    this.ws.onEvent('user-destroyed').subscribe((name: string) => {
      delete this.mappedPositions[name];
    });
  }

  mapPositions (pos: Position, keepOnlineState = false): PositionMapped {
    const newObject: PositionMapped = {};

    newObject[pos.name] = {
      ...pos,
      online: keepOnlineState ? pos.online : true,
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
