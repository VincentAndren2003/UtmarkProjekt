export interface GreenAreaProperties {
  name: string;
  type: string;
}

export interface GreenAreaFeature {
  type: 'Feature';
  properties: GreenAreaProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface GreenAreaCollection {
  type: 'FeatureCollection';
  features: GreenAreaFeature[];
}
