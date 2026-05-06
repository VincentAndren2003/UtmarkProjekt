import { Button, StyleSheet, View, Text } from 'react-native';
import React from 'react';
import {
  Camera,
  Map,
  GeoJSONSource,
  Layer,
  Images,
} from '@maplibre/maplibre-react-native';
import { useCompassHeading } from '../hooks/userCompassHeading';

type Props = {
  onBack: () => void;
  courseGeoJSON: any;
};

export function OrienteeringMapScreen({ onBack, courseGeoJSON }: Props) {
  const heading = useCompassHeading();
  const ISOM_PURPLE = '#f94edf';

  const mapTilerKey = process.env.EXPO_PUBLIC_MAPTILER_KEY;

  if (!mapTilerKey) {
    return (
      <View>
        <Text>Missing MapTiler Key. Add to .env file.</Text>
      </View>
    );
  }

  const styleURL = `https://api.maptiler.com/maps/openstreetmap/style.json?key=${mapTilerKey}`;

return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Map
          mapStyle={styleURL}
          contentInset={{ top: 16, right: 16, bottom: 16, left: 16 }}
        >
          <Camera
            zoom={10}
            center={[18.0656, 59.3327]} //Koordinater för stockholm (hårdkodad test)
          />
          <GeoJSONSource id="course-source" data={courseGeoJSON}>
            {/* -- Connecting Line -- */}
            <Layer
              type="line"
              id="course-line"
              filter={['==', ['get', 'type'], 'route-line']}
              style={{
                lineColor: ISOM_PURPLE,
                lineWidth: 2,
                lineJoin: 'round',
              }}
            />
            {/* -- Kontroller -- */}
            <Layer
              type="circle"
              id="control-rings"
              filter={['==', ['get', 'type'], 'control']}
              style={{
                circleRadius: 18,
                circleColor: 'transparent',
                circleStrokeWidth: 2,
                circleStrokeColor: ISOM_PURPLE,
              }}
            />
            <Layer
              type="symbol"
              id="control-numbers"
              filter={['==', ['get', 'type'], 'control']}
              style={{
                textField: ['get', 'number'],
                textSize: 22,
                textColor: ISOM_PURPLE,
                textAnchor: 'bottom-left',
                textOffset: [0.75, -0.75],
                textHaloColor: '#FFFFFF',
                textHaloWidth: 1,
              }}
            />
            {/* -- Finnish -- */}
            {/* Outer Circle */}
            <Layer
              type="circle"
              id="finish-outer"
              filter={['==', ['get', 'type'], 'finish']}
              style={{
                circleRadius: 18,
                circleColor: 'transparent',
                circleStrokeWidth: 2,
                circleStrokeColor: ISOM_PURPLE,
              }}
            />
            {/* Inner Circle */}
            <Layer
              type="circle"
              id="finish-inner"
              filter={['==', ['get', 'type'], 'finish']}
              style={{
                circleRadius: 12,
                circleColor: 'transparent',
                circleStrokeWidth: 2,
                circleStrokeColor: ISOM_PURPLE,
              }}
            />
            {/* -- Start -- */}
            <Layer
              type="symbol"
              id="start-triangle-layer"
              filter={['==', ['get', 'type'], 'start']}
              style={{
                textField: '▲',
                textSize: 32,
                textColor: 'transparent',
                textHaloColor: ISOM_PURPLE,
                textHaloWidth: 2,
              }}
            />
          </GeoJSONSource>
        </Map>

        {/* Kompass */}
        <View style={styles.compass}>
          <View style={[
            styles.compassInner,
            { transform: [{ rotate: `${-heading}deg` }] }
          ]}>
            <Text style={styles.compassArrow}>↑</Text>
          </View>
          <Text style={styles.compassLabel}>N</Text>
        </View>

      </View>
      <View style={styles.menu}>
        <Button title="Back" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    width: '100%',
    height: '100%',
  },
  menu: {
    bottom: 10,
    position: 'absolute',
  },
    compass: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'white',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  compassInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassArrow: {
    fontSize: 24,
    color: '#e53e3e',
    fontWeight: 'bold',
    lineHeight: 26,
  },
  compassLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    marginTop: -2,
  },
});
