//@ts-check
import { EventEmitter } from "node:events";
import { Socket } from "socket.io";
import { User } from "./user";

export class UserState {
  isOnline = false;
  lastPosition?: [number, number];
  constructor(readonly user: User) {}
}

export enum PositionEvents {
  StateUpdate = "state-update",
}

// Simple position class
export class PositionCache {
  private readonly positions = new Map<User, UserState>();
  private readonly users = new Map<User, Socket>();

  private readonly positionEvent = new EventEmitter();

  get getAll(): UserState[] {
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
    const state = this.positions.get(user) ?? new UserState(user);

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

  addPosition(pos: { user: User; position: [number, number]; date: Date }) {
    // will add or update the position.
    const state = this.positions.get(pos.user) ?? new UserState(pos.user);

    state.isOnline = true;
    state.lastPosition = pos.position;

    this.positions.set(pos.user, state);
    this.positionEvent.emit(PositionEvents.StateUpdate);
  }

  removeUser(user: User): void {
    this.positions.delete(user);
    this.users.delete(user);
    this.positionEvent.emit(PositionEvents.StateUpdate);
  }
}
