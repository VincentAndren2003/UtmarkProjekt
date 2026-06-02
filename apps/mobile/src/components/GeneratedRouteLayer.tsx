import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Polyline, Marker, Circle, Polygon } from 'react-native-maps';
import { RouteResponse, Coordinate } from '../types/route';

type Props = {
  route: RouteResponse;
};

const COLOR = '#BA55A0';
const TRIANGLE_SIZE_METERS = 15;

function bearing(from: Coordinate, to: Coordinate): number {
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

function offsetCoordinate(
  origin: Coordinate,
  distanceMeters: number,
  bearingDeg: number
): Coordinate {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const d = distanceMeters / R;
  const b = toRad(bearingDeg);
  const lat1 = toRad(origin.latitude);
  const lon1 = toRad(origin.longitude);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(b) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { latitude: toDeg(lat2), longitude: toDeg(lon2) };
}

function triangleCoordinates(
  center: Coordinate,
  sizeMeter: number,
  pointingBearingDeg: number
): Coordinate[] {
  const tip = offsetCoordinate(center, sizeMeter, pointingBearingDeg);
  const left = offsetCoordinate(
    center,
    sizeMeter,
    (pointingBearingDeg + 120) % 360
  );
  const right = offsetCoordinate(
    center,
    sizeMeter,
    (pointingBearingDeg + 240) % 360
  );
  return [tip, left, right];
}

export function GeneratedRouteLayer({ route }: Props) {
  const { start, checkpoints } = route;

  const startBearing =
    checkpoints.length > 0 ? bearing(start, checkpoints[0].coordinate) : 0;

  const triangleCoords = triangleCoordinates(
    start,
    TRIANGLE_SIZE_METERS,
    startBearing
  );

  const triangleTip = offsetCoordinate(
    start,
    TRIANGLE_SIZE_METERS,
    startBearing
  );

  const polylineCoords = [
    triangleTip,
    ...checkpoints.map((cp) => cp.coordinate),
  ];

  return (
    <>
      <Polyline
        coordinates={polylineCoords}
        strokeColor={COLOR}
        strokeWidth={2}
        lineJoin="round"
        zIndex={3}
      />

      {/* Start triangle */}
      <Polygon
        coordinates={triangleCoords}
        strokeColor={COLOR}
        strokeWidth={2}
        fillColor="transparent"
        zIndex={2}
      />

      {/* Checkpoints och mål */}
      {checkpoints.map((checkpoint, index) => {
        const isFinish = index === checkpoints.length - 1;
        const number = index + 1;

        return (
          <React.Fragment key={checkpoint.id}>
            {/* Yttre cirkel för alla checkpoints */}
            <Circle
              center={checkpoint.coordinate}
              radius={checkpoint.radius}
              strokeColor={COLOR}
              strokeWidth={2}
              fillColor="transparent"
              zIndex={2}
            />
            {/* Extra inre cirkel för mål */}
            {isFinish && (
              <Circle
                center={checkpoint.coordinate}
                radius={checkpoint.radius * 1.5}
                strokeColor={COLOR}
                strokeWidth={2}
                fillColor="transparent"
                zIndex={2}
              />
            )}
            {/* Nummer-label */}
            {!isFinish && (
              <Marker
                coordinate={checkpoint.coordinate}
                anchor={{ x: 0, y: 0.8 }}
                zIndex={4}
              >
                <View style={{ padding: 4 }}>
                  <Text style={styles.label}>{number}</Text>
                </View>
              </Marker>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: COLOR,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
