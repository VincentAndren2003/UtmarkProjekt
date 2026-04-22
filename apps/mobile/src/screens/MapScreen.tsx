import { Button, StyleSheet, View, Text } from 'react-native';
import React from "react";
import { Map } from "@maplibre/maplibre-react-native";


type Props = {
  onBack: () => void;
};


export function MapScreen({ onBack }: Props) {

  const styleURL = `https://api.maptiler.com/maps/openstreetmap/style.json?key=ZPN1SxMgWS3XlFH6mtlz`;

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