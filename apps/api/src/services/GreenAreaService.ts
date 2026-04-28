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
          way["leisure"="garden"](around:${radius},${lat},${lng});
          way["leisure"="nature_reserve"](around:${radius},${lat},${lng});
          way["landuse"="forest"](around:${radius},${lat},${lng});
          way["landuse"="grass"](around:${radius},${lat},${lng});
          way["landuse"="meadow"](around:${radius},${lat},${lng});
          way["landuse"="village_green"](around:${radius},${lat},${lng});
          way["natural"="wood"](around:${radius},${lat},${lng});
          way["natural"="scrub"](around:${radius},${lat},${lng});
          way["natural"="grassland"](around:${radius},${lat},${lng});
          relation["leisure"="park"](around:${radius},${lat},${lng});
          relation["leisure"="nature_reserve"](around:${radius},${lat},${lng});
          relation["landuse"="forest"](around:${radius},${lat},${lng});
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
        .filter((el) => {
          if (el.type === 'way') return el.geometry && el.geometry.length > 0;
          if (el.type === 'relation')
            return el.members && el.members.length > 0;
          return false;
        })
        .map((el) => this.elementToFeature(el))
        .filter(Boolean) as any,
    };
  }

  private elementToFeature(el: OverpassElement) {
    let coordinates;

    if (el.type === 'way') {
      coordinates = [el.geometry!.map((p) => [p.lon, p.lat])];
    } else if (el.type === 'relation') {
      const outerMembers = el.members?.filter(
        (m) => m.role === 'outer' && m.geometry?.length > 0
      );
      if (!outerMembers?.length) return null;
      coordinates = outerMembers.map((m) =>
        m.geometry.map((p) => [p.lon, p.lat])
      );
    } else {
      return null;
    }

    return {
      type: 'Feature' as const,
      properties: {
        name: el.tags?.name || 'Grönområde',
        type:
          el.tags?.leisure || el.tags?.landuse || el.tags?.natural || 'unknown',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates,
      },
    };
  }
}
