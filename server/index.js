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
  app.use(express.static('../client/dist'));
}

server.listen(config.port);
console.log('Server listening on port:', config.port);

///////////////////////////////////////////////////////////////////////////////
const positions = new PosCache({ positionLimit: 10 });

// Simple request logger, just to see some activity.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request to: ${req.path}, method: ${req.method}, ip: ${req.ip}`);
  next();
});

// Basic API token validation.
app.use((req, res, next) => {
  const providedToken = req.get('Authorization');

  if (providedToken !== `Bearer ${config.api_key}`) {
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
  if (!body.name || !Array.isArray(body.position)) {
    return res.status(400).send('Incomplete object. Send new like { name: "", position: [] }');
  }

  body.date = new Date();

  io.sockets.emit('new-position', body);
  positions.addPosition(body);

  res.send('Ok thanks!');
});

// POST /api/byebye/:name
app.post('/api/byebye/:name', ({ params: { name }}, res) => {
  io.sockets.emit('user-left', name);

  res.send({ confirmed: name });
});

io
// Only users with the correct token are allowed to connect.
  .use((socket, next) => {
    if (socket.handshake.query.token === config.ws_key) {
      return next();
    }

    console.log('A socket could not be connected.');
    next(new Error('Unable to authenticate.'))
  })
  .on('connection', (socket) => {
    console.log('A socket connected', socket.id);

    // Send the last n amount of positions to the front-end
    socket.emit('initial-positions', positions.getAll());
  });