// Simple server that receives a location via a REST API and has a connected socket!
import http = require("node:http");
import https = require("node:https");

import { readFileSync } from "node:fs";

import { Server } from "socket.io";
import { Logger } from "./logger";

import express = require("express");
import bodyParser = require("body-parser");

import config = require("../../config/server.js");

import { initRestApi } from "./rest";
import { initSocketApi } from "./socket";

import { PositionCache } from "./PositionCache";
import { UserDatabase } from "./users-db";

const coreLog = new Logger("CORE");

coreLog.log(`Node running on version: ${process.version}...`);
coreLog.log("Using https:", process.env.USE_HTTPS);

const useHttps = process.env.USE_HTTPS ?? false;
// Set up
const app = express();
// In deployement https is done via nginx.
const server = useHttps
  ? https.createServer(
      {
        key: readFileSync("./dev-ssl/TrackerCA.key"),
        cert: readFileSync("./dev-ssl/TrackerCA.crt"),
      },
      app,
    )
  : http.createServer(app);
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

////////////////////////////////////////////////////////////////////
// REST - API
////////////////////////////////////////////////////////////////////
initRestApi(app, userDatabase, positions, broadcast);

////////////////////////////////////////////////////////////////////
// SOCKET - API
////////////////////////////////////////////////////////////////////
initSocketApi(io, userDatabase, positions, broadcast);
