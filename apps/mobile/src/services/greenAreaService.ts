import { GreenAreaCollection } from '../types/greenArea';
import { API_URL } from '../config/env';

export async function fetchGreenAreas(
  lat: number,
  lng: number,
  radius: number = 1000
): Promise<GreenAreaCollection> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const res = await fetch(
    `${API_URL}/api/green-areas?lat=${lat}&lng=${lng}&radius=${radius}`,
    {
      signal: controller.signal,
    }
  );

  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`API responded with status: ${res.status}`);
  }
  return res.json();
}
