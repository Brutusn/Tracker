import express = require("express");
import config = require("../../config/server.js");
import compression = require("compression");
import path = require("node:path");

import passwordHandler = require("./password");

import { PositionCache } from "PositionCache";
import { Express, NextFunction, Request, Response } from "express";
import { UserDatabase } from "users-db.js";

const tokenValidator = (req: Request, res: Response, next: NextFunction) => {
  const providedToken = req.get("Authorization");

  if (providedToken !== `Bearer ${config.ws_key}`) {
    return res.status(401).send("Wrong token.");
  }

  next();
};

export function initRestApi(
  app: Express,
  userDatabase: UserDatabase,
  positions: PositionCache,
  broadcast: (target: string, data: unknown) => void,
): void {
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
    broadcast("new-position", {
      user,
    });
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
}
