import { useEffect, useState } from 'react';
import { Circle, Polyline } from 'react-native-maps';
import { generateRoute } from '../lib/api'; // från api callet
import { RouteResponse } from '../types/route';

type Props = {
  startLat: number;
  startLong: number;
  distance: number;
};

export function GeneratedRouteLayer({ startLat, startLong, distance }: Props) {
  const [route, setRoute] = useState<RouteResponse | null>(null);

  useEffect(() => {
    generateRoute({ latitude: startLat, longitude: startLong }, distance)
      .then((data) => setRoute(data))
      .catch((err) => console.error('Rutt kunnde inte genegeras: ', err));
  }, [startLat, startLong, distance]);

  if (!route) return null;

  return (
    <>
      <Polyline
        coordinates={route.checkpoints.map((cp) => cp.coordinate)}
        strokeColor="#BA55A0"
        strokeWidth={5}
      />
      {route.checkpoints.map((checkpoint) => (
        <Circle
          key={checkpoint.id}
          center={checkpoint.coordinate}
          radius={checkpoint.radius}
          strokeColor="#BA55A0"
          strokeWidth={3}
        />
      ))}
    </>
  );
}
