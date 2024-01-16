export interface Position {
  name: string;
  position: [number, number];
  speed: null | number;
  heading: null | number;
  date: Date;
  online?: boolean;
  waypoint: number;
  gpsStarted?: boolean;
}
GeolocationPosition;

export interface PositionMapped {
  [key: string]: Position;
}
