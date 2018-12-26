export interface Position {
  name: string;
  position: [number, number];
  speed: null | number;
  date: Date;
  online?: boolean;
  waypoint: number;
  gpsStarted?: boolean;
}

export interface PositionMapped {
  [key: string]: Position;
}
