//@ts-check
const { createHash } = require('crypto');
import {Socket} from "socket.io";

// Simple position class
module.exports = class PositionCache {
  private positions: any = {};
  private readonly users = new Map<string, UserData>();

  get getAll () {
    // This is the fallback name... doesn't need to be sent to the front...
    delete this.positions.__nameless__;

    return this.positions;
  }

  registerUser (name, pinCode, token = '', socket) {
    const userToken = name + pinCode;

    if (this.users.has(userToken)) {
      const { socket, ...rest } = this.users.get(userToken);

      return rest;
    }

    const access_token = this.hashString(userToken);

    const nameObj = {
      socket,
      access_token,
      name,
      pinCode
    };

    this.users.set(userToken, nameObj);

    return nameObj;
  }

  getSocketOfUser (user, pinCode) {
    const { socket } = this.users.get(user + pinCode);

    if (!socket) {
      return;
    }

    return socket;
  }

  userOffline (user, pinCode) {
    if (this.positions[user + pinCode]) {
      this.positions[user + pinCode].online = false;
    }
  }

  addPosition (pos) {
    // will add or update the position.
    this.positions[pos.name + pos.pinCode] = pos;
    this.positions[pos.name + pos.pinCode].online = true;
  }

  removeUser (user, pinCode) {
    if (this.positions[user + pinCode] && this.positions[user + pinCode].online === false) {
      delete this.positions[user + pinCode];
    }
    this.users.delete(user + pinCode);
  }

  private hashString (string) {
    const hash = createHash('sha256');
    return hash.update('Make a token: ' + new Date() + string).digest('hex');
  }
};

interface UserData {
  name: string;
  pinCode: string;
  access_token: string;
  socket: Socket;
}