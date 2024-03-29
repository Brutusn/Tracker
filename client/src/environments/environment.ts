// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { config } from "../../../config/client";

export const environment = {
  production: false,
  map_url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

  ws_url: location.origin.replace("4200", config.port.toString(10)),
  ws_key: config.ws_key,
  ws_key_lim: config.ws_key_lim,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
