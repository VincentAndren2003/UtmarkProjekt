import React, { useEffect, useState } from 'react';
import { Polygon } from 'react-native-maps';
import { fetchGreenAreas } from '../services/greenAreaService';
import { GreenAreaCollection } from '../types/greenArea';

type Props = {
  lat: number;
  lng: number;
  radius?: number;
};

export function GreenAreaLayer({ lat, lng, radius = 1000 }: Props) {
  const [greenAreas, setGreenAreas] = useState<GreenAreaCollection | null>(
    null
  );

  useEffect(() => {
    console.log('Hämtar grönområden för:', lat, lng, radius);
    fetchGreenAreas(lat, lng, radius)
      .then((data) => {
        console.log('Antal grönområden:', data.features.length);
        console.log('Första feature:', JSON.stringify(data.features[0]));
        setGreenAreas(data);
      })
      .catch((err) => console.error('Kunde inte hämta grönområden:', err));
  }, [lat, lng, radius]);

  if (!greenAreas) return null;

  return (
    <>
      {greenAreas.features.map((feature, index) => {
        const coordinates = feature.geometry.coordinates[0].map(
          ([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          })
        );

        return (
          <Polygon
            key={index}
            coordinates={coordinates}
            fillColor="rgba(34, 197, 94, 0.4)"
            strokeColor="#16a34a"
            strokeWidth={1.5}
          />
        );
      })}
    </>
  );
}
