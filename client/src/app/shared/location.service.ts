import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SocketService } from './websocket.service';

import { Position, PositionMapped } from '@shared/position';

@Injectable()
export class LocationService {

  positions: Position[] = [];
  mappedPositions: PositionMapped = {};

  constructor (private ws: SocketService) {
    this.ws.initSocket(false);

    this.ws.onEvent<string>('user-left').subscribe((name) => {
      if (this.mappedPositions[name]) {
        this.mappedPositions[name].online = false;
      }
    });
    this.ws.onEvent<string>('user-destroyed').subscribe((name) => {
      delete this.mappedPositions[name];
    });
  }

  mapPositions (pos: Position, keepOnlineState = false): PositionMapped {
    const newObject: PositionMapped = {};

    newObject[pos.name] = {
      ...pos,
      online: keepOnlineState ? pos.online : true,
    };

    // Merges the new data so no duplicates come in...
    return Object.assign(this.mappedPositions, newObject);
  }

  getLocations (): Observable<PositionMapped> {
    return new Observable<PositionMapped>((observer) => {
      return this.ws.onEvent<PositionMapped>('initial-positions')
        .subscribe((positions) => {
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
      return this.ws.onEvent<Position>('new-position')
        .subscribe((position) => {
          observer.next(this.mapPositions(position));
        });
    });
  }
}
