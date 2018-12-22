export interface Position {
  name: string;
  position: [number, number];
  speed: null | number;
  date: Date;
  online?: boolean;
  post: number;
}

export interface PositionMapped {
  [key: string]: Position;
}
