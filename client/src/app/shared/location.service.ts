import { Injectable } from "@angular/core";
import {
  Observable,
  map,
  merge,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from "rxjs";

import { BroadcastPositionDto } from "../../../../models/src/position-dto";
import { SocketService } from "./websocket.service";

@Injectable()
export class LocationService {
  constructor(private ws: SocketService) {
    this.ws.initSocket(false);
  }

  getLocations(): Observable<BroadcastPositionDto[]> {
    const initialList$ =
      this.ws.onEvent<BroadcastPositionDto[]>("initial-positions");

    const userRemoved$ = this.ws
      .onEvent<BroadcastPositionDto>("user-destroyed")
      .pipe(map((pos) => ({ pos, type: "remove" })));
    const userLeft$ = this.ws
      .onEvent<BroadcastPositionDto>("user-left")
      .pipe(map((pos) => ({ pos, type: "left" })));

    const newPosition$ = this.ws
      .onEvent<BroadcastPositionDto>("new-position")
      .pipe(map((pos) => ({ pos, type: "new" })));

    console.log("Listening for initial positions");
    return this.ws.socketAnnounced.pipe(
      switchMap(() => initialList$),
      tap((v) => console.log("initial", v)),
      switchMap((initialList = []) => {
        console.log("initial list", initialList);
        const combined = merge(userRemoved$, newPosition$, userLeft$).pipe(
          tap((c) => console.log("from merge", c)),
        );

        return combined.pipe(
          scan((list, newPosition) => {
            if (newPosition.type === "new") {
              // New user or new position of existing user;
              const existingUser = list.find(
                (item) => item.user.id === newPosition.pos.user.id,
              );

              if (!existingUser) {
                list.push(newPosition.pos);
                return list;
              }

              return list.map((item) => {
                return item.user.id === newPosition.pos.user.id
                  ? { ...newPosition.pos, isOnline: true }
                  : item;
              });
            }
            if (newPosition.type === "left") {
              return list.map((item) => {
                return item.user.id === newPosition.pos.user.id
                  ? { ...item, isOnline: false }
                  : item;
              });
            }
            if (newPosition.type === "remove") {
              return list.filter(
                (item) => item.user.id === newPosition.pos.user.id,
              );
            }

            return list;
          }, initialList),
          startWith(initialList),
          map((list) =>
            list.sort((a, b) => a.user.name.localeCompare(b.user.name)),
          ),
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
}
