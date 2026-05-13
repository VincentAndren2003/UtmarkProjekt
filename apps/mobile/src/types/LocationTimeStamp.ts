export interface LocationTimeStamp {
    lat: number;
    long: number;
    timeStamp: number;
}

export interface CheckpointTimeStamp extends LocationTimeStamp {
    checkpointId: number;
}

export interface RunSession {
    routeId: string;
    startTime: number;
    movement: LocationTimeStamp[];
    checkpoints: CheckpointTimeStamp[];
}