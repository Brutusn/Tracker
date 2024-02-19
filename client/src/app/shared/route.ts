export type Coordinate = Pick<GeolocationCoordinates, "latitude" | "longitude">;

export interface GeoRoute {
  code: string;
  coord: Coordinate;
  skip?: boolean;
  /** This location will start the route.  */
  isTrigger?: boolean;
}

export const locationArray: GeoRoute[] = [
  // Start
  {
    code: "Blauwebessenland",
    isTrigger: true,
    coord: {
      latitude: 51.44499849958186,
      longitude: 5.950007300000001,
    },
  },
  {
    code: "🇩🇪 de Duitsers 🇩🇪",
    coord: {
      latitude: 51.4687930862947,
      longitude: 5.890098108373127,
    },
  },
  {
    code: "Oude bult bankert",
    coord: {
      latitude: 51.49901639345777,
      longitude: 5.817237601057829,
    },
  },
  {
    code: "Golf",
    coord: {
      latitude: 51.51238654144119,
      longitude: 5.7591420586453195,
    },
  },
  {
    code: "Hans Kazandpad",
    coord: {
      latitude: 51.536576196198084,
      longitude: 5.676695821221787,
    },
  },
  {
    code: "Put weg?",
    coord: {
      latitude: 51.563193008448444,
      longitude: 5.653393774068273,
    },
  },
  // Einde post
  {
    code: "Pluk van de Pannenkoek",
    coord: {
      latitude: 51.532955124112526,
      longitude: 5.634459481725554,
    },
  },
];

// This year, no luck for this :)
export const postArray: GeoRoute[] = [];

export const SECRET_CODE = "51411553354";
