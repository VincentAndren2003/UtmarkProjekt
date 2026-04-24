import {
  OverpassResponse,
  OverpassElement,
  GreenAreaCollection,
} from '../types';

export class GreenAreaService {
  private buildQuery(lat: number, lng: number, radius: number): string {
    return `[out:json];
      (
        way["leisure"="park"](around:${radius},${lat},${lng});
        way["landuse"="forest"](around:${radius},${lat},${lng});
        way["landuse"="grass"](around:${radius},${lat},${lng});
        way["natural"="wood"](around:${radius},${lat},${lng});
      );
      out geom;`;
  }

  async fetchGreenAreas(
    lat: number,
    lng: number,
    radius: number
  ): Promise<GreenAreaCollection> {
    const query = this.buildQuery(lat, lng, radius);

    console.log('Skickar query:', query);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'UtmarkProjekt/1.0',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const text = await response.text();
      console.error('Response body: ', text);
      throw new Error(`Overpass API status: ${response.status}`);
    }

    const data: OverpassResponse = await response.json();
    return this.toGeoJSON(data);
  }

  private toGeoJSON(data: OverpassResponse): GreenAreaCollection {
    return {
      type: 'FeatureCollection',
      features: data.elements
        .filter((el) => el.geometry?.length > 0)
        .map((el) => this.elementToFeature(el)),
    };
  }

  private elementToFeature(el: OverpassElement) {
    return {
      type: 'Feature' as const,
      properties: {
        name: el.tags?.name || 'Grönområde',
        type:
          el.tags?.leisure || el.tags?.landuse || el.tags?.natural || 'unknown',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [el.geometry.map((p) => [p.lon, p.lat])],
      },
    };
  }
}
