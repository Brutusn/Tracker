import { User } from "./user.service";

export interface PositionDto {
  userId: string;
  /** Latitude, longitude */
  position: [number, number];
  speed: number;
  heading: number;
  post: number;
  waypoint: number;
  gpsStarted: boolean;
  date: Date;
}
export interface BroadcastPositionDto {
  user: User;
  /** Latitude, longitude */
  position: [number, number];
  speed: number;
  heading: number;
  post: number;
  waypoint: number;
  gpsStarted: boolean;
  date: Date;
  isOnline?: boolean;
}
