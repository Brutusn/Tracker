import { UserDto } from "./user";

/** DTO send to the server! */
export interface ClientPositionDto {
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

/** DTO received from the server! */
export interface BroadcastPositionDto
  extends Omit<ClientPositionDto, "userId"> {
  user: UserDto;
  isOnline: boolean;
}
