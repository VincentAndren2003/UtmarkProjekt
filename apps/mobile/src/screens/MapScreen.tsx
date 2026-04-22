import { Button, StyleSheet, View, Text } from 'react-native';
import React from "react";
import { Map } from "@maplibre/maplibre-react-native";


type Props = {
  onBack: () => void;
};


export function MapScreen({ onBack }: Props) {

  const mapTilerKey = process.env.EXPO_PUBLIC_MAPTILER_KEY;

  if (!mapTilerKey) {
    return (
      <View>
        <Text>Missing MapTiler Key. Check your .env file.</Text>
      </View>
    );
  }

  const styleURL = `https://api.maptiler.com/maps/openstreetmap/style.json?key=${mapTilerKey}`;

  return (
    <>
          <Map mapStyle={styleURL}/>
          <Button title="Back" onPress={onBack} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tag: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});