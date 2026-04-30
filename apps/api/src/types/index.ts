export interface OverpassElement {
  type: 'way' | 'relation';
  id: number;
  tags?: {
    name?: string;
    leisure?: string;
    landuse?: string;
    natural?: string;
  };
  geometry?: Array<{ lat: number; lon: number }>;
  members?: Array<{
    role: string;
    geometry: Array<{ lat: number; lon: number }>;
  }>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface GreenAreaProperties {
  name: string;
  type: string;
}

export interface GreenAreaCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: GreenAreaProperties;
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
  }>;
}
