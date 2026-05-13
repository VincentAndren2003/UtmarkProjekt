import * as Location from 'expo-location';
import {LocationTimeStamp, CheckpointTimeStamp, RunSession} from '../types/navigation'

class LocationService {
    private locationTimeStamps: LocationTimeStamp[] = [];
    private checkpointTimeStamps: CheckpointTimeStamp[] = [];
    
    private routeId: string = "";
    private subsciption: Location.LocationSubscription | null = null;

    public start (subsciption: Location.LocationSubscription, routeId: string) {
        this.subsciption = subsciption;
        this.routeId = routeId;

        console.log(`[Service] Started recording for route: ${routeId}`);
    }

    public addPoint(point: LocationTimeStamp) : void {
        this.locationTimeStamps.push(point);

        console.log(`[Service] Total points: ${this.locationTimeStamps.length}`);
    }

    public addCheckpoint(checkpointId: string, lat: number, long: number) :void{
        this.checkpointTimeStamps.push({
            checkpointId,
            lat,
            long,
            timeStamp: Date.now(),
        })
        console.log(`[Service] Checkpoint ${checkpointId} recorded.`);
    }

    public getRunSession(): RunSession{
        return {
            routeId: this.routeId,
            movement: [...this.locationTimeStamps],
            checkpoints: [...this.checkpointTimeStamps],
        };
    }

    public clear(): void {
        this.locationTimeStamps = [];
        if (this.subsciption) {
            this.subsciption.remove();
            this.subsciption = null;
        }
    }


}

export const locationService = new LocationService();