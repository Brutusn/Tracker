//@ts-check
import { createHash } from "crypto";
import { Socket } from "socket.io";
import { User } from "./user";

export class UserState {
  isOnline = false;
  lastPosition?: [number, number];
  constructor(readonly user: User) {}
}

// Simple position class
export class PositionCache {
  private readonly positions = new Map<User, UserState>();
  private readonly users = new Map<User, Socket>();

  get getAll(): UserState[] {
    // This is the fallback name... doesn't need to be sent to the front...
    return Array.from(this.positions.values());
  }

  registerUser(user: User, socket: Socket): void {
    this.users.set(user, socket);
  }

  getSocketOfUser(user: User): Socket | null {
    const socket = this.users.get(user);

    return socket ?? null;
  }

  userOffline(user: User): void {
    const state = this.positions.get(user);

    if (state) {
      // TODO Kan met de socket toch?
      state.isOnline = false;
    }
  }

  addPosition(pos: { user: User; position: [number, number]; date: Date }) {
    // will add or update the position.
    const state = this.positions.get(pos.user) ?? new UserState(pos.user);

    state.isOnline = true;
    state.lastPosition = pos.position;

    this.positions.set(pos.user, state);
  }

  removeUser(user: User): void {
    this.positions.delete(user);
    this.users.delete(user);
  }
}
