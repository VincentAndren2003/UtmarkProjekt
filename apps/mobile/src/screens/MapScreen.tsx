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
