// Simple server that receives a location via a REST API and has a connected socket!
import http = require("http");
import fs = require("fs");
import path = require("path");

import { Server } from "socket.io";
import { Logger } from "./logger";

import express = require("express");
import bodyParser = require("body-parser");
import compression = require("compression");

import config = require("../../config/server.js");

import { NextFunction, Request, Response } from "express";
import { PositionCache } from "./PositionCache";
import { UserDatabase } from "./users-db";
import passwordHandler = require("./password");

const coreLog = new Logger("CORE");
const appLog = new Logger("APP");
const socketLog = new Logger("SOCKET");

coreLog.log(`Node running on version: ${process.version}...`);

const rf = fs.readFileSync;
// Set up
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header(
    "Strict-Transport-Security",
    "max-age: 15552000; includeSubDomains",
  );

  if (req.url.includes(".php")) {
    return res.status(418).send("Konijnenboutje");
  }
  next();
});

// Simple request logger, just to see some activity.
app.use((req, res, next) => {
  new Logger(req.method).log(`Request to: ${req.path}, (ip: ${req.ip})`);
  next();
});

app.use(bodyParser.json());

server.listen(config.port);
coreLog.log(`Server listening on port: ${config.port}`);

///////////////////////////////////////////////////////////////////////////////
const positions = new PositionCache();
const userDatabase = new UserDatabase();

const broadcast = (event: string, data: unknown) => {
  io.to("super-secret").emit(event, data);
};

const sendPosition = (
  data: { userId: string; position: [number, number] },
  errorFn: (message: string) => void,
) => {
  if (!data.userId || !Array.isArray(data.position)) {
    return errorFn(
      "Incomplete object. Send new like { userId: string, position: [number, number] }",
    );
  }

  const user = userDatabase.find(data.userId);

  if (user) {
    const position = {
      user,
      date: new Date(),
      position: data.position,
    };

    positions.addPosition(position);
    broadcast("new-position", position);
  }
};
const userLeft = (name: string, pinCode: string) => {
  appLog.log(`User left: ${name}`);

  const user = userDatabase.login(name, pinCode);

  if (user) {
    positions.userOffline(user);
    broadcast("user-left", name);
  }
};
const removeOfflineUser = (userId: string): void => {
  appLog.log(`Removing offline user: ${name}`);
  const user = userDatabase.find(userId);

  if (user) {
    positions.removeUser(user);
    broadcast("user-destroyed", user.name);
  }
};

////////////////////////////////////////////////////////////////////
// REST - API
////////////////////////////////////////////////////////////////////
// Basic API token validation.
const tokenValidator = (req: Request, res: Response, next: NextFunction) => {
  const providedToken = req.get("Authorization");

  if (providedToken !== `Bearer ${config.ws_key}`) {
    return res.status(401).send("Wrong token.");
  }

  next();
};

// The rest endpoints
// Simple ping
app.all("/api/ping", tokenValidator, (req, res) => {
  res.send({ pong: new Date() });
});

app.post("/api/login", (req, res) => {
  const { username, pinCode } = req.body as {
    username?: string;
    pinCode?: string;
  };

  if (!username || !pinCode) {
    return res.status(400).send("Missing username or pinCode");
  }

  const user = userDatabase.loginOrRegister(username, pinCode);

  if (!user) {
    return res.status(401).send("Wrong username or password");
  }

  positions.userLogin(user);
  res.send(user);
});
app.post("/api/user-refresh", (req, res) => {
  const { access_token } = req.body;

  if (!access_token || typeof access_token !== "string") {
    return res.status(400).send("Invalid body");
  }

  const user = userDatabase.find(access_token);

  if (!user) {
    return res.status(401).send("Access token invalid");
  }

  positions.userLogin(user);
  res.send(user);
});

app.post("/api/admin-login", tokenValidator, (req, res) => {
  const givenPass = req.body.password;

  if (!givenPass || !passwordHandler.verifyPassword(givenPass)) {
    return res.status(401).send("Invalid password");
  }

  res.send({ admin_token: passwordHandler.createToken(givenPass) });
});

// If we also want this server to serve the client.
if (config.serveClient === true) {
  app.use(compression());
  app.use(
    express.static(`${__dirname}/../../client/dist/tracker-client`, {
      immutable: true,
      maxAge: "1y",
    }),
  );
  app.all("/*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../../client/dist/tracker-client/index.html"),
    );
  });
}

////////////////////////////////////////////////////////////////////
// SOCKET - API
////////////////////////////////////////////////////////////////////
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
    const query = socket.handshake.query;

    const { token, access_token } = socket.handshake.auth;
    const { requestPositions } = query;

    const user = userDatabase.find(access_token);

    // Admin area.. in this if block.
    if (token === config.ws_key) {
      socket.join("super-secret");

      socket.on("user-destroy", ({ userId }) => {
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

      if (requestPositions) {
        // Send the last n amount of positions to the front-end
        socket.emit("initial-positions", positions.getAll);
      }
    }

    socket.on("send-position", (data) => {
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
  });
