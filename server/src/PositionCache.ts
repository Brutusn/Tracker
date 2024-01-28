//@ts-check
import { EventEmitter } from "node:events";
import { Socket } from "socket.io";
import {
  BroadcastPositionDto,
  ClientPositionDto,
} from "../../models/src/position-dto";
import { UserDto } from "../../models/src/user";
import { User } from "./user";

export enum PositionEvents {
  StateUpdate = "state-update",
}

class DummyPosition implements BroadcastPositionDto {
  user: UserDto;
  constructor(_user: User) {
    this.user = _user.toJSON();
  }

  isOnline = false;
  // De blokhut :)
  position = [51.6267702062721, 5.522872209548951] as [number, number];
  speed = 0;
  heading = 0;
  post = 0;
  waypoint = 0;
  gpsStarted: false;
  date = new Date();
}

// Simple position class
export class PositionCache {
  private readonly positions = new Map<User, BroadcastPositionDto>();
  private readonly users = new Map<User, Socket>();

  private readonly positionEvent = new EventEmitter();

  get getAll(): BroadcastPositionDto[] {
    // This is the fallback name... doesn't need to be sent to the front...
    return Array.from(this.positions.values());
  }

  on(event: PositionEvents, action: () => void): void {
    this.positionEvent.on(event, action);
  }

  registerUser(user: User, socket: Socket): void {
    this.users.set(user, socket);
  }

  getSocketOfUser(user: User): Socket | null {
    const socket = this.users.get(user);

    return socket ?? null;
  }

  userLogin(user: User): void {
    const state = this.positions.get(user) ?? new DummyPosition(user);

    this.positions.set(user, state);
    this.positionEvent.emit(PositionEvents.StateUpdate);
  }

  userOffline(user: User): void {
    const state = this.positions.get(user);

    if (state) {
      // TODO Kan met de socket toch?
      state.isOnline = false;
    }
    this.positionEvent.emit(PositionEvents.StateUpdate);
  }

  addPosition(user: User, pos: ClientPositionDto) {
    const { userId, ...rest } = pos;

    const newState = {
      user: user.toJSON(),
      isOnline: true,
      ...rest,
    };

    this.positions.set(user, newState);
    this.positionEvent.emit(PositionEvents.StateUpdate);
  }

  removeUser(user: User): void {
    this.positions.delete(user);
    this.users.delete(user);
    this.positionEvent.emit(PositionEvents.StateUpdate);
  }
}
