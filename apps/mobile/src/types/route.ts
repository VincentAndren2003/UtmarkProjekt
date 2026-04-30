export type Coordinate = { latitude: number; longitude: number };

export type Checkpoint = {
  id: string;
  coordinate: Coordinate;
  radius: number;
  completed: boolean;
};

export type RouteResponse = {
  id: string;
  start: Coordinate;
  distance: number;
  checkpoints: Checkpoint[];
};