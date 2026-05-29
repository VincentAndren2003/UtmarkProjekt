import { Checkpoint } from './checkpoint';
import { GreenAreaCollection } from '../types';

export class Route {
  id: string;
  start: {
    latitude: number;
    longitude: number;
  };
  end: {
    latitude: number;
    longitude: number;
  };
  distance: number; // km t.ex 2, 5, 10
  checkpoints: Checkpoint[] = [];

  constructor(
    id: string,
    start: { latitude: number; longitude: number },
    distance: number,
    end?: { latitude: number; longitude: number }
  ) {
    this.id = id;
    this.start = start;
    this.distance = distance;
    this.end = end ?? this.randomOffset(start, 0.3, Math.random() * 360);
  }

  setCheckpoints(
    numCeckpoints: number = Math.round(this.distance / 1.25), // Math.trunc(this.distance * 1.5)
    bearing: number = 0,
    checkpointRadius: number = 20,
    greenAreas?: GreenAreaCollection
  ): Checkpoint[] {
    console.log('end:', this.end);
    this.checkpoints = [];
    const distancePerCheckpoint = this.distance / numCeckpoints;

    let currentPos = {
      latitude: this.start.latitude,
      longitude: this.start.longitude,
    };

    for (let i = 1; i <= numCeckpoints; i++) {
      let newCheckPoint: Checkpoint;
      let attempts = 0;
      const maxAttempts = 50;

      const progress = i / numCeckpoints;

      const isNearEnd = i > numCeckpoints - 2;
      do {
        const variedDistance =
          attempts < 30
            ? distancePerCheckpoint
            : distancePerCheckpoint * (0.5 + Math.random());
        if (isNearEnd) {
          const bearingToEnd = this.bearingBetween(currentPos, this.end);
          const maxNoise = i === numCeckpoints ? 10 : 22;
          const noise = Math.random() * maxNoise * 2 - maxNoise;
          bearing = (bearingToEnd + noise + 360) % 360;
        } else {
          bearing = Math.random() * 360; // Rikting på nästa checkpoint, helt slumpad
          //bearing += (Math.random()* 40 - 20) // Om snirklar åt samma håll
        }
        newCheckPoint = this.calculateCheckpoint(
          `checkpoint-${i}`,
          currentPos,
          variedDistance,
          bearing,
          checkpointRadius
        );
        attempts++;
      } while (
        greenAreas &&
        !this.checkpointLegal(newCheckPoint, greenAreas) &&
        attempts < 50
      );
      if (
        attempts >= maxAttempts &&
        greenAreas &&
        !this.checkpointLegal(newCheckPoint!, greenAreas)
      ) {
        console.warn(
          `Checkpoint ${i} kunde inte placeras inom grönt område efter ${maxAttempts} försök`
        );
      }

      this.checkpoints.push(newCheckPoint);
      currentPos = {
        latitude: newCheckPoint.coordinate.latitude,
        longitude: newCheckPoint.coordinate.longitude,
      };
    }
    return this.checkpoints;
  }

  private checkpointLegal(
    checkpoint: Checkpoint,
    greenAreas: GreenAreaCollection
  ): boolean {
    const { latitude, longitude } = checkpoint.coordinate;

    return greenAreas.features.some((feature) => {
      if (feature.geometry.type !== 'Polygon') return false;
      return feature.geometry.coordinates.some((ring) => {
        const r = ring as [number, number][];
        if (!this.pointInBoundingBox(latitude, longitude, r)) return false;
        return this.pointInPolygon(longitude, latitude, r);
      });
    });
  }

  private calculateCheckpoint(
    id: string,
    origin: { latitude: number; longitude: number },
    distanceKm: number,
    bearing: number,
    radius: number
  ): Checkpoint {
    const R = 6371; //jorden i km
    const bearingRad = (bearing * Math.PI) / 180;
    const lat1 = (origin.latitude * Math.PI) / 180;
    const long1 = (origin.longitude * Math.PI) / 180;
    const angularDistance = distanceKm / R;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
        Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
    );

    const long2 =
      long1 +
      Math.atan2(
        Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
      );

    const coordinate = {
      latitude: (lat2 * 180) / Math.PI,
      longitude: (long2 * 180) / Math.PI,
    };

    return new Checkpoint(id, coordinate, false, radius);
  }

  private randomOffset(
    origin: { latitude: number; longitude: number },
    distanceKm: number,
    bearing: number
  ): { latitude: number; longitude: number } {
    return this.calculateCheckpoint('temp', origin, distanceKm, bearing, 0)
      .coordinate;
  }

  private bearingBetween(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;
    const dLon = toRad(to.longitude - from.longitude);
    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);
    const x = Math.sin(dLon) * Math.cos(lat2);
    const y =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (toDeg(Math.atan2(x, y)) + 360) % 360;
  }

  private pointInBoundingBox(
    lat: number,
    lon: number,
    polygon: [number, number][]
  ): boolean {
    let minLat = polygon[0][1];
    let maxLat = polygon[0][1];
    let minLon = polygon[0][0];
    let maxLon = polygon[0][0];

    for (const [lng, lgt] of polygon) {
      if (lgt < minLat) minLat = lgt;
      if (lgt > maxLat) maxLat = lgt;
      if (lng < minLon) minLon = lng;
      if (lng > maxLon) maxLon = lng;
    }

    return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
  }

  private pointInPolygon(
    lon: number,
    lat: number,
    polygon: [number, number][]
  ): boolean {
    // Ray-casting algorithm for point-in-polygon test
    let isInside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];

      const intersect =
        yi > lat !== yj > lat &&
        lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersect) isInside = !isInside;
    }

    return isInside;
  }
}
