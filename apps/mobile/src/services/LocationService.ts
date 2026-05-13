import * as Location from 'expo-location';
import {LocationTimeStamp} from '../types/LocationTimeStamp'

class LocationService {
    private locationTimeStamp: LocationTimeStamp[] = [];
    private subsciption: Location.LocationSubscription | null = null;

    public start (subsciption: Location.LocationSubscription) {
        this.subsciption = subsciption;
    }

    public addPoint(point: LocationTimeStamp) : void {
        this.locationTimeStamp.push(point);

        console.log(`[Service] Total points: ${this.locationTimeStamp.length}`);
    }

    public getData(): LocationTimeStamp[]{
        return [...this.locationTimeStamp];
    }

    public clear(): void {
        this.locationTimeStamp = [];
        if (this.subsciption) {
            this.subsciption.remove();
            this.subsciption = null;
        }
    }


}

export const locationService = new LocationService();