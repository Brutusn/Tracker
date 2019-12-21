// Simple server that receives a location via a REST API and has a connected socket!
//@ts-check
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const { constants } = require('crypto');

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const socket = require('socket.io');

const config = require('../config/server.js');

const PosCache = require('./PositionCache.js');
const passwordHandler = require('./password');

console.log(`[CORE] Node running on version: ${process.version}...`);

const rf = fs.readFileSync;
// Set up
const app = express();
const server = https.createServer({
  key: rf(`${__dirname}/../cert/SSLprivatekey.key`),
  cert: rf(`${__dirname}/../cert/SSLcertificate.crt`),
  ca: [rf(`${__dirname}/../cert/ca1.crt`), rf(`${__dirname}/../cert/ca2.crt`)],
  secureOptions: constants.SSL_OP_NO_TLSv1
}, app);
const io = socket(server);

// The http server is just to redirect.
const httpServer = http.createServer(app);

// Redirect to https.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Strict-Transport-Security", "max-age: 15552000; includeSubDomains");
  if(!req.secure) {
    console.log('[HTTP] Insecure connection, redirect to https..', req.url);

    if (req.url.includes('.php')) {
      return res.status(418).send('Konijnenboutje');
    }

    return res.redirect(`https://${req.get('Host')}/`);
  }
  next();
});

// Simple request logger, just to see some activity.
app.use((req, res, next) => {
  console.log(`[${req.method}] Request to: ${req.path}, (ip: ${req.ip})`);
  next();
});

app.use(bodyParser.json()); 

server.listen(config.port);
httpServer.listen(config.port + 1);
console.log(`[CORE] Server listening on port: ${config.port}`);

///////////////////////////////////////////////////////////////////////////////
const positions = new PosCache();

const broadcast = (event, data) => {
  io
    .to('super-secret')
    .emit(event, data);
}

const sendPosition = (data, errorFn) => {
  if (!data.name || !Array.isArray(data.position)) {
    return errorFn('Incomplete object. Send new like { name: "", position: [] }');
  }

  data.date = new Date();

  broadcast('new-position', data);
  positions.addPosition(data);
}
const userLeft = (name = '__nameless__') => {
  console.log('[APP] User left:', name);
  positions.userOffline(name);
  broadcast('user-left', name);
}
const removeOfflineUser = (name) => {
  console.log('[APP] Removing offline user:', name);
  positions.removeUser(name);
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
  app.use(express.static(`${__dirname}/../client/dist/tracker-client`, {
    immutable: true,
    maxAge: '1y'
  }));
  app.all('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/tracker-client/index.html'));
  });
}

////////////////////////////////////////////////////////////////////
// SOCKET - API
////////////////////////////////////////////////////////////////////
io
// Only users with the correct token are allowed to connect.
  .use((socket, next) => {
    const { token, admin_token } = socket.handshake.query;

    if (token === config.ws_key || token === config.ws_key_lim) {
      if (token === config.ws_key_lim) {
        return next();
      }

      if (passwordHandler.verifyToken(admin_token)) {
        return next();
      }
    }

    console.log('[SOCKET] A socket could not be connected.');
    next(new Error('Unable to authenticate.'));
  })
  .on('connection', (socket) => {
    console.log('[SOCKET] A socket connected', socket.id);

    const { token, requestPositions, access_token } = socket.handshake.query;
    let name = socket.handshake.query.name;

    if (name) {
      const nameData = positions.registerUser(name, access_token, socket);
      name = nameData.name;

      console.log('[APP] User joined:', name);
      broadcast('user-joined', name);
      process.nextTick(() => socket.emit('final-name', nameData));
    }

    if (token === config.ws_key) {
      socket.join('super-secret');

      socket.on('user-destroy', (user) => {
        removeOfflineUser(user);
      });

      socket.on('start-route', ({ name, startAt = 0 }) => {
        const userSocket = positions.getSocketOfUser(name);

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
      broadcast('growl', { style: 'info', message: `User: ${name} started it's route. Distance: ${distance}.`});
    });
    
    socket.on('disconnect', () => {
      userLeft(name);
    });
  });