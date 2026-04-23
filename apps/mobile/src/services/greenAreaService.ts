import { GreenAreaCollection } from '../types/greenArea';

const API_URL = 'http://192.168.0.153:3000';

export async function fetchGreenAreas(
  lat: number,
  lng: number,
  radius: number = 1000
): Promise<GreenAreaCollection> {
  const res = await fetch(
    `${API_URL}/api/green-areas?lat=${lat}&lng=${lng}&radius=${radius}`
  );

  if (!res.ok) {
    throw new Error(`API svarade med status: ${res.status}`);
  }

  return res.json();
}
