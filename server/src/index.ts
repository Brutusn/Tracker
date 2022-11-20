// Simple server that receives a location via a REST API and has a connected socket!
import http = require('http');
import fs = require('fs');
import path = require('path');

import { Logger } from './logger';

import express = require('express');
import bodyParser = require('body-parser');
import compression = require('compression');
import { Server } from 'socket.io';

import config = require('../../config/server.js');

import { PositionCache } from './PositionCache';
import passwordHandler = require('./password');

const coreLog = new Logger('CORE');
const appLog = new Logger('APP');
const socketLog = new Logger('SOCKET');

coreLog.log(`Node running on version: ${process.version}...`);

const rf = fs.readFileSync;
// Set up
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Strict-Transport-Security", "max-age: 15552000; includeSubDomains");

  if (req.url.includes('.php')) {
    return res.status(418).send('Konijnenboutje');
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

const broadcast = (event, data) => {
  io
    .to('super-secret')
    .emit(event, data);
}

const sendPosition = (data, errorFn) => {
  if (!data.name || !data.pinCode || !Array.isArray(data.position)) {
    return errorFn('Incomplete object. Send new like { name: "", pinCode: "", position: [] }');
  }

  data.date = new Date();

  broadcast('new-position', data);
  positions.addPosition(data);
}
const userLeft = (name = '__nameless__', pinCode = '') => {
  appLog.log(`User left: ${name}`);
  positions.userOffline(name, pinCode);
  broadcast('user-left', name);
}
const removeOfflineUser = (name, pinCode) => {
  appLog.log(`Removing offline user: ${name}`);
  positions.removeUser(name, pinCode);
  broadcast('user-destroyed', name);
}

////////////////////////////////////////////////////////////////////
// REST - API
////////////////////////////////////////////////////////////////////
// Basic API token validation.
const tokenValidator = (req, res, next) => {
  const providedToken = req.get('Authorization');

  if (providedToken !== `Bearer ${config.ws_key}`) {
    return res.status(401).send('Wrong token.');
  }

  next();
};

// The rest endpoints
// Simple ping
app.all('/api/ping', tokenValidator, (req, res) => {
  res.send({ pong: new Date() });
});

app.post('/api/login', tokenValidator, (req, res) => {
  const givenPass = req.body.password;

  if (!givenPass || !passwordHandler.verifyPassword(givenPass)) {
    return res.status(401).send('Invalid password');
  }

  res.send({ access_token: passwordHandler.createToken(givenPass) });
});

// If we also want this server to serve the client.
if (config.serveClient === true) {
  app.use(compression());
  app.use(express.static(`${__dirname}/../../client/dist/tracker-client`, {
    immutable: true,
    maxAge: '1y'
  }));
  app.all('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/tracker-client/index.html'));
  });
}

////////////////////////////////////////////////////////////////////
// SOCKET - API
////////////////////////////////////////////////////////////////////
io
// Only users with the correct token are allowed to connect.
  .use((socket, next) => {
    const { token, admin_token } = socket.handshake.auth;

    if (token === config.ws_key || token === config.ws_key_lim) {
      if (token === config.ws_key_lim) {
        return next();
      }

      if (passwordHandler.verifyToken(admin_token)) {
        return next();
      }
    }

    socketLog.log('A socket could not be connected.');
    next(new Error('Unable to authenticate.'));
  })
  .on('connection', (socket) => {
    socketLog.log(`A socket connected ${socket.id}`);
    const query = socket.handshake.query;

    const { token, access_token } = socket.handshake.auth;
    const { requestPositions } = query;
    let { username, pinCode } = query;

    if (username && pinCode) {
      const nameData = positions.registerUser(username, pinCode, access_token, socket);
      username = nameData.name;

      appLog.log(`User joined: ${username}`);
      broadcast('user-joined', username);
      process.nextTick(() => socket.emit('final-name', {
        name: username,
        access_token: nameData.access_token,
        pinCode: nameData.pinCode
      }));
    }

    if (token === config.ws_key) {
      socket.join('super-secret');

      socket.on('user-destroy', ({ username, pinCode }) => {
        removeOfflineUser(username, pinCode);
      });

      socket.on('start-route', ({ name, pinCode, startAt = 0 }) => {
        const userSocket = positions.getSocketOfUser(name, pinCode);

        if (userSocket) {
          userSocket.emit('start-route', startAt);
        } else {
          socket.emit('growl', { style: 'error', message: `User: ${name} not found.`});
        }
      });
    }

    // Send the last n amount of positions to the front-end
    if (requestPositions && token === config.ws_key) {
      socket.emit('initial-positions', positions.getAll);
    }

    socket.on('send-position', (data) => {
      const errorFn = (message) => socket.emit('growl', message);

      sendPosition(data, errorFn);
    });

    socket.on('user-in-reach', ({ distance }) => {
      socket.emit('start-route', 0);
      broadcast('growl', { style: 'info', message: `User: ${username} started it's route. Distance: ${distance}.`});
    });
    
    socket.on('disconnect', () => {
      userLeft(username as string, pinCode as string);
    });
  });