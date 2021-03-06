import { LeafletMap } from './leaflet-map.abstract';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Route {
  code: string;
  coord: Coordinate;
  skip?: boolean;
}

export const locationArray: Route[] = [{
  code: 'Hanenwaterval',
  coord: {
    latitude: 51.634953,
    longitude: 5.820189,
  },
}, {
  code: 'Kapel',
  coord: {
    latitude: 51.637840,
    longitude: 5.707294,
  },
}, {
  code: 'De beste blokhut',
  coord: {
    latitude: LeafletMap.blokhut[0],
    longitude: LeafletMap.blokhut[1],
  },
}];

export const postArray: Route[] = [{
  // Start
  code: 'Nistelrode',
  coord: {
    latitude: 51.688280,
    longitude: 5.565392,
  },
}, {
  // Post 2
  code: 'Pannenkoekenrestaurant',
  coord: {
    latitude: 51.819452,
    longitude: 5.943595,
  },
}, {
  // Post 3
  code: 'CHAAARGE!',
  coord: {
    latitude: 51.769025,
    longitude: 6.147237,
  },
}, {
  // Post 4
  code: 'Noob camper',
  coord: {
    latitude: 51.668885,
    longitude: 6.453046,
  },
}, {
  // Post 5
  code: 'Vrienden van Veghel',
  coord: {
    latitude: 51.669845,
    longitude: 6.154036,
  },
}, {
  // Post 6
  code: 'Kruising',
  coord: {
    latitude: 51.6864023,
    longitude: 5.944451,
  },
}];
