import { Server } from "socket.io";
import { ClientPositionDto } from "../../models/src/position-dto";
import { PositionCache } from "./PositionCache";
import { Logger } from "./logger";
import { UserDatabase } from "./users-db";

import config = require("../../config/server.js");
import passwordHandler = require("./password");

const appLog = new Logger("APP");
const socketLog = new Logger("SOCKET");

export function initSocketApi(
  io: Server,
  userDatabase: UserDatabase,
  positions: PositionCache,
  broadcast: (target: string, data: unknown) => void,
): void {
  io
    // Only users with the correct token are allowed to connect.
    .use((socket, next) => {
      const { token, access_token, admin_token } = socket.handshake.auth;

      if (token === config.ws_key || token === config.ws_key_lim) {
        // Normal user and it's found in the 'database'
        if (token === config.ws_key_lim && userDatabase.find(access_token)) {
          return next();
        }

        // Hopefully a s5 stam member.
        if (passwordHandler.verifyToken(admin_token)) {
          return next();
        }
      }

      socketLog.log("A socket could not be connected.");
      next(new Error("Unable to authenticate."));
    })
    .on("connection", (socket) => {
      socketLog.log(`A socket connected ${socket.id}`);

      const { token, access_token } = socket.handshake.auth;
      const user = userDatabase.find(access_token);

      socket.emit("growl", {
        style: "info",
        message: `Welcome ${user?.name}.`,
      });

      socket.on("send-position", (data: ClientPositionDto) => {
        sendPosition(data, (message) => socket.emit("growl", message));
      });

      socket.on("user-in-reach", ({ distance }) => {
        socket.emit("start-route", 0);
        broadcast("growl", {
          style: "info",
          message: `User: ${user.name} started it's route. Distance: ${distance}.`,
        });
      });

      socket.on("disconnect", () => {
        if (user) userLeft(user.name, user.pinCode);
      });

      // Admin area.. in this if block.
      if (token === config.ws_key) {
        socketLog.log("An admin joined");
        socket.join("super-secret");

        socket.on("user-destroy", (userId) => {
          removeOfflineUser(userId);
        });

        socket.on("start-route", ({ userId, startAt = 0 }) => {
          const user = userDatabase.find(userId);

          if (user) {
            const userSocket = positions.getSocketOfUser(user);

            if (userSocket) {
              userSocket.emit("start-route", startAt);
            } else {
              socket.emit("growl", {
                style: "error",
                message: `User ${user.name} has no know socket connection.`,
              });
            }
          } else {
            socket.emit("growl", {
              style: "error",
              message: `User with id ${userId} not found.`,
            });
          }
        });

        socket.emit("initial-positions", positions.getAll);

        socket.on("request-initial-users", () => {
          socketLog.log("Requesting inital positions");
          socket.emit("initial-positions", positions.getAll);
        });
      }
    });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const sendPosition = (
    data: ClientPositionDto,
    errorFn: (message: string) => void,
  ) => {
    if (!data.userId || !Array.isArray(data.position)) {
      return errorFn(
        "Incomplete object. Send new like { userId: string, position: [number, number] }",
      );
    }

    const user = userDatabase.find(data.userId);

    socketLog.log(`Received position from: ${user.name ?? "<unknown user>"}`);

    if (user) {
      positions.addPosition(user, data);

      const { userId, ...rest } = data;

      broadcast("new-position", {
        ...rest,
        user,
      });
    }
  };
  const userLeft = (name: string, pinCode: string) => {
    appLog.log(`User left: ${name}`);

    const user = userDatabase.login(name, pinCode);

    if (user) {
      positions.userOffline(user);
      broadcast("user-left", user);
    }
  };
  const removeOfflineUser = (userId: string): void => {
    appLog.log(`Removing offline user: ${name}`);
    const user = userDatabase.find(userId);

    if (user) {
      positions.removeUser(user);
      broadcast("user-destroyed", user);
    }
  };
}
