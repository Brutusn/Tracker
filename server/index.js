// Simple server that receives a location via a REST API and has a connected socket!
//@ts-check
const http = require('https');
const fs = require('fs');
const path = require('path');

const express = require('express');
const socket = require('socket.io');

const config = require('../config/server.js');

const PosCache = require('./PositionCache.js');
const { handleName } = require('./handleName.js');

const rf = fs.readFileSync;
// Set up
const app = express();
const server = http.createServer({
  key: rf('../cert/SSLprivatekey.key'),
  cert: rf('../cert/SSLcertificate.crt'),
  ca: [rf('../cert/ca1.crt'), rf('../cert/ca2.crt')]
}, app);
const io = socket(server);

// If we also want this server to serve the client.
if (config.serveClient === true) {
  app.use('/tracker', express.static(path.join(__dirname, '../client/dist/tracker-client')));
  app.use(express.static('../geolocation/dist/geolocation'));
}

server.listen(config.port);
console.log('Server listening on port:', config.port);

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
  console.log('User left:', name);
  positions.userOffline(name);
  broadcast('user-left', name);
}

////////////////////////////////////////////////////////////////////
// REST - API
////////////////////////////////////////////////////////////////////
// Simple request logger, just to see some activity.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request to: ${req.path}, method: ${req.method}, ip: ${req.ip}`);
  next();
});

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

// POST /api/send-position
app.post('/api/send-position', tokenValidator, ({ params: { body }}, res) => {
  sendPosition(body, res.status(400).send);

  res.send('Ok thanks!');
});

// POST /api/byebye/:name
app.post('/api/byebye/:name', tokenValidator, ({ params: { name }}, res) => {
  userLeft(name);

  res.send({ confirmed: name });
});

////////////////////////////////////////////////////////////////////
// SOCKET - API
////////////////////////////////////////////////////////////////////
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
    
    const { token, requestPositions, access_token } = socket.handshake.query;
    let name = socket.handshake.query.name;

    if (name) {
      const nameData = handleName(name, access_token);
      name = nameData.name;

      console.log('User joined:', name);
      process.nextTick(() => socket.emit('final-name', nameData));
    }

    if (token === config.ws_key) {
      socket.join('super-secret');
    }

    // Send the last n amount of positions to the front-end
    if (requestPositions && token === config.ws_key) {
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