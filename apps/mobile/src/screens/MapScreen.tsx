import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import MapView, {Region} from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { useUserLocation } from '../hooks/userLocation';
import { Button, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { GreenAreaLayer } from '../components/GreenAreaLayer';


type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const { location, loading } = useUserLocation();

  const roadFIll = "#e4ac81"
  const roadOutline = "#000000"

  const waterFIll = "#00D4D5"
  const forestFIll = "#ffffff"
  const lawnFill = "#858611"
  const parkFill =  "#FFC052"

  const mapStyle = [
    {
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": roadFIll
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": roadOutline
        },
        {
          "weight": 0.5
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": waterFIll
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": forestFIll
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": parkFill
        }
      ]
    }
  ]

  const initialRegion = location
    ? { ...location, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : {
        latitude: 59.334591,
        longitude: 18.06324,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  const onBack = () => navigation.navigate('Welcome');

  /*{location &&(
          <GreenAreaLayer
            lat={location.latitude}
            lng={location.longitude}
            radius={1000}
          />
        )}*/

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <MapView
        style={StyleSheet.absoluteFill}
        provider="google"
        customMapStyle={mapStyle}
        showsBuildings={false}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
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
