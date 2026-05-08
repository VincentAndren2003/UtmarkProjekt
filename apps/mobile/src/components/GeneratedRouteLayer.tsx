import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Polyline, Marker} from 'react-native-maps';
import { RouteResponse } from '../types/route';

type Props = {
  route: RouteResponse;
};

export function GeneratedRouteLayer({ route }: Props) {
  return (
    <>
      <Polyline
        coordinates={route.checkpoints.map((cp) => cp.coordinate)}
        strokeColor="#BA55A0"
        strokeWidth={5}
        lineJoin="round"
        zIndex={3}
      />
      {route.checkpoints.map((checkpoint, index) => (
        <Marker
          key={checkpoint.id}
          coordinate={checkpoint.coordinate}
          anchor={{ x: 0.35, y: 0.5 }}
          zIndex={2}
        >
          <View style={styles.markerWrapper}>
            <View style={styles.circle} />
            <Text style={styles.label}>{index + 1}</Text>
          </View>
        </Marker>
      ))}
    </>
  ); 
}

const styles = StyleSheet.create({
  markerWrapper: {
    paddingRight: 20, 
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#BA55A0',
  },
  label: {
    position: 'absolute',
    color: '#BA55A0',
    fontWeight: 'bold',
    fontSize: 20,
    transform: [{ translateX: 12 }, { translateY: -18 }], 
  },
});