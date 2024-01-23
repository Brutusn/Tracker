import { Injectable } from "@angular/core";
import { Observable, map, merge, scan, switchMap, tap } from "rxjs";

import { SocketService } from "./websocket.service";

import { BroadcastPositionDto } from "@shared/position";

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

    return initialList$.pipe(
      tap(console.warn),
      switchMap((initialList) => {
        const combined = merge(userRemoved$, newPosition$, userLeft$);

        return combined.pipe(
          scan((list, newPosition) => {
            if (newPosition.type === "new") {
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
        );
      }),
    );
  }
}
