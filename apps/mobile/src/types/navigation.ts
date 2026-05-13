export interface LocationTimeStamp {
  lat: number;
  long: number;
  timeStamp: number;
}

export interface CheckpointTimeStamp {
  checkpointId: string;
  lat: number;
  long: number;
  timeStamp: number;
}

export interface RunSession {
  routeId: string;
  movement: LocationTimeStamp[];
  checkpoints: CheckpointTimeStamp[];
}
