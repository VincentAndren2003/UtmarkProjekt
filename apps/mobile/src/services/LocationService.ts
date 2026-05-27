import * as Location from 'expo-location';
import {
  LocationTimeStamp,
  CheckpointTimeStamp,
  RunSession,
} from '../types/navigation';

class LocationService {
  private locationTimeStamps: LocationTimeStamp[] = [];
  private checkpointTimeStamps: CheckpointTimeStamp[] = [];

  private routeId: string = '';
  private subsciption: Location.LocationSubscription | null = null;

  public start(subsciption: Location.LocationSubscription, routeId: string) {
    this.subsciption = subsciption;
    this.routeId = routeId;
  }

  public addPoint(point: LocationTimeStamp): void {
    this.locationTimeStamps.push(point);
  }

  public addCheckpoint(checkpointId: string, lat: number, long: number): void {
    this.checkpointTimeStamps.push({
      checkpointId,
      lat,
      long,
      timeStamp: Date.now(),
    });
  }

  public getRunSession(): RunSession {
    return {
      routeId: this.routeId,
      movement: [...this.locationTimeStamps],
      checkpoints: [...this.checkpointTimeStamps],
    };
  }

  /** Stop recording GPS track points; keep session data for run completion. */
  public pause(): void {
    if (this.subsciption) {
      this.subsciption.remove();
      this.subsciption = null;
    }
  }

  public clear(): void {
    this.locationTimeStamps = [];
    this.checkpointTimeStamps = [];
    this.pause();
    this.routeId = '';
  }
}

export const locationService = new LocationService();
