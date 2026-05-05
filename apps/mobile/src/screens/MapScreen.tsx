import React from 'react';
import { View, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { useUserLocation } from '../hooks/userLocation';
import { Button, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { GreenAreaLayer } from '../components/GreenAreaLayer';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const { location, loading } = useUserLocation();

  const mapStyle = [{
  "variant": "light",
  "styles": [
    {
      "id": "infrastructure.building",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#000000",
        "strokeWidth": 0
      }
    },
    {
      "id": "infrastructure.businessCorridor",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#e3a991"
      }
    },
    {
      "id": "infrastructure.roadNetwork.noTraffic",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#000000"
      }
    },
    {
      "id": "infrastructure.roadNetwork.noTraffic.trail.paved",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#000000",
        "strokeOpacity": 0,
        "strokeColor": "#000000"
      }
    },
    {
      "id": "infrastructure.roadNetwork.noTraffic.trail.unpaved",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#000000",
        "strokeOpacity": 0,
        "strokeColor": "#000000",
        "strokeWidth": 0
      }
    },
    {
      "id": "infrastructure.roadNetwork.ramp",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#e3a991",
        "strokeOpacity": 1,
        "strokeColor": "#000000"
      }
    },
    {
      "id": "infrastructure.roadNetwork.road.arterial",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#e3a991",
        "strokeOpacity": 1,
        "strokeColor": "#000000"
      }
    },
    {
      "id": "infrastructure.roadNetwork.road.highway",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#e3a991",
        "strokeOpacity": 1,
        "strokeColor": "#000000"
      }
    },
    {
      "id": "infrastructure.roadNetwork.road.local",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#e3a991",
        "strokeOpacity": 1,
        "strokeColor": "#000000",
        "strokeWidth": 0.5
      }
    },
    {
      "id": "infrastructure.roadNetwork.road.noOutlet",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#e3a991",
        "strokeOpacity": 1,
        "strokeColor": "#000000",
        "strokeWidth": 0.5
      }
    },
    {
      "id": "infrastructure.roadNetwork.roadDetail.directionArrow",
      "label": {
        "visible": false,
        "pinFillColor": "#000000"
      }
    },
    {
      "id": "infrastructure.roadNetwork.roadDetail.intersection",
      "label": {
        "visible": true
      }
    },
    {
      "id": "infrastructure.roadNetwork.roadDetail.marking",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#000000"
      }
    },
    {
      "id": "infrastructure.roadNetwork.roadDetail.marking.crosswalk",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#000000"
      }
    },
    {
      "id": "infrastructure.roadNetwork.roadDetail.sidewalk",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#e3a991"
      }
    },
    {
      "id": "infrastructure.roadNetwork.roadDetail.surface",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#e3a991"
      }
    },
    {
      "id": "infrastructure.urbanArea",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#979715"
      }
    },
    {
      "id": "natural.base",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#ffffff"
      }
    },
    {
      "id": "natural.land.landCover.crops",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#ffffff"
      }
    },
    {
      "id": "natural.land.landCover.dryCrops",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#a8f17a"
      }
    },
    {
      "id": "natural.land.landCover.forest",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#ffffff"
      }
    },
    {
      "id": "natural.land.landCover.shrub",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#ffcc32"
      }
    },
    {
      "id": "natural.water",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#5ae4e4"
      }
    },
    {
      "id": "pointOfInterest.emergency.hospital",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#e3a991"
      }
    },
    {
      "id": "pointOfInterest.other.cemetery",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#ffffff"
      }
    },
    {
      "id": "pointOfInterest.recreation.golfCourse",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#eebd31"
      }
    },
    {
      "id": "pointOfInterest.recreation.park",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#ffcc32"
      }
    },
    {
      "id": "pointOfInterest.recreation.sportsComplex",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#ffcc32"
      }
    },
    {
      "id": "pointOfInterest.recreation.sportsField",
      "geometry": {
        "fillOpacity": 1,
        "fillColor": "#ffcc32"
      }
    }
  ]
}];


  const initialRegion = location
    ? { ...location, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : {
        latitude: 59.334591,
        longitude: 18.06324,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  const onBack = () => navigation.navigate('Welcome');

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <MapView
        style={StyleSheet.absoluteFill}
        provider="google"
        //googleMapId='109a430d0b2b53dcfe56cca2'
        customMapStyle={mapStyle}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {location && (
          <GreenAreaLayer
            lat={location.latitude}
            lng={location.longitude}
            radius={1000}
          />
        )}
      </MapView>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Tillbaka</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
