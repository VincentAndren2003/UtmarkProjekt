// hooks/useTracking.ts
import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { locationService } from '../services/LocationService';

export const useTracking = () => {
    const [isTracking, setIsTracking] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const startTracking = useCallback(async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }
    
        setIsTracking(true);

        const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 5000,
                distanceInterval: 0,
            },
            (location) => {
                locationService.addPoint({
                    lat: location.coords.latitude,
                    long: location.coords.longitude,
                    timeStamp: location.timestamp,
                });
            }
        );
        locationService.start(sub);
    }, []);

    const stopTracking = useCallback(() => {
        locationService.clear();
        setIsTracking(false);
    }, []);

    return {
        isTracking,
        startTracking,
        stopTracking,
        getResults: () => locationService.getData(),
        errorMsg
    };
};