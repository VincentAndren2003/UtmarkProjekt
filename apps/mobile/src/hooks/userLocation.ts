import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type UseUserLocationResult = {
  location: Coordinate | null;
  error: string | null;
  loading: boolean;
};

export function useUserLocation() {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Platstillstånd nekades. Aktivera det i inställningarna.');
          setLoading(false);
          return;
        }

        // Get initial position fast
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: initial.coords.latitude,
          longitude: initial.coords.longitude,
        });
        setLoading(false);

        // Then watch for updates
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5, // meters
          },
          (pos) => {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          }
        );
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return { location, error, loading };
}
