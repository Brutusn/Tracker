export interface Position {
  name: string,
  position: [number, number],
  date: Date,
  online?: boolean
}

export interface PositionMapped {
  [key: string]: Position
}