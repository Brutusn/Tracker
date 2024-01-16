import { LeafletMap } from "./leaflet-map.abstract";
import * as L from "leaflet";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Route {
  code: string;
  coord: Coordinate;
  skip?: boolean;
}

export const locationArray: Route[] = [
  {
    code: "Maaskruising",
    coord: {
      latitude: 51.685693,
      longitude: 6.053263,
    },
  },
  {
    code: "Van het padje",
    coord: {
      latitude: 51.686674,
      longitude: 5.944226,
    },
  },
  {
    code: "Hanenwaterval",
    coord: {
      latitude: 51.634953,
      longitude: 5.820189,
    },
  },
  {
    code: "Kapel",
    coord: {
      latitude: 51.63784,
      longitude: 5.707294,
    },
  },
  {
    code: "De BBQ blokhut 🥩🍺",
    coord: {
      latitude: LeafletMap.blokhut[0],
      longitude: LeafletMap.blokhut[1],
    },
  },
];

export const postArray: Route[] = [
  {
    // Start
    code: "Nistelrode",
    coord: {
      latitude: 51.68828,
      longitude: 5.565392,
    },
  },
  {
    // Post 2
    code: "Pannenkoekenrestaurant",
    coord: {
      latitude: 51.819452,
      longitude: 5.943595,
    },
  },
  {
    // Post 3
    code: "CHAAARGE!",
    coord: {
      latitude: 51.769025,
      longitude: 6.147237,
    },
  },
  {
    // Post 4
    code: "Noob camper",
    coord: {
      latitude: 51.668885,
      longitude: 6.453046,
    },
  },
  {
    // Post 5
    code: "Vrienden van Veghel",
    coord: {
      latitude: 51.669845,
      longitude: 6.154036,
    },
    // }, {
    //   // Post 6
    //   code: 'Kruising',
    //   coord: {
    //     latitude: 51.6864023,
    //     longitude: 5.944451,
    //   },
  },
];

export const SECRET_CODE = "51411553354";
