import * as config from '../../../config/client';

export const environment = {
  production: true,
  ws_url: 'https://tracker.welpensionie.nl',
  map_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ws_key: config.ws_key
};