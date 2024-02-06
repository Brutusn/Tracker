import { Injectable } from "@angular/core";
import {
  Observable,
  map,
  merge,
  scan,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs";

import { BroadcastPositionDto } from "../../../../models/src/position-dto";
import { UserDto } from "../../../../models/src/user";
import { SocketService } from "./websocket.service";

type SocketPosEvent =
  | {
      pos: { user: UserDto };
      type: "remove" | "left";
    }
  | {
      pos: BroadcastPositionDto;
      type: "new";
    };

@Injectable()
export class LocationService {
  constructor(private ws: SocketService) {
    this.ws.initSocket(false);
  }

  getLocations(): Observable<BroadcastPositionDto[]> {
    const initialList$ =
      this.ws.onEvent<BroadcastPositionDto[]>("initial-positions");

    const userRemoved$ = this.ws
      .onEvent<UserDto>("user-destroyed")
      .pipe(
        map(
          (user) =>
            ({ pos: { user }, type: "remove" }) satisfies SocketPosEvent,
        ),
      );
    const userLeft$ = this.ws
      .onEvent<UserDto>("user-left")
      .pipe(
        map(
          (user) => ({ pos: { user }, type: "left" }) satisfies SocketPosEvent,
        ),
      );
    const newPosition$ = this.ws
      .onEvent<BroadcastPositionDto>("new-position")
      .pipe(map((pos) => ({ pos, type: "new" }) satisfies SocketPosEvent));

    return this.ws.socketAnnounced.pipe(
      switchMap(() => initialList$),
      switchMap((initialList = []) => {
        const combined = merge<SocketPosEvent[]>(
          userRemoved$,
          newPosition$,
          userLeft$,
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
                (item) => item.user.id !== newPosition.pos.user.id,
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
