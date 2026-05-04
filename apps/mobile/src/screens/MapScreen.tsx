import React, { useState } from 'react';
import { View, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { useUserLocation } from '../hooks/userLocation';
import { Button, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { GreenAreaLayer } from '../components/GreenAreaLayer';
import { GeneratedRouteLayer } from '../components/GeneratedRouteLayer'; // Importera ditt nya layer

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const { location, loading } = useUserLocation();
  const [showRoute, setShowRoute] = useState(false);

  const initialRegion = location
    ? { ...location, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : {
        latitude: 59.334591,
        longitude: 18.06324,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  const onBack = () => navigation.navigate('Welcome');

  const handleGenerateRoute = () => setShowRoute(true);

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
        {showRoute && (
          <GeneratedRouteLayer 
            startLat={59.4036} 
            startLong={17.9418} 
            distance={5} // Du kan ändra distansen här
          />
        )}
      </MapView>
      <TouchableOpacity style = {styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>Tillbaka</Text>
      </TouchableOpacity>

      <TouchableOpacity style = {styles.generateButton} onPress={handleGenerateRoute}>
        <Text style = {styles.generateText}>Generera rutt</Text>
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
    elevation: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Styling för den nya knappen
  generateButton: {
    position: 'absolute',
    bottom: 40, // Lägger den längst ner
    alignSelf: 'center', // Centrerar knappen horisontellt
    backgroundColor: '#3b82f6', // En snygg blå färg
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30, // Mer rundad knapp
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  generateText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


