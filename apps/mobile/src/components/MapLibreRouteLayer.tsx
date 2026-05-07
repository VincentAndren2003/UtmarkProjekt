import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { RouteResponse } from '../types/route';

type Props = {
  route: RouteResponse;
};

export function MapLibreRouteLayer({ route }: Props) {
  return (
    <GeoJSONSource
      id="checkpoints-source"
      data={{
        type: 'FeatureCollection',
        features: route.checkpoints.map((cp, index) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [cp.coordinate.longitude, cp.coordinate.latitude],
          },
          properties: { number: index + 1 },
        })),
      }}
    >
      <Layer
        type="circle"
        id="checkpoint-circles"
        style={{
          circleRadius: 18,
          circleColor: 'transparent',
          circleStrokeWidth: 2,
          circleStrokeColor: '#f94edf',
        }}
      />
      <Layer
        type="symbol"
        id="checkpoint-numbers"
        style={{
          textField: ['get', 'number'],
          textSize: 22,
          textColor: '#f94edf',
          textHaloColor: '#FFFFFF',
          textHaloWidth: 1,
        }}
      />
    </GeoJSONSource>
  );
}