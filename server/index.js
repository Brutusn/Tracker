// Simple server that receives a location via a REST API and has a connected socket!
//@ts-check
const http = require('http');

const express = require('express');
const socket = require('socket.io');

const config = require('../config/server.js');

const PosCache = require('./PositionCache.js');

// Set up
const app = express();
const server = http.Server(app);
const io = socket(server);

// If we also want this server to serve the client.
if (config.serveClient === true) {
  app.use(express.static('../client/dist/tracker-client'));
}

server.listen(config.port);
console.log('Server listening on port:', config.port);

///////////////////////////////////////////////////////////////////////////////
const positions = new PosCache();

const nonLimitSocket = (socket, next) => {
  const { token } = socket.handshake.query;

  if (token === config.ws_key) {
    return next();
  }

  next(new Error('No access.'));
};

const broadcast = (event, data) => {
  io
    .use(nonLimitSocket)
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
  positions.userOffline(name);
  broadcast('user-left', name);
}

// Simple request logger, just to see some activity.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request to: ${req.path}, method: ${req.method}, ip: ${req.ip}`);
  next();
});

// Basic API token validation.
app.use((req, res, next) => {
  const providedToken = req.get('Authorization');

  if (providedToken !== `Bearer ${config.ws_key}`) {
    return res.status(401).send('Wrong token.');
  }

  next();
});

// The rest endpoints
// Simple ping
app.all('/api/ping', (req, res) => {
  res.send({ pong: new Date() });
});

// POST /api/send-position
app.post('/api/send-position', ({ params: { body }}, res) => {
  sendPosition(body, res.status(400).send);

  res.send('Ok thanks!');
});

// POST /api/byebye/:name
app.post('/api/byebye/:name', ({ params: { name }}, res) => {
  userLeft(name);

  res.send({ confirmed: name });
});

const connectedNames = [];
// Returns a new name based on the connected versions of it.
const handleName = (name, suffix = 0) => {
  if (connectedNames.includes(name)) {
    const n = name.includes('~') ? name.split('~')[0] : name;

    const suf = suffix === 0 ? '' : `~${suffix}`;
    const newName = n + suf;

    return handleName(newName, suffix + 1);
  }

  connectedNames.push(name);

  return name;
}

io
// Only users with the correct token are allowed to connect.
  .use((socket, next) => {
    const { token } = socket.handshake.query;

    if (token === config.ws_key || token === config.ws_key_lim) {
      return next();
    }

    console.log('A socket could not be connected.');
    next(new Error('Unable to authenticate.'));
  })
  .on('connection', (socket) => {
    console.log('A socket connected', socket.id);

    let name = socket.handshake.query.name;

    if (name) {
      handleName(name);
    }

    // Send the last n amount of positions to the front-end
    if (socket.handshake.query.requestPositions) {
      socket.emit('initial-positions', positions.getAll);
    }

    socket.on('send-position', (data) => {
      const errorFn = (msg) => socket.emit('growl', msg);

      sendPosition(data, errorFn);
    });
    
    socket.on('disconnect', () => {
      userLeft(name);
    });
  });