import { config } from "../../../config/client";

export const environment = {
  production: true,
  ws_url: location.origin,
  map_url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  ws_key: config.ws_key,
  ws_key_lim: config.ws_key_lim,
};
